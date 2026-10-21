import { StudentProfile } from '../types';
import { api } from '../lib/api';

export async function getStudentProfile(uid: string): Promise<StudentProfile | null> {
  try {
    return await api<StudentProfile>('/api/profile/' + encodeURIComponent(uid));
  } catch (error: any) {
    if (String(error?.message || '').toLowerCase().includes('not found')) return null;
    throw error;
  }
}

export async function createStudentProfile(profile: StudentProfile): Promise<void> {
  await api('/api/profile', { method: 'POST', body: JSON.stringify(profile) });
}

export async function updateStudentProfile(
  uid: string,
  data: Partial<Omit<StudentProfile, 'uid' | 'email' | 'createdAt'>>
): Promise<void> {
  await api('/api/profile/' + encodeURIComponent(uid), {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
