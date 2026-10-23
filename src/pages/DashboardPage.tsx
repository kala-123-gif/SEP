import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Resource, Subject, StudyActivity, ResourceRecommendation } from '../types';
import {
  getResources,
  getBookmarkedResourceIds,
  toggleBookmark,
  getStudyHistory,
  clearStudyHistory,
  generateRecommendations,
} from '../services/resourceService';
import { getSubjects } from '../services/subjectService';
import {
  GraduationCap,
  BookOpen,
  Bookmark,
  UploadCloud,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Users,
  Rocket,
  Video,
  FileCode,
  FileDown,
  Layers,
  ChevronRight,
  Clock,
  Check,
  History,
  Trash2,
  Compass,
} from 'lucide-react';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ResourceDetailModal } from '../components/resources/ResourceDetailModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [semesterSubjects, setSemesterSubjects] = useState<Subject[]>([]);
  const [semesterResources, setSemesterResources] = useState<Resource[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);

  // Distinctive Features States
  const [studyHistory, setStudyHistory] = useState<StudyActivity[]>([]);
  const [recommendations, setRecommendations] = useState<ResourceRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history' | 'completed'>('bookmarks');

  // Modal
  const [activeResource, setActiveResource] = useState<Resource | null>(null);

  useEffect(() => {
    if (user && profile) {
      loadDashboardData();
    }
  }, [user?.uid, profile?.branch, profile?.academicYear, profile?.semester]);

  const loadDashboardData = async () => {
    if (!user || !profile) return;
    setLoading(true);

    try {
      // 1. Subjects for student's semester
      const subjects = await getSubjects(profile.branch, profile.academicYear, profile.semester);
      setSemesterSubjects(subjects);

      // 2. All resources
      const allRes = await getResources();
      setAllResources(allRes);

      // 3. Semester filtered resources
      const semRes = allRes.filter(
        (r) =>
          (!r.branch || r.branch.toUpperCase() === profile.branch.toUpperCase() || r.branch === 'ALL') &&
          r.academicYear === profile.academicYear &&
          Number(r.semester) === Number(profile.semester)
      );
      setSemesterResources(semRes);
      setRecentResources(allRes.slice(0, 6));

      // 4. Bookmarks
      const bIds = await getBookmarkedResourceIds(user.uid);
      setBookmarkIds(bIds);
      const bResources = allRes.filter((r) => bIds.includes(r.id));
      setBookmarkedResources(bResources);

      // 5. Study History (Feature 1)
      const history = await getStudyHistory(user.uid);
      setStudyHistory(history);

      // 6. Explainable Recommendations (Feature 3)
      const recs = generateRecommendations(profile, allRes, bIds, history);
      setRecommendations(recs);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (resourceId: string) => {
    if (!user) return;
    try {
      const res = await toggleBookmark(user.uid, resourceId);
      if (res.bookmarked) {
        setBookmarkIds((prev) => [...prev, resourceId]);
      } else {
        setBookmarkIds((prev) => prev.filter((id) => id !== resourceId));
        setBookmarkedResources((prev) => prev.filter((r) => r.id !== resourceId));
      }
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    if (confirm('Clear your study history?')) {
      await clearStudyHistory(user.uid);
      setStudyHistory([]);
    }
  };

  // Real profile completion calculation
  const calculateProfileCompletion = () => {
    if (!profile) return { score: 0, missing: [] };
    let score = 30; // base registered student
    const missing: string[] = [];

    if (profile.displayName) score += 15;
    else missing.push('Full name');

    if (profile.college) score += 15;
    else missing.push('College institution');

    if (profile.bio && profile.bio.trim().length > 10) score += 15;
    else missing.push('Short biography');

    if (profile.skills && profile.skills.length > 0) score += 15;
    else missing.push('Technical skills');

    if (profile.interests && profile.interests.length > 0) score += 10;
    else missing.push('Areas of interest');

    return { score: Math.min(100, score), missing };
  };

  const { score: completionPercent, missing: missingFields } = calculateProfileCompletion();

  const completedActivities = studyHistory.filter((a) => a.action === 'completed');

  if (authLoading || (loading && !profile)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Preparing your student dashboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-violet-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Skill Exchange Academic Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {profile?.displayName || user?.displayName || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Enrolled in <strong className="font-semibold text-white">{profile?.branch || 'Engineering'}</strong>,{' '}
              {profile?.academicYear || 'Year I'} • Semester {profile?.semester || 1} at{' '}
              {profile?.college || 'Institution'}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/resources?branch=${profile?.branch}&year=${encodeURIComponent(profile?.academicYear || 'Year I')}&semester=${profile?.semester}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 text-xs font-bold shadow-md hover:bg-indigo-50 transition"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              My Semester Library
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Study Notes
            </Link>
          </div>
        </div>
      </div>
      {/* Student Mentorship and Career Development */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Explore Your Student Hub
          </h2>
          <p className="text-sm text-slate-500">
            Connect with peers, discover mentors, and plan your future career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            to="/skill-exchange"
            className="group rounded-3xl border border-violet-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-400 hover:shadow-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Student Mentorship & Skill Exchange
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Discover students, exchange skills, connect with mentors, send
              messages, and organize study sessions.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-700">
              Explore Student Mentorship
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            to="/career-development"
            className="group rounded-3xl border border-indigo-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
              <Rocket className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Career Development & GATE Preparation
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Explore career roadmaps, prepare for GATE, and organize your
              weekly learning goals.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-700">
              Explore Career Development
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>
      {/* Metrics & Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Completion */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Profile Completion
              </span>
              <span className="text-xs font-bold text-indigo-600">{completionPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500">
              {completionPercent === 100
                ? 'Your student profile is complete and verified!'
                : `Missing: ${missingFields.slice(0, 2).join(', ')}`}
            </p>
          </div>
          {completionPercent < 100 && (
            <Link
              to="/profile"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-3"
            >
              Update Profile <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Current Semester Subjects */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Subjects
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">{semesterSubjects.length}</div>
          <p className="text-xs text-slate-500">Active courses for Semester {profile?.semester}</p>
        </div>

        {/* Available Semester Resources */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Resources
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">{semesterResources.length}</div>
          <p className="text-xs text-slate-500">Notes, PDFs & Question Papers</p>
        </div>

        {/* Completed Study Materials (Feature 1) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Resources
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">{completedActivities.length}</div>
          <p className="text-xs text-slate-500">Materials completed by you</p>
        </div>
      </div>

      {/* Feature 1: Continue Learning Shelf */}
      {studyHistory.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Continue Learning & Recent Study History</h2>
                <p className="text-xs text-slate-500">Pick up right where you left off</p>
              </div>
            </div>
            <button
              onClick={handleClearHistory}
              className="text-xs font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {studyHistory.slice(0, 4).map((item) => {
              const fullRes = allResources.find((r) => r.id === item.resourceId);
              return (
                <div
                  key={item.id}
                  onClick={() => fullRes && setActiveResource(fullRes)}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                        {item.type.replace('_', ' ')}
                      </span>
                      {item.action === 'completed' && (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2 mb-1">
                      {item.resourceTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{item.subjectName}</p>
                  </div>
                  <div className="pt-3 mt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                      Resume <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature 3: Recommended for You (Explainable Recommendations) */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 rounded-3xl border border-indigo-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Recommended for You</h2>
                <p className="text-xs text-slate-500">
                  Curated study suggestions tailored to your branch, semester, and interests
                </p>
              </div>
            </div>
            <Link
              to="/resources"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Browse All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.resource.id}
                className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Explainable badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[10px] font-bold mb-2.5 border border-indigo-200/50">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>{rec.reason}</span>
                  </div>
                  <h3
                    onClick={() => setActiveResource(rec.resource)}
                    className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-2 mb-1"
                  >
                    {rec.resource.title}
                  </h3>
                  <p className="text-xs text-slate-500">{rec.resource.subjectName}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    ⭐ {rec.resource.averageRating || 'New'} ({rec.resource.reviewCount || 0})
                  </span>
                  <button
                    onClick={() => setActiveResource(rec.resource)}
                    className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>View Notes</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curriculum Course Quick Explorer for Student's Semester */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              {profile?.academicYear} • Semester {profile?.semester} Subjects ({profile?.branch})
            </h2>
            <p className="text-xs text-slate-500">
              Jump straight into peer notes, solved question papers, and video lectures.
            </p>
          </div>
          <Link
            to="/resources"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            All Years (I-IV) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {semesterSubjects.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No subjects configured for this semester yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {semesterSubjects.map((subj) => (
              <Link
                key={subj.id}
                to={`/resources?subjectId=${subj.id}`}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 transition group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100/70 text-indigo-700">
                    {subj.code}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition mt-2 line-clamp-2">
                    {subj.name}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-3 pt-2 border-t border-slate-200/50">
                  <span>Browse Notes</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bookmarks & Completed Tabs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'bookmarks'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Bookmarks ({bookmarkedResources.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed Study Materials ({completedActivities.length})</span>
            </button>
          </div>
        </div>

        {activeTab === 'bookmarks' && (
          <div>
            {bookmarkedResources.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No bookmarks saved yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse semester resources and tap the bookmark icon to save materials here.
                </p>
                <Link
                  to="/resources"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 transition"
                >
                  Browse Semester Resources
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bookmarkedResources.map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    isBookmarked={true}
                    onToggleBookmark={handleToggleBookmark}
                    onOpenDetails={(r) => setActiveResource(r)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            {completedActivities.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No completed materials yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you finish studying a document, click "Mark Completed" to track your progress here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedActivities.map((act) => {
                  const res = allResources.find((r) => r.id === act.resourceId);
                  return (
                    <div
                      key={act.id}
                      className="bg-white p-4 rounded-2xl border border-emerald-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px] font-bold text-emerald-800 uppercase">
                            {act.type}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {act.resourceTitle}
                        </h4>
                        <p className="text-[11px] text-slate-500">{act.subjectName}</p>
                      </div>
                      {res && (
                        <button
                          onClick={() => setActiveResource(res)}
                          className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recently Added Academic Materials */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Recently Added Academic Materials</h2>
              <p className="text-xs text-slate-500">Latest notes and question papers uploaded by peers</p>
            </div>
          </div>

          <Link
            to="/resources"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentResources.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No resources found in the database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentResources.map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                isBookmarked={bookmarkIds.includes(res.id)}
                onToggleBookmark={handleToggleBookmark}
                onOpenDetails={(r) => setActiveResource(r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail / Review Modal */}
      <ResourceDetailModal
        resource={activeResource}
        isOpen={Boolean(activeResource)}
        onClose={() => setActiveResource(null)}
        isBookmarked={activeResource ? bookmarkIds.includes(activeResource.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onSelectRelatedResource={(r) => setActiveResource(r)}
      />
    </div>
  );
};
