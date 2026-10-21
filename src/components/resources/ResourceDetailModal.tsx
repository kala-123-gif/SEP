import React, { useState, useEffect } from 'react';
import { Resource, Review, ReportReason, ResourceType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  FileText,
  FileDown,
  Video,
  FileCode,
  ExternalLink,
  Bookmark,
  Trash2,
  Calendar,
  User,
  Tag,
  Star,
  Send,
  Loader2,
  AlertCircle,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Flag,
  Share2,
  BookOpen,
  Eye,
  Download,
  RefreshCw,
  FileCheck,
  UploadCloud,
} from 'lucide-react';
import { StarRating } from '../reviews/StarRating';
import {
  getResourceReviews,
  addResourceReview,
  deleteResourceReview,
  recordStudyActivity,
  voteResource,
  getResourceVote,
  getResourceVotesCount,
  submitResourceReport,
  getResources,
  getResourceById,
  resolveResourceFileUrl,
  reuploadResourceFile,
  downloadResourceFile,
  getResourcePreviewUrl,
  ResolvedFileResult,
} from '../../services/resourceService';

interface ResourceDetailModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (resourceId: string) => void;
  onDeleteResource?: (resourceId: string) => void;
  onSelectRelatedResource?: (resource: Resource) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onDeleteResource,
  onSelectRelatedResource,
}) => {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Quality voting states
  const [userVote, setUserVote] = useState<'helpful' | 'unhelpful' | null>(null);
  const [voteCounts, setVoteCounts] = useState<{ helpful: number; unhelpful: number }>({
    helpful: 0,
    unhelpful: 0,
  });
  const [votingLoading, setVotingLoading] = useState(false);

  // Completion state
  const [isCompleted, setIsCompleted] = useState(false);

  // Reporting states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('broken_link');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Related resources
  const [relatedResources, setRelatedResources] = useState<Resource[]>([]);

  // File resolution & metadata states
  const [currentResource, setCurrentResource] = useState<Resource | null>(resource);
  const [resolvedFile, setResolvedFile] = useState<ResolvedFileResult | null>(null);
  const [resolvingFile, setResolvingFile] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [showInlinePdf, setShowInlinePdf] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Author direct re-upload states
  const [reuploading, setReuploading] = useState<boolean>(false);
  const [reuploadProgress, setReuploadProgress] = useState<number>(0);
  const [reuploadError, setReuploadError] = useState<string | null>(null);
  const [reuploadSuccess, setReuploadSuccess] = useState<boolean>(false);

  // Re-trigger resolution
  const [retryNonce, setRetryNonce] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    if (isOpen && resource) {
      // Clear the previous resource's URL immediately so a fast click cannot open
      // the document that was selected before this one.
      setCurrentResource(resource);
      setResolvedFile(null);
      setResolvingFile(true);
      setShowInlinePdf(false);
      setReuploadError(null);
      setReuploadSuccess(false);

      // Fast-path: If the resource already has a valid persistent HTTP(S) URL or external link,
      // populate it immediately so the student can preview/download without delay.
      // Older records may have a stale blob URL in downloadURL but a valid
      // permanent URL in fileUrl. Always prefer a persistent URL.
      const initialCandidates = [resource.downloadURL, resource.fileUrl].filter(
        (value): value is string => typeof value === 'string' && value.length > 0
      );
      const initialUrl =
        initialCandidates.find((value) => /^https?:\/\//i.test(value)) ||
        initialCandidates[0] ||
        '';
      if (initialUrl && /^https?:\/\//i.test(initialUrl)) {
        setResolvedFile({
          url: initialUrl,
          isBlob: false,
          isStaleBlob: false,
          recovered: false,
          sourceType: 'storage',
        });
        setResolvingFile(false);
      } else if (resource.externalUrl && /^https?:\/\//i.test(resource.externalUrl)) {
        setResolvedFile({
          url: resource.externalUrl,
          isBlob: false,
          isStaleBlob: false,
          recovered: false,
          sourceType: 'external',
        });
        setResolvingFile(false);
      } else {
        // Needs cloud storage resolution
        setResolvingFile(true);
      }

      // Safe background verification with 7.5s timeout race
      const fetchAndResolve = async () => {
        try {
          let timeoutId: ReturnType<typeof setTimeout> | undefined;
          try {
            const result = await Promise.race([
              (async () => {
                const fresh = await getResourceById(resource.id);
                const active = fresh || resource;
                if (isMounted) setCurrentResource(active);
                return await resolveResourceFileUrl(active);
              })(),
              new Promise<ResolvedFileResult>((_, reject) => {
                timeoutId = setTimeout(
                  () => reject(new Error('Cloud document verification timed out.')),
                  10000
                );
              }),
            ]);

            if (isMounted) setResolvedFile(result);
          } finally {
            if (timeoutId) clearTimeout(timeoutId);
          }
        } catch (err: any) {
          if (isMounted) {
            // Do not start a second Storage lookup after a timeout; keep any known
            // persistent URL available and surface the verification error.
            setResolvedFile({
              url: /^https?:\/\//i.test(initialUrl)
                ? initialUrl
                : (/^https?:\/\//i.test(resource.externalUrl || '') ? resource.externalUrl! : ''),
              isBlob: Boolean(initialUrl.startsWith('blob:')),
              isStaleBlob: Boolean(initialUrl.startsWith('blob:')),
              recovered: false,
              error: err.message || 'Could not verify document link.',
              sourceType: resource.externalUrl ? 'external' : (initialUrl ? 'storage' : 'unreachable'),
            });
          }
        } finally {
          if (isMounted) {
            setResolvingFile(false);
          }
        }
      };

      fetchAndResolve();

      if (user) {
        // 1. Record viewing study activity
        recordStudyActivity(user.uid, {
          resourceId: resource.id,
          resourceTitle: resource.title,
          subjectName: resource.subjectName,
          type: resource.type,
          action: 'viewed',
        });

        // 2. Load reviews
        loadReviews(resource.id);

        // 3. Load quality votes
        loadVotes(resource.id, user.uid);

        // 4. Load related resources from the same subject
        loadRelated(resource.subjectId, resource.id);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, resource?.id, user?.uid, retryNonce]);

  const handleDownloadFile = async () => {
    if (!resolvedFile?.url) return;
    setDownloading(true);
    try {
      const active = currentResource || resource;
      const targetName = active?.fileName || `${active?.title || 'academic-resource'}.pdf`;
      await downloadResourceFile(resolvedFile.url, targetName);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenPreview = async () => {
  if (!resolvedFile?.url) return;

  setPreviewLoading(true);

  try {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = await getResourcePreviewUrl(resolvedFile.url);
    setPreviewUrl(url);
    setShowInlinePdf(true);
  } catch (error) {
    console.error('Preview failed:', error);
    alert('Unable to preview this document. Please try downloading it.');
  } finally {
    setPreviewLoading(false);
  }
};

  const handleRetryResolution = () => {
    setResolvingFile(true);
    setRetryNonce((prev) => prev + 1);
  };

  const handleReuploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    const selectedFile = e.target.files[0];
    const active = currentResource || resource;
    if (!active) return;

    setReuploadError(null);
    setReuploading(true);
    setReuploadProgress(10);

    try {
      const updated = await reuploadResourceFile(
        active.id,
        selectedFile,
        user.uid,
        (pct) => setReuploadProgress(pct)
      );

      setCurrentResource(updated);
      setResolvedFile({
        url: updated.downloadURL || updated.fileUrl || '',
        isBlob: false,
        isStaleBlob: false,
        recovered: true,
        sourceType: 'storage',
      });
      setReuploadSuccess(true);
    } catch (err: any) {
      console.error('Re-upload failed:', err);
      setReuploadError(err.message || 'Failed to upload replacement file.');
    } finally {
      setReuploading(false);
    }
  };

  const loadReviews = async (resourceId: string) => {
    setReviewsLoading(true);
    try {
      const data = await getResourceReviews(resourceId);
      setReviews(data);
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadVotes = async (resourceId: string, userId: string) => {
    try {
      const v = await getResourceVote(resourceId, userId);
      setUserVote(v);
      const counts = await getResourceVotesCount(resourceId);
      setVoteCounts(counts);
    } catch (err) {
      console.warn('Failed to load votes:', err);
    }
  };

  const loadRelated = async (subjectId: string, currentId: string) => {
    try {
      const all = await getResources({ subjectId });
      setRelatedResources(all.filter((r) => r.id !== currentId).slice(0, 3));
    } catch (err) {
      console.warn('Failed to load related:', err);
    }
  };

  if (!isOpen || !resource) return null;

  const isOwner = user && user.uid === resource.uploadedBy;
 const ADMIN_EMAIL = 'suryakalagollapalli268@gmail.com';

const isAdmin = user?.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleVote = async (voteType: 'helpful' | 'unhelpful') => {
    if (!user) return;
    setVotingLoading(true);
    try {
      const res = await voteResource(resource.id, user.uid, voteType);
      setUserVote(voteType);
      setVoteCounts({ helpful: res.helpfulVotes, unhelpful: res.unhelpfulVotes });
    } catch (err) {
      console.error('Vote error:', err);
    } finally {
      setVotingLoading(false);
    }
  };

  const handleToggleCompleted = async () => {
    if (!user) return;
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    if (nextState) {
      await recordStudyActivity(user.uid, {
        resourceId: resource.id,
        resourceTitle: resource.title,
        subjectName: resource.subjectName,
        type: resource.type,
        action: 'completed',
      });
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewError('You must be signed in to submit a review.');
      return;
    }
    if (!newComment.trim()) {
      setReviewError('Please enter a review comment.');
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);
    try {
      const created = await addResourceReview(resource.id, {
        userId: user.uid,
        userName: profile?.displayName || user.displayName || 'Student',
        userPhotoUrl: profile?.photoURL || user.photoURL || '',
        rating: newRating,
        comment: newComment.trim(),
      });
      // Replace if existing review by this user or prepend
      setReviews((prev) => [created, ...prev.filter((r) => r.userId !== user.uid)]);
      setNewComment('');
      setNewRating(5);
    } catch (err: any) {
      setReviewError(err?.message || 'Could not submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;
    try {
      await deleteResourceReview(resource.id, reviewId, user.uid);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err: any) {
      console.error('Delete review error:', err);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingReport(true);
    try {
      await submitResourceReport({
        resourceId: resource.id,
        resourceTitle: resource.title,
        reportedBy: user.uid,
        reporterEmail: user.email || '',
        reason: reportReason,
        details: reportDetails,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportDetails('');
      }, 1500);
    } catch (err) {
      console.error('Report submission error:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const getYoutubeEmbed = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const activeResource = currentResource || resource;
  const youtubeId = activeResource.type === 'video' ? getYoutubeEmbed(activeResource.externalUrl) : null;
  const isPdf =
    activeResource.type === 'pdf' ||
    Boolean(activeResource.contentType?.toLowerCase().includes('pdf')) ||
    Boolean(activeResource.fileName?.toLowerCase().endsWith('.pdf')) ||
    Boolean(resolvedFile?.url?.toLowerCase().includes('.pdf'));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  resource.type === 'notes'
                    ? 'bg-indigo-100 text-indigo-700'
                    : resource.type === 'pdf'
                    ? 'bg-rose-100 text-rose-700'
                    : resource.type === 'video'
                    ? 'bg-amber-100 text-amber-700'
                    : resource.type === 'question_paper'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-sky-100 text-sky-700'
                }`}
              >
                {resource.type.replace('_', ' ')}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                {resource.branch} • {resource.academicYear} • Sem {resource.semester}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                {resource.subjectName}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 leading-snug">{resource.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Video Player Preview if YouTube */}
          {youtubeId && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={resource.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</h3>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {resource.description || 'No detailed description provided.'}
            </p>
          </div>

          {/* Quality Voting & Study Status Bar (Feature 1 & Feature 2) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Was this resource helpful?</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={votingLoading || !user}
                  onClick={() => handleVote('helpful')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border transition ${
                    userVote === 'helpful'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Mark as helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{voteCounts.helpful}</span>
                </button>
                <button
                  type="button"
                  disabled={votingLoading || !user}
                  onClick={() => handleVote('unhelpful')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border transition ${
                    userVote === 'unhelpful'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Mark as not helpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{voteCounts.unhelpful}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <button
                  type="button"
                  onClick={handleToggleCompleted}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{isCompleted ? 'Completed' : 'Mark Completed'}</span>
                </button>
              )}

              {user && (
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                  title="Report Issue with this resource"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              )}
            </div>
          </div>

          {/* Resource Metadata Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>
                Uploaded by: <strong className="text-slate-800">{activeResource.uploaderName}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>
                Added on: <strong className="text-slate-800">{new Date(activeResource.createdAt).toLocaleDateString()}</strong>
              </span>
            </div>
            {activeResource.fileName && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">
                  File name: <strong className="text-slate-800 font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{activeResource.fileName}</strong>
                </span>
              </div>
            )}
            {activeResource.fileSize ? (
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-400" />
                <span>
                  Size: <strong className="text-slate-800">{formatFileSize(activeResource.fileSize)}</strong>
                </span>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>
                Rating: <strong className="text-slate-800">{activeResource.averageRating ? activeResource.averageRating.toFixed(1) : 'Unrated'}</strong>{' '}
                ({reviews.length} reviews)
              </span>
            </div>
          </div>

          {/* Tags */}
          {activeResource.tags && activeResource.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {activeResource.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-600 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stale Blob URL Detection & Status Banner */}
          {resolvingFile && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200/60 rounded-xl flex items-center gap-2.5 text-xs text-indigo-700 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
              <span>Verifying and resolving secure cloud document link...</span>
            </div>
          )}

          {!resolvingFile && resolvedFile?.isStaleBlob && !resolvedFile.recovered && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-bold">Document Link Expired (ERR_FILE_NOT_FOUND)</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    This file was saved with an ephemeral browser blob reference (<code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono text-[11px]">blob:...</code>) which expired after the upload session. The link cannot be resolved.
                  </p>
                  {isOwner ? (
                    <p className="text-xs text-amber-900 font-semibold pt-1">
                      As the author, please upload a fresh copy using the "Upload Material" page so peers can view and download it.
                    </p>
                  ) : (
                    <p className="text-xs text-amber-800 pt-1">
                      Please request the student ({activeResource.uploaderName}) to re-upload this document.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!resolvingFile && resolvedFile?.recovered && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Document link verified and served from MongoDB GridFS.</span>
            </div>
          )}

          {/* Inline PDF Viewer */}
          {showInlinePdf && resolvedFile?.url && (
            <div className="w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-inner animate-in fade-in">
              <div className="px-4 py-2.5 bg-slate-800 text-white text-xs flex items-center justify-between">
                <span className="font-semibold flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  Preview: {activeResource.fileName || activeResource.title}
                </span>
                <button
                  type="button"
                  onClick={() => setShowInlinePdf(false)}
                  className="p-1 rounded text-slate-400 hover:text-white transition"
                  title="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <iframe
               src={`${previewUrl}#toolbar=1`}
                title={activeResource.title}
                className="w-full h-96 border-0 bg-white"
              />
            </div>
          )}

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {resolvedFile?.url && (
              <>
                {/* Preview in Browser / New Tab */}
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Document</span>
                </button>

                {/* Download Document */}
                <button
                  type="button"
                  disabled={downloading}
                  onClick={handleDownloadFile}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download File</span>
                    </>
                  )}
                </button>

                {/* Inline Viewer Toggle for PDFs */}
                {isPdf && (
                  <button
                    type="button"
                    onClick={() => setShowInlinePdf(!showInlinePdf)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{showInlinePdf ? 'Close Inline Viewer' : 'Inline PDF Viewer'}</span>
                  </button>
                )}
              </>
            )}

            {!resolvedFile?.url && activeResource.externalUrl && (
              <a
                href={activeResource.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{activeResource.type === 'video' ? 'Watch Lecture on Web' : 'Open External Link'}</span>
              </a>
            )}

            {user && (
              <button
                type="button"
                onClick={() => onToggleBookmark(activeResource.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition ${
                  isBookmarked
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{isBookmarked ? 'Bookmarked' : 'Save Bookmark'}</span>
              </button>
            )}

            {(isOwner || isAdmin) && onDeleteResource && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
                    onDeleteResource(activeResource.id);
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Related Resources Shelf (Feature 5) */}
          {relatedResources.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                More from {resource.subjectName}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {relatedResources.map((rel) => (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => {
                      if (onSelectRelatedResource) {
                        onSelectRelatedResource(rel);
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 text-left transition flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-indigo-700">
                        {rel.type.replace('_', ' ')}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2">
                      ⭐ {rel.averageRating || 'New'} ({rel.reviewCount || 0})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <hr className="border-slate-200" />

          {/* Reviews Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Student Reviews & Ratings ({reviews.length})
              </h3>
            </div>

            {/* Submit Review Form */}
            {user ? (
              <form onSubmit={handleAddReview} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Your Rating:</span>
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={newRating}
                      interactive={true}
                      onRatingChange={(r) => setNewRating(r)}
                      size="md"
                    />
                    <span className="text-xs font-bold text-slate-700">{newRating} / 5</span>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share feedback on clarity, exam relevance, syllabus completeness..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />

                {reviewError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Post Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                Please log in to submit a review for this resource.
              </p>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="py-6 text-center text-xs text-slate-500">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Star className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-xs font-medium text-slate-600">No reviews yet.</p>
                <p className="text-xs text-slate-400">Be the first student to review this study material!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {rev.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{rev.userName}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <StarRating rating={rev.rating} size="sm" />
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">{rev.comment}</p>
                      </div>
                    </div>

                    {(user?.uid === rev.userId || isAdmin) && (
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Report Modal (Feature 2) */}
      {showReportModal && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                Report Academic Material
              </h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold">Report Submitted</p>
                <p>Thank you for keeping Skill Exchange accurate and high-quality.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Help us maintain accuracy for all students. Why are you reporting "{resource.title}"?
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as ReportReason)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  >
                    <option value="broken_link">Broken Link / Missing URL</option>
                    <option value="incorrect_file">Incorrect / Corrupt Document</option>
                    <option value="duplicate">Duplicate Resource</option>
                    <option value="copyright">Copyright Issue</option>
                    <option value="inappropriate">Inappropriate / Unrelated Content</option>
                    <option value="other">Other Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Details (optional)</label>
                  <textarea
                    rows={2}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide additional details or correct syllabus link..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow transition"
                  >
                    {submittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
