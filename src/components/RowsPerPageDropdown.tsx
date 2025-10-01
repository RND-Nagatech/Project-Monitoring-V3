import React, { useState, useRef, useEffect } from 'react';

interface RowsPerPageDropdownProps {
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
}

const RowsPerPageDropdown: React.FC<RowsPerPageDropdownProps> = ({
  rowsPerPage,
  setRowsPerPage,
}) => {
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);
  const rowsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rowsDropdownRef.current && !rowsDropdownRef.current.contains(e.target as Node)) {
        setIsRowsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Baris per Halaman</label>
      <div className="relative" ref={rowsDropdownRef}>
        <button
          onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white shadow-sm hover:shadow-md transition-all duration-200 min-w-[120px] flex items-center justify-between cursor-pointer"
        >
          <span>{rowsPerPage}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isRowsDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isRowsDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {[10, 25, 50, 100].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setRowsPerPage(num);
                  setIsRowsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  num === 10 ? 'rounded-t-lg' : num === 100 ? 'rounded-b-lg' : ''
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RowsPerPageDropdown;