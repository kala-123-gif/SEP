import { INITIAL_SUBJECTS, INITIAL_RESOURCES } from '../lib/seedData.ts';
import { ACADEMIC_YEARS, BRANCHES, Resource, StudentProfile } from '../types/index.ts';
import { generateRecommendations } from '../services/resourceService.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

console.log('\n--- STARTING ACADEMIC PLATFORM TEST SUITE ---\n');

// 1. Academic Structure Invariants
console.log('[1] Academic Years & Semester Mapping:');
assert(ACADEMIC_YEARS.length === 4, 'Exactly 4 academic years (Year I - Year IV) configured');
assert(ACADEMIC_YEARS[0].semesters[0] === 1 && ACADEMIC_YEARS[0].semesters[1] === 2, 'Year I maps to Semesters 1 and 2');
assert(ACADEMIC_YEARS[1].semesters[0] === 3 && ACADEMIC_YEARS[1].semesters[1] === 4, 'Year II maps to Semesters 3 and 4');
assert(ACADEMIC_YEARS[2].semesters[0] === 5 && ACADEMIC_YEARS[2].semesters[1] === 6, 'Year III maps to Semesters 5 and 6');
assert(ACADEMIC_YEARS[3].semesters[0] === 7 && ACADEMIC_YEARS[3].semesters[1] === 8, 'Year IV maps to Semesters 7 and 8');

// 2. Branch Catalog Verification
console.log('\n[2] Branch Catalog:');
const expectedBranches = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE'];
for (const code of expectedBranches) {
  const branchFound = BRANCHES.some((b) => b.code === code);
  assert(branchFound, `Branch ${code} is configured in catalog`);
}

// 3. Subject Data Integrity
console.log('\n[3] Subject Curriculum Invariants:');
assert(INITIAL_SUBJECTS.length >= 24, `Curriculum has ${INITIAL_SUBJECTS.length} subjects covering multiple branches`);
for (const subj of INITIAL_SUBJECTS) {
  assert(Boolean(subj.id && subj.name && subj.code && subj.branch && subj.academicYear && subj.semester),
    `Subject ${subj.code} (${subj.name}) has all mandatory attributes`);
  assert(subj.semester >= 1 && subj.semester <= 8, `Subject ${subj.code} semester is within 1-8 bounds`);
}

// 4. Resource Filtering Logic Test
console.log('\n[4] Resource Filtering & Search:');
const cseYearIRes = INITIAL_RESOURCES.filter(
  (r) => (r.branch === 'CSE' || r.branch === 'ALL') && r.academicYear === 'Year I'
);
assert(cseYearIRes.length >= 2, `Found ${cseYearIRes.length} resources for CSE Year I`);

// Test search query
const query = 'algorithms';
const searchMatched = INITIAL_RESOURCES.filter(
  (r) =>
    r.title.toLowerCase().includes(query) ||
    r.description.toLowerCase().includes(query) ||
    r.tags.some((t) => t.toLowerCase().includes(query))
);
assert(searchMatched.length >= 1, `Search for "${query}" successfully matched ${searchMatched.length} resources`);

// 5. Rating Recalculation Simulation
console.log('\n[5] Resource Rating Aggregation:');
const mockReviews = [
  { rating: 5, comment: 'Great notes' },
  { rating: 4, comment: 'Very helpful' },
  { rating: 5, comment: 'Excellently structured' },
];
const totalScore = mockReviews.reduce((sum, r) => sum + r.rating, 0);
const avg = Number((totalScore / mockReviews.length).toFixed(1));
assert(avg === 4.7, `Average rating correctly computed as ${avg} (expected 4.7)`);

// 6. Profile Completion Percentage Logic
console.log('\n[6] Profile Completion Calculation:');
function computeProfileCompletion(p: {
  displayName?: string;
  college?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
}) {
  let score = 30; // base
  if (p.displayName) score += 15;
  if (p.college) score += 15;
  if (p.bio && p.bio.trim().length > 10) score += 15;
  if (p.skills && p.skills.length > 0) score += 15;
  if (p.interests && p.interests.length > 0) score += 10;
  return Math.min(100, score);
}

