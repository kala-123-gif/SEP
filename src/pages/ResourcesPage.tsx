import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BRANCHES,
  ACADEMIC_YEARS,
  AcademicYear,
  Resource,
  ResourceType,
  Subject,
} from '../types';
import {
  getResources,
  getBookmarkedResourceIds,
  toggleBookmark,
  deleteResource,
} from '../services/resourceService';
import { getSubjects } from '../services/subjectService';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ResourceDetailModal } from '../components/resources/ResourceDetailModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Search,
  BookOpen,
  UploadCloud,
  Layers,
  X,
  ChevronRight,
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();

  // Filters state from query parameters or student profile defaults
  const initialYear = (searchParams.get('year') as AcademicYear) || profile?.academicYear || 'Year I';
  const initialBranch = searchParams.get('branch') || profile?.branch || 'CSE';
  const initialSemester = searchParams.get('semester') ? Number(searchParams.get('semester')) : 0;
  const initialSubjectId = searchParams.get('subjectId') || '';
  const initialType = (searchParams.get('type') as ResourceType | 'all') || 'all';

  const [selectedYear, setSelectedYear] = useState<AcademicYear>(initialYear);
  const [selectedBranch, setSelectedBranch] = useState<string>(initialBranch);
  const [selectedSemester, setSelectedSemester] = useState<number>(initialSemester);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'rating'>('date');
  const [visibleCount, setVisibleCount] = useState<number>(9);

  // Data states
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);

  // Sync year config
  const currentYearConfig = ACADEMIC_YEARS.find((y) => y.year === selectedYear);

  // Load subjects whenever branch, year, or semester changes
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const subjs = await getSubjects(
          selectedBranch === 'ALL' ? undefined : selectedBranch,
          selectedYear,
          selectedSemester === 0 ? undefined : selectedSemester
        );
        setSubjects(subjs);
      } catch (err) {
        console.warn('Failed to load subjects:', err);
      }
    }
    fetchSubjects();
  }, [selectedBranch, selectedYear, selectedSemester]);

  // Load resources & bookmarks
  const fetchResources = async () => {
    setLoading(true);
    try {
      const filters: any = {
        academicYear: selectedYear,
        sortBy,
      };

      if (selectedBranch && selectedBranch !== 'ALL') {
        filters.branch = selectedBranch;
      }
      if (selectedSemester > 0) {
        filters.semester = selectedSemester;
      }
      if (selectedSubjectId) {
        filters.subjectId = selectedSubjectId;
      }
      if (selectedType && selectedType !== 'all') {
        filters.type = selectedType;
      }
      if (searchQuery.trim()) {
        filters.searchQuery = searchQuery.trim();
      }

      const data = await getResources(filters);
      setResources(data);

      if (user) {
        const bIds = await getBookmarkedResourceIds(user.uid);
        setBookmarkIds(bIds);
      }
    } catch (err) {
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    setVisibleCount(9);
  }, [
    selectedYear,
    selectedBranch,
    selectedSemester,
    selectedSubjectId,
    selectedType,
    searchQuery,
    sortBy,
    user?.uid,
  ]);

  const handleToggleBookmark = async (resourceId: string) => {
    if (!user) return;
    try {
      const res = await toggleBookmark(user.uid, resourceId);
      if (res.bookmarked) {
        setBookmarkIds((prev) => [...prev, resourceId]);
      } else {
        setBookmarkIds((prev) => prev.filter((id) => id !== resourceId));
      }
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!user) return;
    try {
      await deleteResource(resourceId, user.uid);
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (err: any) {
      console.error('Delete error:', err);
    }
  };

  const handleResetFilters = () => {
    setSelectedBranch('ALL');
    setSelectedSemester(0);
    setSelectedSubjectId('');
    setSelectedType('all');
    setSearchQuery('');
    setSortBy('date');
  };

  const resourceTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'notes', label: 'Study Notes' },
    { value: 'pdf', label: 'PDF Documents' },
    { value: 'video', label: 'Video Lectures' },
    { value: 'question_paper', label: 'Question Papers' },
    { value: 'reference', label: 'References' },
  ];

  const displayedResources = resources.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Semester Resource Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse handcrafted notes, previous year question papers, video lectures, and syllabus materials across Years I–IV.
          </p>
        </div>

        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-200 transition shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          Upload Study Material
        </Link>
      </div>

      {/* 1. Academic Year Tabs (Years I - IV) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ACADEMIC_YEARS.map((y) => (
            <button
              key={y.year}
              onClick={() => {
                setSelectedYear(y.year);
                setSelectedSemester(0);
                setSelectedSubjectId('');
              }}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex flex-col items-center justify-center gap-1 ${
                selectedYear === y.year
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{y.year}</span>
              <span
                className={`text-[10px] font-medium ${
                  selectedYear === y.year ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                Semesters {y.semesters[0]} & {y.semesters[1]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Filter Bar: Semester, Branch, Subject, Type, Search & Sort */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {/* Semester & Branch Sub-selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Semester Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                setSelectedSemester(0);
                setSelectedSubjectId('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedSemester === 0
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Semesters in {selectedYear}
            </button>
            {currentYearConfig?.semesters.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSelectedSemester(s);
                  setSelectedSubjectId('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedSemester === s
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semester {s}
              </button>
            ))}
          </div>

          {/* Branch Selector */}
          <div className="flex-1 min-w-[200px]">
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setSelectedSubjectId('');
              }}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 text-slate-900"
            >
              <option value="ALL">All Engineering Branches</option>
              {BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} — {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {(selectedBranch !== 'ALL' || selectedSemester !== 0 || selectedSubjectId || selectedType !== 'all' || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-rose-50 transition"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Subject Pills (when subjects exist for chosen branch/sem) */}
        {subjects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Subjects in this curriculum:
              </span>
              {selectedSubjectId && (
                <button
                  onClick={() => setSelectedSubjectId('')}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  Clear Subject Filter
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <button
                onClick={() => setSelectedSubjectId('')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                  selectedSubjectId === ''
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Subjects ({subjects.length})
              </button>
              {subjects.map((subj) => (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition border ${
                    selectedSubjectId === subj.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-80 mr-1">[{subj.code}]</span>
                  <span>{subj.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search, Type Filter, and Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject, tags, or topic keywords..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 transition"
            />
          </div>

          {/* Resource Type Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900"
            >
              {resourceTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900"
            >
              <option value="date">Sort by: Most Recent</option>
              <option value="rating">Sort by: Highest Rated</option>
              <option value="title">Sort by: Title A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="font-semibold text-slate-800">{displayedResources.length}</strong> of{' '}
          <strong className="font-semibold text-slate-800">{resources.length}</strong> materials for{' '}
          <strong className="font-semibold text-slate-800">{selectedYear}</strong>
          {selectedSemester > 0 && ` (Semester ${selectedSemester})`}
          {selectedBranch !== 'ALL' && ` • ${selectedBranch}`}
        </span>
      </div>

      {/* Resources Cards Grid */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner message="Searching semester academic resources..." size="lg" />
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching materials found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            There are no notes, PDFs, or question papers matching your current filter criteria for{' '}
            {selectedYear}. You can reset the filters or be the first student to upload notes!
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset Filters
            </button>
            <Link
              to="/upload"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition"
            >
              Upload Material Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedResources.map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                isBookmarked={bookmarkIds.includes(res.id)}
                onToggleBookmark={handleToggleBookmark}
                onOpenDetails={(r) => setActiveResource(r)}
              />
            ))}
          </div>

          {/* Load More Button for Pagination */}
          {visibleCount < resources.length && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 9)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-sm transition"
              >
                <span>Load More Materials ({resources.length - visibleCount} remaining)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail / Review Modal */}
      <ResourceDetailModal
        resource={activeResource}
        isOpen={Boolean(activeResource)}
        onClose={() => { setActiveResource(null); void fetchResources(); }}
        isBookmarked={activeResource ? bookmarkIds.includes(activeResource.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onDeleteResource={handleDeleteResource}
        onSelectRelatedResource={(r) => setActiveResource(r)}
      />
    </div>
  );
};
