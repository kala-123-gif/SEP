
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BRANCHES,
  ACADEMIC_YEARS,
  AcademicYear,
  StudentProfile,
} from '../types';
import {
  Mail,
  Building2,
  GraduationCap,
  BookOpen,
  Sparkles,
  Edit3,
  Save,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Upload,
} from 'lucide-react';
import { uploadAvatar } from '../services/resourceService';
import { api } from '../lib/api';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
];

type MyProject = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  skills?: string[];
  status?: string;
  ownerId?: string;
  ownerName?: string;
  createdAt?: string;
};

type LearningSession = {
  _id?: string;
  id?: string;
  ownerName?: string;
  partnerName?: string;
  scheduledAt?: string;
  status?: string;
  questions?: string[];
};

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();

  // Projects and learning activity
  const [myProjects, setMyProjects] = useState<MyProject[]>([]);
  const [mySessions, setMySessions] = useState<LearningSession[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('CSE');
  const [academicYear, setAcademicYear] =
    useState<AcademicYear>('Year I');
  const [semester, setSemester] = useState<number>(1);
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  // Skills and interests
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');

  const selectedYearConfig = ACADEMIC_YEARS.find(
    (year) => year.year === academicYear
  );

  // Copy saved profile information into the form.
  const syncFormFromProfile = (p: StudentProfile | null) => {
    if (!p) {
      setDisplayName(user?.displayName || '');
      return;
    }

    setDisplayName(p.displayName || user?.displayName || '');
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
    syncFormFromProfile(profile);
  }, [profile, user]);

  // Load the current user's projects and learning sessions.
  useEffect(() => {
    if (!user) {
      setMyProjects([]);
      setMySessions([]);
      setActivityLoading(false);
      return;
    }

    let cancelled = false;

    const loadProfileActivity = async () => {
      setActivityLoading(true);
      setActivityError('');

      try {
        const [projectsResult, sessionsResult] =
          await Promise.allSettled([
            api<MyProject[] | { projects?: MyProject[] }>(
              '/api/projects/mine'
            ),
            api<LearningSession[] | { sessions?: LearningSession[] }>(
              '/api/skill-exchange/sessions'
            ),
          ]);

        if (cancelled) return;

        if (projectsResult.status === 'fulfilled') {
          const result = projectsResult.value;

          const projects = Array.isArray(result)
            ? result
            : result?.projects ?? [];

          setMyProjects(projects);
        } else {
          setMyProjects([]);
          console.error(
            'Unable to load projects:',
            projectsResult.reason
          );
        }

        if (sessionsResult.status === 'fulfilled') {
          const result = sessionsResult.value;

          const sessions = Array.isArray(result)
            ? result
            : result?.sessions ?? [];

          setMySessions(sessions);
        } else {
          setMySessions([]);
          console.error(
            'Unable to load learning sessions:',
            sessionsResult.reason
          );
        }

        if (
          projectsResult.status === 'rejected' &&
          sessionsResult.status === 'rejected'
        ) {
          setActivityError(
            'Unable to load your projects and learning activity.'
          );
        }
      } catch (error) {
        if (!cancelled) {
          setActivityError(
            'Unable to load profile activity. Please try again.'
          );
          console.error(error);
        }
      } finally {
        if (!cancelled) {
          setActivityLoading(false);
        }
      }
    };

    loadProfileActivity();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Change academic year and select its first semester.
  const handleYearChange = (year: AcademicYear) => {
    setAcademicYear(year);

    const yearConfig = ACADEMIC_YEARS.find(
      (item) => item.year === year
    );

    setSemester(yearConfig?.semesters[0] ?? 1);
  };

  // Add a skill without duplicates.
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();

    if (
      trimmed &&
      !skills.some(
        (skill) => skill.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setSkills((previous) => [...previous, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (tagToRemove: string) => {
    setSkills((previous) =>
      previous.filter((skill) => skill !== tagToRemove)
    );
  };

  // Add an interest without duplicates.
  const handleAddInterest = () => {
    const trimmed = interestInput.trim();

    if (
      trimmed &&
      !interests.some(
        (interest) =>
          interest.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setInterests((previous) => [...previous, trimmed]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (tagToRemove: string) => {
    setInterests((previous) =>
      previous.filter((interest) => interest !== tagToRemove)
    );
  };

  // Upload a custom avatar.
  const handleAvatarFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Permit image files up to 5 MB.
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be 5 MB or less.');
      event.target.value = '';
      return;
    }

    setUploadingAvatar(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await uploadAvatar(user.uid, file);

      // Support common upload service return formats.
      const uploadedURL =
        typeof result === 'string'
          ? result
          : (result as { url?: string; photoURL?: string })?.url ||
            (result as { photoURL?: string })?.photoURL;

      if (!uploadedURL) {
        throw new Error(
          'The upload service did not return an image URL.'
        );
      }

      setPhotoURL(uploadedURL);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to upload avatar. Please try again.'
      );
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  // Restore the saved values when cancelling.
  const handleCancel = () => {
    syncFormFromProfile(profile);
    setIsEditing(false);
    setErrorMessage(null);
    setSuccessMessage(null);
    setSkillInput('');
    setInterestInput('');
  };

  // Save profile information.
  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!displayName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!college.trim()) {
      setErrorMessage('College / Institution is required.');
      return;
    }

    if (uploadingAvatar) {
      setErrorMessage('Please wait for the avatar upload to finish.');
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
    } catch (error) {
      console.error('Profile update error:', error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Notifications */}
      {successMessage && (
        <div
          role="status"
          className="mb-6 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
          <button
            type="button"
            aria-label="Dismiss success message"
            onClick={() => setSuccessMessage(null)}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
          <button
            type="button"
            aria-label="Dismiss error message"
            onClick={() => setErrorMessage(null)}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main profile card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Cover banner */}
        <div className="relative h-40 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800">
          <div className="absolute right-6 top-5 z-10 flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setIsEditing(true);
                }}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-xs font-bold text-slate-800 shadow-md transition hover:bg-white"
              >
                <Edit3 className="h-4 w-4 text-indigo-600" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving || uploadingAvatar}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-black/40 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-black/60 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>

                <button
                  type="submit"
                  form="profile-edit-form"
                  disabled={saving || uploadingAvatar}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving || uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        <div className="px-6 pb-10 sm:px-10">
          {/* Avatar and profile heading */}
          <div className="relative -mt-16 mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-indigo-100 text-3xl font-extrabold text-indigo-700 shadow-xl ring-4 ring-white">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Student avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>
                    {(displayName || user?.displayName || 'S')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {displayName || 'Student Profile'}
                </h1>

                <p className="mt-0.5 flex items-center justify-center gap-1.5 text-xs text-slate-500 sm:justify-start">
                  <Mail className="h-3.5 w-3.5" />
                  {profile?.email || user?.email || 'No email available'}
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-full border border-indigo-200/60 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                    {branch}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {academicYear} • Semester {semester}
                  </span>
                  <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                    {degree}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* My Projects */}
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <Layers className="h-6 w-6 text-indigo-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  My Projects
                </h2>
                <p className="text-sm text-gray-500">
                  Projects you created or joined
                </p>
              </div>
              <span className="ml-auto rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                {myProjects.length}
              </span>
            </div>

            {activityLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading projects...
              </div>
            ) : myProjects.length === 0 ? (
              <p className="text-sm text-gray-500">
                No projects found yet. Projects you create or join will
                appear here.
              </p>
            ) : (
              <div className="space-y-4">
                {myProjects.map((project, index) => (
                  <div
                    key={project._id || project.id || index}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {project.title || 'Untitled project'}
                      </h3>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium capitalize text-gray-600">
                        {project.status || 'Active'}
                      </span>
                    </div>

                    {project.description && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                        {project.description}
                      </p>
                    )}

                    {project.skills && project.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.skills.map((skill, skillIndex) => (
                          <span
                            key={`${skill}-${skillIndex}`}
                            className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {project.createdAt && (
                      <p className="mt-3 text-xs text-gray-500">
                        Created:{' '}
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Mentorship and learning activity */}
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-emerald-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Mentorship &amp; Learning Activity
                </h2>
                <p className="text-sm text-gray-500">
                  Your scheduled learning sessions
                </p>
              </div>
              <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                {mySessions.length}
              </span>
            </div>

            {activityLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading sessions...
              </div>
            ) : mySessions.length === 0 ? (
              <p className="text-sm text-gray-500">
                No learning sessions found yet. Your scheduled sessions
                will appear here.
              </p>
            ) : (
              <div className="space-y-4">
                {mySessions.map((session, index) => (
                  <div
                    key={session._id || session.id || index}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <h3 className="font-semibold text-gray-900">
                      Learning session
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      With: {session.ownerName || 'Student'}
                      {session.partnerName
                        ? ` and ${session.partnerName}`
                        : ''}
                    </p>

                    {session.scheduledAt && (
                      <p className="mt-2 text-sm text-gray-600">
                        Scheduled:{' '}
                        {new Date(session.scheduledAt).toLocaleString()}
                      </p>
                    )}

                    <span className="mt-3 inline-block rounded-full bg-white px-3 py-1 text-xs font-medium capitalize text-gray-600">
                      {session.status || 'Scheduled'}
                    </span>

                    {session.questions &&
                      session.questions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-700">
                            Topics
                          </p>
                          <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                            {session.questions.map((question, questionIndex) => (
                              <li key={`${question}-${questionIndex}`}>
                                {question}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {activityError && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {activityError}
            </p>
          )}

          {/* Avatar controls */}
          {isEditing && (
            <div className="mt-8 space-y-3 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-5">
              <label className="block text-xs font-bold text-slate-700">
                Update Student Avatar Photo
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50">
                  {uploadingAvatar ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                  ) : (
                    <Upload className="h-3.5 w-3.5 text-indigo-600" />
                  )}
                  <span>
                    {uploadingAvatar
                      ? 'Uploading Image...'
                      : 'Upload Image from Computer'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-400">
                  JPG, PNG, or other image formats up to 5 MB
                </span>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-semibold text-slate-500">
                  Or choose a preset student avatar:
                </p>
                <div className="mb-2 flex items-center gap-3 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((url, index) => (
                    <button
                      key={url}
                      type="button"
                      aria-label={`Choose avatar ${index + 1}`}
                      aria-pressed={photoURL === url}
                      onClick={() => setPhotoURL(url)}
                      className={`h-12 w-12 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                        photoURL === url
                          ? 'scale-105 border-indigo-600 ring-2 ring-indigo-400'
                          : 'border-white opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Preset avatar ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="url"
                value={photoURL}
                onChange={(event) => setPhotoURL(event.target.value)}
                placeholder="Or paste an external image URL (https://...)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Profile edit form */}
          <form
            id="profile-edit-form"
            onSubmit={handleSave}
            className="mt-8 space-y-8"
          >
            {/* Academic information */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                Academic Background
              </h3>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Full name */}
                <div>
                  <label
                    htmlFor="display-name"
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                  >
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      id="display-name"
                      type="text"
                      required
                      value={displayName}
                      onChange={(event) =>
                        setDisplayName(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-sm font-semibold text-slate-900">
                      {displayName || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* College */}
                <div>
                  <label
                    htmlFor="college"
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                  >
                    College / University
                  </label>
                  {isEditing ? (
                    <input
                      id="college"
                      type="text"
                      required
                      value={college}
                      onChange={(event) => setCollege(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-sm font-semibold text-slate-900">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      {college || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Degree */}
                <div>
                  <label
                    htmlFor="degree"
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                  >
                    Degree / Program
                  </label>
                  {isEditing ? (
                    <select
                      id="degree"
                      value={degree}
                      onChange={(event) => setDegree(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="B.Tech">
                        B.Tech (Bachelor of Technology)
                      </option>
                      <option value="B.E.">
                        B.E. (Bachelor of Engineering)
                      </option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                      <option value="B.Sc">B.Sc Computer Science</option>
                    </select>
                  ) : (
                    <p className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-sm font-semibold text-slate-900">
                      {degree}
                    </p>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label
                    htmlFor="branch"
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                  >
                    Engineering Branch
                  </label>
                  {isEditing ? (
                    <select
                      id="branch"
                      value={branch}
                      onChange={(event) => setBranch(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      {BRANCHES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} - {item.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-sm font-semibold text-slate-900">
                      {BRANCHES.find((item) => item.code === branch)?.name ||
                        branch}
                    </p>
                  )}
                </div>

                {/* Academic year */}
                <div>
                  <label
                    htmlFor="academic-year"
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                  >
                    Academic Year
                  </label>
                  {isEditing ? (
                    <select
                      id="academic-year"
                      value={academicYear}
                      onChange={(event) =>
                        handleYearChange(
                          event.target.value as AcademicYear
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      {ACADEMIC_YEARS.map((item) => (
                        <option key={item.year} value={item.year}>
                          {item.year}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-sm font-semibold text-slate-900">
                      {academicYear}
                    </p>
                  )}
                </div>

                {/* Semester */}
                <div>
                  <label
                    htmlFor="semester"
                    className="mb-1.5 block text-xs font-semibold text-slate-600"
                  >
                    Current Semester
                  </label>
                  {isEditing ? (
                    <select
                      id="semester"
                      value={semester}
                      onChange={(event) =>
                        setSemester(Number(event.target.value))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    >
                      {(selectedYearConfig?.semesters ?? [1, 2]).map(
                        (item) => (
                          <option key={item} value={item}>
                            Semester {item}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <p className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-sm font-semibold text-slate-900">
                      Semester {semester}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Biography */}
            <section>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-900">
                About Me
              </h3>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Share a short summary of your academic interests, goals, or study topics..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-700">
                  {bio ||
                    'No bio written yet. Click "Edit Profile" to add your introduction!'}
                </p>
              )}
            </section>

            {/* Skills */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Technical Skills &amp; Competencies
              </h3>

              {isEditing && (
                <div className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(event) => setSkillInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add a skill (e.g. C++, React, DSA, Python)..."
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {skills.length === 0 ? (
                  <p className="text-xs italic text-slate-400">
                    No skills listed yet.
                  </p>
                ) : (
                  skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          type="button"
                          aria-label={`Remove ${skill}`}
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
            </section>

            {/* Interests */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
                <Layers className="h-4 w-4 text-indigo-600" />
                Areas of Interest
              </h3>

              {isEditing && (
                <div className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(event) =>
                      setInterestInput(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddInterest();
                      }
                    }}
                    placeholder="Add an interest (e.g. Machine Learning, Cloud Architecture)..."
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="flex items-center gap-1 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {interests.length === 0 ? (
                  <p className="text-xs italic text-slate-400">
                    No interests listed yet.
                  </p>
                ) : (
                  interests.map((interest, index) => (
                    <span
                      key={`${interest}-${index}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200/60 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700"
                    >
                      {interest}
                      {isEditing && (
                        <button
                          type="button"
                          aria-label={`Remove ${interest}`}
                          onClick={() => handleRemoveInterest(interest)}
                          className="hover:text-rose-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))
                )}
              </div>
            </section>

            {/* Bottom form actions */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving || uploadingAvatar}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploadingAvatar}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
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