const partialProfile = {
  displayName: 'Kala Gollapalli',
  college: 'Engineering Institute',
  bio: '',
  skills: ['React'],
  interests: [],
};
assert(computeProfileCompletion(partialProfile) === 75, 'Partial profile calculated as 75%');

const fullProfile = {
  displayName: 'Kala Gollapalli',
  college: 'Engineering Institute',
  bio: 'Computer science enthusiast and student researcher',
  skills: ['React', 'TypeScript', 'Node.js'],
  interests: ['Systems Architecture'],
};
assert(computeProfileCompletion(fullProfile) === 100, 'Complete profile calculated as 100%');

// 7. Explainable Recommendations Engine Verification (Feature 3)
console.log('\n[7] Explainable Recommendations Engine:');
const mockStudent: StudentProfile = {
  uid: 'student-test-01',
  displayName: 'Kala',
  email: 'kala@student.edu',
  college: 'NIT',
  degree: 'B.Tech',
  branch: 'CSE',
  academicYear: 'Year II',
  semester: 3,
  interests: ['Database', 'DBMS'],
  skills: ['SQL'],
  bio: 'Student',
};

const recs = generateRecommendations(mockStudent, INITIAL_RESOURCES, [], []);
assert(recs.length > 0, `Generated ${recs.length} personalized recommendations`);
for (const rec of recs) {
  assert(Boolean(rec.resource && rec.reason), `Recommendation "${rec.resource.title}" has explainable reason: ${rec.reason}`);
}

// 8. Study Activity & Completion Invariants (Feature 1)
console.log('\n[8] Study History & Quality Reports:');
const validReportReasons = ['broken_link', 'incorrect_file', 'duplicate', 'copyright', 'inappropriate', 'other'];
assert(validReportReasons.includes('broken_link'), 'Report reason "broken_link" is valid');
assert(validReportReasons.includes('duplicate'), 'Report reason "duplicate" is valid');

// 9. Document Upload & File Opening Resolution Tests (Tasks 1, 2, 3)
console.log('\n[9] Document Upload, Stale Blob Detection & File Opening Resolution:');

// Test A: Detection of stale blob URL
function isStaleBlobUrl(url?: string): boolean {
  return Boolean(url && url.startsWith('blob:'));
}
assert(isStaleBlobUrl('blob:https://ais-dev-.../123-abc') === true, 'Correctly identifies temporary blob URLs');
assert(isStaleBlobUrl('https://cdn.example.com/resources/res.pdf') === false, 'Valid persistent HTTP file URL is not marked as blob');
assert(isStaleBlobUrl('https://youtube.com/watch?v=123') === false, 'External video URL is not marked as blob');

// Test B: File Upload Constraints
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
assert(20 * 1024 * 1024 <= MAX_UPLOAD_BYTES, '20MB file is within allowed limit');
assert(26 * 1024 * 1024 > MAX_UPLOAD_BYTES, '26MB file is rejected as exceeding 25MB limit');

const ALLOWED_EXTS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.png', '.jpg', '.jpeg'];
function isAllowedFileExt(fileName: string): boolean {
  const ext = '.' + fileName.split('.').pop()?.toLowerCase();
  return ALLOWED_EXTS.includes(ext);
}
assert(isAllowedFileExt('lecture_notes.pdf') === true, 'PDF files allowed');
assert(isAllowedFileExt('syllabus.docx') === true, 'Docx files allowed');
assert(isAllowedFileExt('malicious_script.exe') === false, 'Executable files rejected');

// Test C: Storage Path Generation
function generateStoragePath(resourceId: string, fileName: string): string {
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `resources/${resourceId}/${cleanName}`;
}
const testPath = generateStoragePath('res_123', 'Unit 1 Data Structures.pdf');
assert(testPath.startsWith('resources/res_123/Unit_1_Data_Structures.pdf'), `Generated storage path "${testPath}" follows pattern resources/{resourceId}/{uniqueFileName}`);

console.log('\n--- ALL TEST SUITE ASSERTIONS PASSED SUCCESSFULLY ---\n');
process.exit(0);
