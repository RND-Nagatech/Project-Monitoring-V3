import { useState } from 'react';

const InquiryTable = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  return (
    <div>
      {/* Dropdowns */}
      <div>
        <div className="relative inline-block w-full">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 bg-white shadow-md hover:shadow-lg transition-shadow appearance-none cursor-pointer"
            style={{ backgroundImage: 'url(data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 class=%22feather feather-chevron-down%22%3E%3Cpolyline points=%226 9 12 15 18 9%22/%3E%3C/svg%3E)', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem', paddingRight: '2.5rem' }}
          >
            <option value="" className="px-4 py-2">Semua Status</option>
            <option value="pending" className="px-4 py-2">Pending</option>
            <option value="progress" className="px-4 py-2">Progress</option>
            <option value="selesai" className="px-4 py-2">Selesai</option>
            <option value="batal" className="px-4 py-2">Batal</option>
          </select>
        </div>

        <div className="relative inline-block w-full">
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 bg-white shadow-md hover:shadow-lg transition-shadow appearance-none cursor-pointer"
            style={{ backgroundImage: 'url(data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 class=%22feather feather-chevron-down%22%3E%3Cpolyline points=%226 9 12 15 18 9%22/%3E%3C/svg%3E)', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem', paddingRight: '2.5rem' }}
          >
            <option value={10} className="px-4 py-2">10</option>
            <option value={25} className="px-4 py-2">25</option>
            <option value={50} className="px-4 py-2">50</option>
            <option value={100} className="px-4 py-2">100</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default InquiryTable;