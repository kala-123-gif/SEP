import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BRANCHES,
  ACADEMIC_YEARS,
  AcademicYear,
  ResourceType,
  Subject,
  UploadPhase,
} from '../types';
import { getSubjects } from '../services/subjectService';
import { createResource } from '../services/resourceService';
import {
  UploadCloud,
  FileText,
  FileDown,
  Video,
  FileCode,
  Layers,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Tag,
  X,
  Plus,
  Paperclip,
} from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.png', '.jpg', '.jpeg'];

export const UploadResourcePage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);

  // Form states initialized with student's profile defaults
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ResourceType>('notes');
  const [branch, setBranch] = useState(profile?.branch || 'CSE');
  const [academicYear, setAcademicYear] = useState<AcademicYear>(profile?.academicYear || 'Year I');
  const [semester, setSemester] = useState<number>(profile?.semester || 1);
  const [subjectId, setSubjectId] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // File
  const [file, setFile] = useState<File | null>(null);

  // Subjects lookup
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Status & Progress Phases
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase | 'idle'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedYearConfig = ACADEMIC_YEARS.find((y) => y.year === academicYear);

  // Load subjects dynamically when branch, year, or semester changes
  useEffect(() => {
    async function loadSubjs() {
      setLoadingSubjects(true);
      try {
        const list = await getSubjects(branch, academicYear, semester);
        setSubjects(list);
        if (list.length > 0) {
          setSubjectId(list[0].id);
        } else {
          setSubjectId('');
        }
      } catch (err) {
        console.warn('Error loading subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    }
    loadSubjs();
  }, [branch, academicYear, semester]);

  const handleYearChange = (year: AcademicYear) => {
    setAcademicYear(year);
    const yrConfig = ACADEMIC_YEARS.find((y) => y.year === year);
    if (yrConfig && !yrConfig.semesters.includes(semester)) {
      setSemester(yrConfig.semesters[0]);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];

      // Validate size
      if (selected.size > MAX_FILE_SIZE_BYTES) {
        setError(`File size (${(selected.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum allowed limit of 25 MB.`);
        return;
      }

      // Validate extension
      const ext = '.' + selected.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`File format ${ext} is not supported. Please upload a PDF, Word doc, PowerPoint, TXT, or image.`);
        return;
      }

      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Prevent duplicate submits from rapid double-clicks
    if (isSubmittingRef.current || uploading) {
      return;
    }

    if (!user) {
      setError('You must be signed in to upload study materials.');
      return;
    }

    if (!title.trim()) {
      setError('Resource title is mandatory.');
      return;
    }

    if (!subjectId) {
      setError('Please select the associated curriculum subject.');
      return;
    }

    if (type === 'video') {
      if (!externalUrl.trim()) {
        setError('Please provide a valid video URL (e.g. YouTube, NPTEL, Coursera, or Google Drive lecture).');
        return;
      }
    } else {
      // Notes / PDF / Question Paper / Reference
      if (!file && !externalUrl.trim()) {
        setError('Please upload a document file or provide a resource link.');
        return;
      }
    }

    isSubmittingRef.current = true;
    setUploading(true);
    setUploadProgress(5);
    setUploadPhase('validating');
    setUploadMessage('Preparing file and validating academic metadata...');

    try {
      const chosenSubject = subjects.find((s) => s.id === subjectId);
      const subjectName = chosenSubject ? chosenSubject.name : 'Engineering Course';

      await createResource(
        {
          title: title.trim(),
          description: description.trim(),
          type,
          branch,
          academicYear,
          semester: Number(semester),
          subjectId,
          subjectName,
          externalUrl: externalUrl.trim(),
          uploadedBy: user.uid,
          uploaderName: profile?.displayName || user.displayName || 'Student',
          tags,
        },
        file,
        (progress, info) => {
          setUploadProgress(progress);
          if (info) {
            setUploadPhase(info.phase);
            if (info.message) setUploadMessage(info.message);
          }
        }
      );

      setUploadPhase('completed');
      setUploadMessage('Resource published successfully!');
      setSuccess(true);
      setTimeout(() => {
        navigate(`/resources?branch=${branch}&year=${encodeURIComponent(academicYear)}&semester=${semester}`);
      }, 1500);
    } catch (err: any) {
      console.error('Resource upload failed:', err);
      setUploadPhase('failed');
      setError(err.message || 'Failed to upload resource. Please check inputs and try again.');
    } finally {
      setUploading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Upload Study Material</h1>
              <p className="text-xs sm:text-sm text-indigo-200 mt-0.5">
                Share your handwritten notes, past year solved question papers, and lecture resources with peers
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-10">
          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Resource uploaded successfully!</p>
                <p className="text-xs text-emerald-700">Redirecting to your semester library...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <p className="font-bold mb-0.5">Upload Unsuccessful</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {uploading && (
            <div className="mb-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200/80 space-y-2.5 animate-in fade-in shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                  {uploadMessage || 'Uploading document to cloud storage...'}
                </span>
                <span className="font-mono bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full text-xs">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-indigo-200/70 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-indigo-700/80 font-medium">
                <span>
                  Stage: {uploadPhase === 'validating' ? '1/3 Validating File' : uploadPhase === 'uploading' ? '2/3 Transferring to Storage' : uploadPhase === 'saving_metadata' ? '3/3 Registering in Database' : 'Completing...'}
                </span>
                {file && <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Resource Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unit 3 Trees & Graphs Comprehensive Handwritten Notes"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 font-medium"
              />
            </div>

            {/* Resource Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Resource Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { value: 'notes', label: 'Study Notes', icon: <FileText className="w-4 h-4" /> },
                  { value: 'pdf', label: 'PDF Document', icon: <FileDown className="w-4 h-4" /> },
                  { value: 'video', label: 'Video Lecture', icon: <Video className="w-4 h-4" /> },
                  { value: 'question_paper', label: 'Question Paper', icon: <FileCode className="w-4 h-4" /> },
                  { value: 'reference', label: 'Reference Material', icon: <Layers className="w-4 h-4" /> },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setType(item.value as ResourceType)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition ${
                      type === item.value
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Classification: Branch, Year, Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Engineering Branch *
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 text-slate-900"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} — {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Academic Year *
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => handleYearChange(e.target.value as AcademicYear)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 text-slate-900"
                >
                  {ACADEMIC_YEARS.map((y) => (
                    <option key={y.year} value={y.year}>
                      {y.year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Semester *
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 text-slate-900"
                >
                  {selectedYearConfig?.semesters.map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Curriculum Subject *
                </label>
                {loadingSubjects && (
                  <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading subjects...
                  </span>
                )}
              </div>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 text-slate-900"
              >
                {subjects.length === 0 ? (
                  <option value="">No predefined subject found for this semester</option>
                ) : (
                  subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.code}] {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* File Upload or Video Link */}
            {type === 'video' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Video URL (YouTube, NPTEL, Drive) *
                </label>
                <input
                  type="url"
                  required
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://nptel.ac.in/..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Document / File Upload (PDF, Word, PPT, TXT — max 25MB)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-indigo-50/30 transition cursor-pointer relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Paperclip className="w-5 h-5" />
                    </div>
                    {file ? (
                      <div>
                        <p className="text-xs font-bold text-indigo-900">{file.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB — Ready to upload
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Click to browse or drop file here
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          PDF, DOCX, PPTX, or TXT up to 25 MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Or External Link (e.g. Google Drive / GitHub archive)
                  </label>
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or https://..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Description & Topics Covered
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention key topics, module numbers, previous exam relevance, or author notes..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 leading-relaxed"
              />
            </div>

            {/* Keyword Tags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tags (helps students search and discover)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag (e.g. PYQ, Midterm, Trees, FormulaSheet)..."
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600 focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/resources"
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading Material...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Publish Resource
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
