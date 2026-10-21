export type AcademicYear = 'Year I' | 'Year II' | 'Year III' | 'Year IV';

export interface BranchOption {
  id: string;
  name: string;
  code: string;
  icon?: string;
}

export const BRANCHES: BranchOption[] = [
  { id: 'cse', code: 'CSE', name: 'Computer Science and Engineering' },
  { id: 'it', code: 'IT', name: 'Information Technology' },
  { id: 'ece', code: 'ECE', name: 'Electronics and Communication Engineering' },
  { id: 'eee', code: 'EEE', name: 'Electrical and Electronics Engineering' },
  { id: 'me', code: 'ME', name: 'Mechanical Engineering' },
  { id: 'ce', code: 'CE', name: 'Civil Engineering' },
];

export const ACADEMIC_YEARS: { year: AcademicYear; semesters: number[] }[] = [
  { year: 'Year I', semesters: [1, 2] },
  { year: 'Year II', semesters: [3, 4] },
  { year: 'Year III', semesters: [5, 6] },
  { year: 'Year IV', semesters: [7, 8] },
];

export interface StudentProfile {
  uid: string;
  displayName: string;
  email: string;
  college: string;
  degree: string;
  branch: string; // branch code e.g. 'CSE'
  academicYear: AcademicYear;
  semester: number; // 1-8
  interests: string[];
  skills: string[];
  bio: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  branch: string;
  academicYear: AcademicYear;
  semester: number;
  description?: string;
}

export type ResourceType = 'notes' | 'pdf' | 'video' | 'question_paper' | 'reference';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  branch: string;
  academicYear: AcademicYear;
  semester: number;
  subjectId: string;
  subjectName: string;
  storagePath?: string;
  fileId?: string;
  fileUrl?: string;
  downloadURL?: string;
  fileName?: string;
  contentType?: string;
  fileSize?: number; // in bytes
  externalUrl?: string;
  uploadedBy: string;
  uploaderName: string;
  tags: string[];
  averageRating: number;
  reviewCount: number;
  helpfulVotes?: number;
  unhelpfulVotes?: number;
  status?: 'approved' | 'pending' | 'flagged' | 'unavailable';
  createdAt: string;
  updatedAt?: string;
  isBookmarked?: boolean;
}

export type UploadPhase = 'validating' | 'uploading' | 'saving_metadata' | 'completed' | 'failed';

export interface UploadProgressInfo {
  percent: number;
  phase: UploadPhase;
  message?: string;
}

export type UploadProgressHandler = (progress: number, info?: UploadProgressInfo) => void;

export interface Review {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Bookmark {
  id: string;
  resourceId: string;
  createdAt: string;
}

export interface StudyActivity {
  id: string;
  resourceId: string;
  resourceTitle: string;
  subjectName: string;
  type: ResourceType;
  action: 'viewed' | 'completed';
  timestamp: string;
}

export interface ResourceVote {
  userId: string;
  vote: 'helpful' | 'unhelpful';
  createdAt: string;
}

export type ReportReason =
  | 'broken_link'
  | 'incorrect_file'
  | 'duplicate'
  | 'copyright'
  | 'inappropriate'
  | 'other';

export interface ResourceReport {
  id: string;
  resourceId: string;
  resourceTitle: string;
  reportedBy: string;
  reporterEmail?: string;
  reason: ReportReason;
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface ResourceRecommendation {
  resource: Resource;
  reason: string;
}

export interface DashboardSummary {
  profileCompletion: number;
  missingProfileFields: string[];
  enrolledSubjectCount: number;
  availableResourceCount: number;
  bookmarkedCount: number;
  uploadedCount: number;
  recentBookmarks: Resource[];
  recentResources: Resource[];
  recommendedSubjects: Subject[];
  continueLearning: StudyActivity[];
  completedResources: StudyActivity[];
}
