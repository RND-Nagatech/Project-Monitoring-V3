import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 py-4 sm:py-6">
      <button
        className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        <span className="hidden sm:inline">Prev</span>
        <span className="sm:hidden">←</span>
      </button>
      <span className="text-xs sm:text-sm text-gray-600 px-2 sm:px-4">
        {page} / {totalPages || 1}
      </span>
      <button
        className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages || totalPages === 0}
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">→</span>
      </button>
    </div>
  );
};

export default Pagination;