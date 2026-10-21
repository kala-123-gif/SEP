import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BRANCHES, ACADEMIC_YEARS, AcademicYear, StudentProfile } from '../types';
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  BookOpen,
  Calendar,
  Sparkles,
  Edit3,
  Save,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Layers,
  Upload,
} from 'lucide-react';
import { uploadAvatar } from '../services/resourceService';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
];

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile, refreshProfile, profileLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Avatar image size must be under 5 MB.');
      return;
    }
    setUploadingAvatar(true);
    setErrorMessage(null);
    try {
      const url = await uploadAvatar(user.uid, file);
      setPhotoURL(url);
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setErrorMessage(err.message || 'Avatar upload failed. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('CSE');
  const [academicYear, setAcademicYear] = useState<AcademicYear>('Year I');
  const [semester, setSemester] = useState<number>(1);
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  // Tags
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');

  // Sync state from profile
  const syncFormFromProfile = (p: StudentProfile | null) => {
    if (!p) return;
    setDisplayName(p.displayName || '');
    setCollege(p.college || '');
    setDegree(p.degree || 'B.Tech');
    setBranch(p.branch || 'CSE');
    setAcademicYear(p.academicYear || 'Year I');
    setSemester(p.semester || 1);
    setBio(p.bio || '');
    setPhotoURL(p.photoURL || '');
    setSkills(p.skills || []);
    setInterests(p.interests || []);
  };

  useEffect(() => {
    // Load profile values while viewing; never overwrite fields during editing.
    if (profile && !isEditing) {
      syncFormFromProfile(profile);
    }
  }, [profile, isEditing]);

  const handleYearChange = (year: AcademicYear) => {
    setAcademicYear(year);
    const yrConfig = ACADEMIC_YEARS.find((y) => y.year === year);
    if (yrConfig && !yrConfig.semesters.includes(semester)) {
      setSemester(yrConfig.semesters[0]);
    }
  };

  const selectedYearConfig = ACADEMIC_YEARS.find((y) => y.year === academicYear);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (tagToRemove: string) => {
    setSkills(skills.filter((s) => s !== tagToRemove));
  };

  const handleAddInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (tagToRemove: string) => {
    setInterests(interests.filter((i) => i !== tagToRemove));
  };

  const handleCancel = () => {
    syncFormFromProfile(profile);
    setIsEditing(false);
    setErrorMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!college.trim()) {
      setErrorMessage('College / Institution is required.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateProfile({
        displayName: displayName.trim(),
        college: college.trim(),
        degree,
        branch,
        academicYear,
        semester: Number(semester),
        bio: bio.trim(),
        photoURL,
        skills,
        interests,
      });
      setIsEditing(false);
      setSuccessMessage('Student profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Notifications */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cover Header Banner */}
        <div className="h-40 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 relative">
          <div className="absolute right-6 bottom-4 z-30 flex items-center gap-2 pointer-events-auto">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setIsEditing(true);
                }}
                className="relative z-30 inline-flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold rounded-xl shadow-md transition backdrop-blur-sm cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-indigo-600" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black/40 hover:bg-black/60 text-white text-xs font-semibold rounded-xl backdrop-blur-sm transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
  type="submit"
  form="profile-edit-form"
  disabled={saving || uploadingAvatar}
  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition"
>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-6 sm:px-10 pb-10">
          {/* Avatar and Header Info */}
          <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <div className="relative group">
                <div className="w-28 h-28 rounded-3xl ring-4 ring-white shadow-xl overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-3xl">
                  {photoURL ? (
                    <img src={photoURL} alt="Student avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(displayName || user?.displayName || 'S').charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {displayName || 'Student Profile'}
                </h1>
                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {profile?.email || user?.email}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {branch}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {academicYear} • Semester {semester}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700">
                    {degree}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Avatar Preset & File Upload Selector (in Edit Mode) */}
          {isEditing && (
            <div className="mb-8 p-5 rounded-3xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Update Student Avatar Photo
              </label>

              {/* Upload custom image file */}
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-sm cursor-pointer transition">
                  {uploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  <span>{uploadingAvatar ? 'Uploading Image...' : 'Upload Image from Computer'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-400">JPG, PNG up to 5MB</span>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Or choose a preset student avatar:</p>
                <div className="flex items-center gap-3 overflow-x-auto pb-1 mb-2">
                  {AVATAR_PRESETS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPhotoURL(url)}
                      className={`w-12 h-12 rounded-2xl overflow-hidden border-2 shrink-0 transition ${
                        photoURL === url
                          ? 'border-indigo-600 ring-2 ring-indigo-400 scale-105'
                          : 'border-white opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="Or paste external image URL (https://...)"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          )}

          {/* Form / Details Body */}
          <form id="profile-edit-form" onSubmit={handleSave} className="space-y-8">
            {/* Academic Information */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Academic Background
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
  type="text"
  value={displayName}
  onChange={(e) => {
    console.log('Typing:', e.target.value);
    setDisplayName(e.target.value);
  }}
  readOnly={false}
  disabled={false}
  className="w-full px-3.5 py-2.5 bg-white border-2 border-red-500 rounded-xl text-sm text-black"
/>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                      {displayName}
                    </p>
                  )}
                </div>

                {/* College */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    College / University
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {college}
                    </p>
                  )}
                </div>

                {/* Degree */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Degree / Program
                  </label>
                  {isEditing ? (
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                    >
                      <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                      <option value="B.E.">B.E. (Bachelor of Engineering)</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="BCA">BCA / MCA</option>
                      <option value="B.Sc">B.Sc Computer Science</option>
                    </select>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                      {degree}
                    </p>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Engineering Branch
                  </label>
                  {isEditing ? (
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.code} - {b.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                      {BRANCHES.find((b) => b.code === branch)?.name || branch}
                    </p>
                  )}
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Academic Year
                  </label>
                  {isEditing ? (
                    <select
                      value={academicYear}
                      onChange={(e) => handleYearChange(e.target.value as AcademicYear)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                    >
                      {ACADEMIC_YEARS.map((y) => (
                        <option key={y.year} value={y.year}>
                          {y.year}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                      {academicYear}
                    </p>
                  )}
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Current Semester
                  </label>
                  {isEditing ? (
                    <select
                      value={semester}
                      onChange={(e) => setSemester(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                    >
                      {selectedYearConfig?.semesters.map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                      Semester {semester}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Biography */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                About Me
              </h3>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short summary of your academic interests, goals, or study topics..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                />
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed p-4 bg-slate-50/70 rounded-xl border border-slate-100">
                  {bio || 'No bio written yet. Click "Edit Profile" to add your introduction!'}
                </p>
              )}
            </div>

            {/* Skills & Competencies */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Technical Skills & Competencies
              </h3>

              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add a skill (e.g. C++, React, DSA, Python)..."
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {skills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
                ) : (
                  skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-600 focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Academic & Research Interests */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Areas of Interest
              </h3>

              {isEditing && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest();
                      }
                    }}
                    placeholder="Add an interest (e.g. Machine Learning, Cloud Architecture)..."
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {interests.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No interests listed yet.</p>
                ) : (
                  interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200/60"
                    >
                      {interest}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(interest)}
                          className="hover:text-rose-600 focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Save Action when in edit mode */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
