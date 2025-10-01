import React from 'react';
import StatusFilterDropdown from './StatusFilterDropdown';
import RowsPerPageDropdown from './RowsPerPageDropdown';

interface InquiryFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  rowsPerPage: number;
  setRowsPerPage: (value: number) => void;
}

const InquiryFilters: React.FC<InquiryFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  rowsPerPage,
  setRowsPerPage,
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex justify-between items-center gap-4">
      <input
        type="text"
        placeholder="Search..."
        className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      <div className="flex gap-4 items-center">
        <StatusFilterDropdown
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <RowsPerPageDropdown
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
        />
      </div>
    </div>
  );
};

export default InquiryFilters;