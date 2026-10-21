import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { StudentProfile, AcademicYear } from '../types';
import { getStudentProfile, createStudentProfile, updateStudentProfile } from '../services/profileService';
import { api, getToken, setToken } from '../lib/api';
export interface SignupData { displayName: string; email: string; college: string; degree: string; branch: string; academicYear: AcademicYear; semester: number; }
export interface AppUser { uid: string; email: string; displayName: string; photoURL?: string; }
interface AuthContextType { signInWithGoogle:()=>Promise<void>; user: AppUser | null; profile: StudentProfile | null; loading: boolean; profileLoading: boolean; loginWithEmail: (email:string, pass:string)=>Promise<void>; signupWithEmail:(email:string,pass:string,data:SignupData)=>Promise<void>; resetPassword:(email:string)=>Promise<void>; logout:()=>Promise<void>; refreshProfile:()=>Promise<void>; updateProfile:(data:Partial<Omit<StudentProfile,'uid'|'email'|'createdAt'>>)=>Promise<void>; }
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
 const [user,setUser]=useState<AppUser|null>(null); const [profile,setProfile]=useState<StudentProfile|null>(null); const [loading,setLoading]=useState(true); const [profileLoading,setProfileLoading]=useState(false);
 const loadProfile=async (u:AppUser)=>{setProfileLoading(true);try{let p=await getStudentProfile(u.uid);if(!p){p={uid:u.uid,displayName:u.displayName||'Student',email:u.email,college:'Engineering Institute of Technology',degree:'B.Tech',branch:'CSE',academicYear:'Year I',semester:1,interests:[],skills:[],bio:'',photoURL:u.photoURL||'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};await createStudentProfile(p);}setProfile(p);}finally{setProfileLoading(false);}};
 useEffect(()=>{const params=new URLSearchParams(window.location.search);const oauthToken=params.get('authToken');if(oauthToken){setToken(oauthToken);window.history.replaceState({},document.title,window.location.pathname);}if(!getToken()){setLoading(false);return;}api<{user:AppUser}>('/api/auth/me').then(async r=>{setUser(r.user);await loadProfile(r.user);}).catch(()=>{setToken(null);setUser(null);setProfile(null);}).finally(()=>setLoading(false));},[]);
 const signInWithGoogle=async()=>{window.location.assign('/api/auth/google');};
 const loginWithEmail=async(email:string,pass:string)=>{const r=await api<{token:string;user:AppUser}>('/api/auth/login',{method:'POST',body:JSON.stringify({email:email.trim(),password:pass})});setToken(r.token);setUser(r.user);await loadProfile(r.user);};
 const signupWithEmail=async(email:string,pass:string,data:SignupData)=>{const r=await api<{token:string;user:AppUser}>('/api/auth/register',{method:'POST',body:JSON.stringify({...data,email:email.trim(),password:pass})});setToken(r.token);setUser(r.user);await loadProfile(r.user);};
 const resetPassword=async(email:string)=>{await api('/api/auth/forgot-password',{method:'POST',body:JSON.stringify({email:email.trim()})});};
 const logout=async()=>{setToken(null);setUser(null);setProfile(null);};
 const refreshProfile=async()=>{if(user)await loadProfile(user);};
 const updateProfileHandler=async(data:Partial<Omit<StudentProfile,'uid'|'email'|'createdAt'>>)=>{
    if(!user) throw new Error('Not authenticated');
    await updateStudentProfile(user.uid,data);
    // Re-read the saved document so the UI reflects exactly what MongoDB persisted.
    const saved=await getStudentProfile(user.uid);
    if(!saved) throw new Error('Profile was saved but could not be reloaded. Please refresh the page.');
    setProfile(saved);
  };
 return <AuthContext.Provider value={{user,profile,loading,profileLoading,signInWithGoogle,loginWithEmail,signupWithEmail,resetPassword,logout,refreshProfile,updateProfile:updateProfileHandler}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const c=useContext(AuthContext);if(!c)throw new Error('useAuth must be used within an AuthProvider');return c;}
