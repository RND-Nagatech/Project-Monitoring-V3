import React, { useState, useRef, useEffect } from 'react';

interface StatusFilterDropdownProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const StatusFilterDropdown: React.FC<StatusFilterDropdownProps> = ({
  statusFilter,
  setStatusFilter,
}) => {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">Filter Status</label>
      <div className="relative" ref={statusDropdownRef}>
        <button
          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white shadow-sm hover:shadow-md transition-all duration-200 min-w-[180px] flex items-center justify-between cursor-pointer"
        >
          <span className="truncate">
            {statusFilter === '' ? 'Semua Status' : statusFilter}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isStatusDropdownOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-y-auto custom-scroll"
            style={{ maxHeight: '160px' }} // 40px * 4 item
          >
            <button
              onClick={() => {
                setStatusFilter('');
                setIsStatusDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg"
            >
              Semua Status
            </button>
            <button
              onClick={() => {
                setStatusFilter('pending');
                setIsStatusDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Pending
            </button>
            <button
              onClick={() => {
                setStatusFilter('progress');
                setIsStatusDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Progress
            </button>
            <button
              onClick={() => {
                setStatusFilter('wait for payment');
                setIsStatusDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Wait for Payment
            </button>
            <button
              onClick={() => {
                setStatusFilter('on going QA');
                setIsStatusDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              On Going QA
            </button>
            <button
              onClick={() => {
                setStatusFilter('on progress QA');
                setIsStatusDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              On Progress QA
            </button>
            <button
              onClick={() => {
                setStatusFilter('ready for update');
                setIsStatusDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Ready for Update
            </button>
            <button
              onClick={() => {
                setStatusFilter('paid off');
                setIsStatusDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Paid Off
            </button>
            <button
              onClick={() => {
                setStatusFilter('selesai');
                setIsStatusDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Selesai
            </button>
            <button
              onClick={() => {
                setStatusFilter('batal');
                setIsStatusDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors last:rounded-b-lg"
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusFilterDropdown;