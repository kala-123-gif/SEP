import React from 'react';
import { Resource } from '../../types';
import {
  FileText,
  FileCode,
  Video,
  FileDown,
  Bookmark,
  Star,
  ExternalLink,
  Clock,
  User,
  Layers,
} from 'lucide-react';
import { StarRating } from '../reviews/StarRating';

interface ResourceCardProps {
  resource: Resource;
  isBookmarked: boolean;
  onToggleBookmark: (resourceId: string) => void;
  onOpenDetails: (resource: Resource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isBookmarked,
  onToggleBookmark,
  onOpenDetails,
}) => {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'notes':
        return {
          label: 'Notes',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
          icon: <FileText className="w-3.5 h-3.5" />,
        };
      case 'pdf':
        return {
          label: 'PDF Document',
          bg: 'bg-rose-50 text-rose-700 border-rose-200/60',
          icon: <FileDown className="w-3.5 h-3.5" />,
        };
      case 'video':
        return {
          label: 'Video Lecture',
          bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
          icon: <Video className="w-3.5 h-3.5" />,
        };
      case 'question_paper':
        return {
          label: 'Question Paper',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
          icon: <FileCode className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: 'Reference Material',
          bg: 'bg-sky-50 text-sky-700 border-sky-200/60',
          icon: <Layers className="w-3.5 h-3.5" />,
        };
    }
  };

  const badge = getTypeBadge(resource.type);

  const formatSize = (bytes?: number) => {
    if (!bytes) return null;
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Top Banner / Type */}
      <div className="p-5 pb-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
          >
            {badge.icon}
            {badge.label}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(resource.id);
            }}
            className={`p-1.5 rounded-lg border transition ${
              isBookmarked
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Add to Bookmarks'}
            aria-label="Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenDetails(resource)}
          className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer mb-2"
        >
          {resource.title}
        </h3>

        {/* Subject & Academic Context */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-indigo-700 bg-indigo-50/70 inline-block px-2 py-0.5 rounded border border-indigo-100 mb-1">
            {resource.subjectName}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span>{resource.branch}</span>
            <span>•</span>
            <span>{resource.academicYear}</span>
            <span>•</span>
            <span>Sem {resource.semester}</span>
            {resource.fileSize && (
              <>
                <span>•</span>
                <span>{formatSize(resource.fileSize)}</span>
              </>
            )}
            {resource.fileName && (
              <>
                <span>•</span>
                <span className="truncate max-w-[120px] font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-600" title={resource.fileName}>
                  {resource.fileName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {resource.description || 'No detailed description.'}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-2">
            {resource.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
              >
                #{tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium">
                +{resource.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <StarRating rating={resource.averageRating || 0} size="sm" />
          <span className="font-semibold text-slate-700">
            {resource.averageRating ? resource.averageRating.toFixed(1) : 'New'}
          </span>
          <span className="text-slate-400">({resource.reviewCount || 0})</span>
        </div>

        <button
          onClick={() => onOpenDetails(resource)}
          className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
        >
          <span>View Resource</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
