import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable pagination control.
 * Props:
 *   page        – current 0-indexed page number
 *   totalPages  – total page count
 *   onPageChange – fn(newPage) callback
 *   totalItems  – (optional) total item count for "Showing X–Y of Z" label
 *   pageSize    – (optional) items per page, required when totalItems is provided
 *   className   – (optional) extra wrapper class
 */
export default function Pagination({ page, totalPages, onPageChange, totalItems, pageSize, className = '' }) {
  if (!totalPages || totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const pages = [];
    const min = Math.max(0, page - delta);
    const max = Math.min(totalPages - 1, page + delta);

    for (let i = min; i <= max; i++) pages.push(i);

    // Prepend first page + ellipsis if needed
    if (pages[0] > 1) pages.unshift('...');
    if (pages[0] !== 0) pages.unshift(0);

    // Append ellipsis + last page if needed
    if (pages[pages.length - 1] < totalPages - 2) pages.push('...');
    if (pages[pages.length - 1] !== totalPages - 1) pages.push(totalPages - 1);

    return pages;
  };

  const start = totalItems != null ? page * pageSize + 1 : null;
  const end   = totalItems != null ? Math.min((page + 1) * pageSize, totalItems) : null;

  return (
    <div className={`flex items-center justify-between pt-4 border-t border-surface-border ${className}`}>
      {/* Item count label */}
      {totalItems != null ? (
        <span className="text-sm text-ink-muted">
          Showing {start}–{end} of {totalItems}
        </span>
      ) : (
        <span className="text-sm text-ink-muted">
          Page {page + 1} of {totalPages}
        </span>
      )}

      {/* Page controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="p-1.5 rounded-md text-ink-muted hover:bg-surface-hover hover:text-ink-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="px-1.5 text-sm text-ink-disabled select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-brand-500 text-white'
                  : 'text-ink-secondary hover:bg-surface-hover hover:text-ink-primary'
              }`}
            >
              {p + 1}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-1.5 rounded-md text-ink-muted hover:bg-surface-hover hover:text-ink-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
