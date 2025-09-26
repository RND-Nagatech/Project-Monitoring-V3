import React, { useState, useRef } from 'react';
import { FileText, ClipboardList, MoreVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Attachment, Inquiry } from '../types';

const InquiryTable: React.FC<{ 
  openDetailModal: (inquiry: Inquiry) => void;
  setPreviewAttachment: (attachment: Attachment | null) => void;
  openEditModal: (inquiry: Inquiry) => void;
  openActionModal: (inquiry: Inquiry, action?: string) => void;
  openProcessModal: (inquiry: Inquiry) => void;
  openCompleteModal: (inquiry: Inquiry) => void;
}> = ({ openDetailModal, setPreviewAttachment, openEditModal, openActionModal, openProcessModal, openCompleteModal }) => {
  const { inquiries, user } = useApp();
  // For action menu (three dots)
  const [selectedActionInquiryId, setSelectedActionInquiryId] = useState<string | null>(null);
  // For modals (edit, detail, etc)
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const rowsDropdownRef = useRef<HTMLDivElement>(null);

  const handleFollowUp = (whatsappNumber: string, namaToko: string, inquiry: Inquiry) => {
    let biayaMsg = '';
    if (inquiry.type === 'berbayar') {
      biayaMsg = `Permintaan Anda dikenakan biaya sebesar ${inquiry.fee ? inquiry.fee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }) : '-'}.`;
    } else if (inquiry.type === 'gratis') {
      biayaMsg = 'Permintaan Anda tidak dikenakan biaya (gratis).';
    } else {
      biayaMsg = 'Status biaya permintaan Anda belum ditentukan.';
    }
    const statusMsg = `Status permintaan Anda saat ini: ${inquiry.status === 'progress' ? 'Sedang diproses' : inquiry.status === 'selesai' ? 'Sudah selesai' : inquiry.status === 'wait for payment' ? 'Menunggu pembayaran' : inquiry.status === 'on going QA' ? 'Sedang dalam Quality Assurance' : inquiry.status === 'on progress QA' ? 'Sedang dalam Quality Assurance' : inquiry.status === 'paid off' ? 'Sudah dibayar' : inquiry.status === 'ready for update' ? 'Siap untuk diupdate' : inquiry.status === 'pending' ? 'Masih dalam tahap pengajuan' : inquiry.status}.`;
    const message = `Halo ${namaToko},\n\n${biayaMsg}\n${statusMsg}\n\nTerima kasih telah menggunakan layanan kami.`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'selesai': return 'bg-green-100 text-green-800 border-green-200';
      case 'batal': return 'bg-red-100 text-red-800 border-red-200';
      case 'wait for payment': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'on going QA': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'on progress QA': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'paid off': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ready for update': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDivisiColor = (divisi: string | undefined) => {
    switch (divisi?.toLowerCase()) {
      case 'produksi': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'qc': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'finance': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'helpdesk': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Pagination logic
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(inquiries.length / rowsPerPage);
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch =
      inquiry.nama_toko?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.nomor_whatsapp_customer?.includes(searchTerm) ||
      inquiry.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || inquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  const pagedInquiries = filteredInquiries.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-t-2xl p-6 border-b border-slate-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Daftar Inquiry</h2>
              <p className="text-sm text-slate-100">Kelola dan pantau semua permintaan inquiry</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-100">Total Records</p>
            <p className="text-2xl font-bold text-white">{inquiries.length}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-gray-50 p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Cari Inquiry</label>
              <input
                type="text"
                placeholder="Cari berdasarkan nama toko, nomor HP, atau deskripsi..."
                className="w-full min-w-[300px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all bg-white shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Filter Status</label>
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-700 bg-white shadow-sm hover:shadow-md transition-all duration-200 min-w-[200px] flex items-center justify-between cursor-pointer"
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
                    style={{ maxHeight: '160px' }}
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
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Baris per Halaman</label>
            <div className="relative" ref={rowsDropdownRef}>
              <button
                onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-700 bg-white shadow-sm hover:shadow-md transition-all duration-200 min-w-[120px] flex items-center justify-between cursor-pointer"
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
        </div>
      </div>      {/* Table */}
      <div className="mb-2 sm:hidden">
        <p className="text-xs text-gray-500 text-center">Geser ke samping untuk melihat semua kolom →</p>
      </div>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 w-12 sm:w-16">
                No
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 min-w-[120px]">
                Nama Toko & No. HP
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden md:table-cell min-w-[150px]">
                Deskripsi
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden lg:table-cell min-w-[80px]">
                Divisi
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden xl:table-cell min-w-[120px]">
                Divisi Notes
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden sm:table-cell min-w-[80px]">
                Fee
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 min-w-[100px]">
                Status
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 hidden md:table-cell min-w-[100px]">
                Lampiran
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 min-w-[80px]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {pagedInquiries.map((inquiry, index) => (
              <tr key={inquiry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">
                  {(page - 1) * rowsPerPage + index + 1}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-medium">
                  <div className="space-y-1">
                    <div
                      className="font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-[180px]"
                      style={{ wordBreak: 'normal', whiteSpace: 'nowrap' }}
                      title={inquiry.nama_toko}
                    >
                      {inquiry.nama_toko}
                    </div>
                    <div className="text-xs text-gray-500">
                      {inquiry.nomor_whatsapp_customer}
                    </div>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-medium">
                  <button
                    className="bg-transparent border-0 p-0 m-0 text-gray-500 hover:text-blue-600 focus:outline-none cursor-pointer transition-colors font-medium whitespace-nowrap"
                    style={{ fontWeight: 500 }}
                    onClick={() => openDetailModal(inquiry)}
                  >
                    Lihat Detail
                  </button>
                </td>
      {/* Deskripsi Detail Modal */}
                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                  {inquiry.divisi ? (
                    <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getDivisiColor(inquiry.divisi)}`}>
                      {inquiry.divisi}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-sm">-</span>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-medium max-w-40 hidden xl:table-cell">
                  {inquiry.divisi_notes ? (
                    <div className="truncate text-gray-500" title={inquiry.divisi_notes}>
                      {inquiry.divisi_notes}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 font-medium hidden sm:table-cell">
                  {/* FEE COLUMN */}
                  {inquiry.fee !== undefined && inquiry.fee !== null ? (
                    <span className="text-gray-500">{inquiry.fee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 font-medium hidden md:table-cell">
                  {inquiry.attachments && inquiry.attachments.length > 0 ? (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {inquiry.attachments.map((att) => (
                        <button
                          key={att.id}
                          onClick={() => setPreviewAttachment(att)}
                          className="inline-flex items-center gap-1 px-1 sm:px-2 py-1 bg-gray-100 rounded text-xs text-blue-600 hover:underline"
                          title={att.name}
                        >
                          <FileText size={12} className="sm:w-4 sm:h-4" />
                          <span className="truncate max-w-[60px] sm:max-w-none">{att.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>

                <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                  <div className="relative flex items-center justify-center">
                    <button
                      className="p-1 sm:p-2 text-gray-400 hover:text-blue-600 rounded-full transition-colors focus:outline-none"
                      title="Aksi"
                      onClick={() => setSelectedActionInquiryId(inquiry.id === selectedActionInquiryId ? null : inquiry.id)}
                    >
                      <MoreVertical size={16} className="sm:w-5 sm:h-5" />
                    </button>
                    {/* Dropdown menu */}
                    {selectedActionInquiryId === inquiry.id && (
                      <div ref={actionMenuRef} className="absolute right-0 mt-2 min-w-[140px] bg-white border border-gray-200 rounded-xl shadow-xl z-20 animate-fadeIn flex flex-col py-2">
                        {user?.role === 'helpdesk' && (
                          <>
                            <button
                              onClick={() => { if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') { openEditModal(inquiry); setSelectedActionInquiryId(null); } }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-t-xl transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                              disabled={inquiry.status === 'batal' || inquiry.status === 'selesai'}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => { if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') { openActionModal(inquiry, 'selesai'); setSelectedActionInquiryId(null); } }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                              disabled={inquiry.status === 'batal' || inquiry.status === 'selesai'}
                            >
                              Selesai
                            </button>
                            <button
                              onClick={() => { openActionModal(inquiry, 'batal'); setSelectedActionInquiryId(null); }}
                              className="w-full text-left px-4 py-2 text-sm font-medium transition-colors text-gray-700 hover:bg-red-50 hover:text-red-700"
                            >
                              Batalkan
                            </button>
                            <button
                              onClick={() => { if (inquiry.status !== 'batal') { handleFollowUp(inquiry.nomor_whatsapp_customer, inquiry.nama_toko, inquiry); setSelectedActionInquiryId(null); } }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-b-xl transition-colors ${inquiry.status === 'batal' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                              disabled={inquiry.status === 'batal'}
                            >
                              Follow Up
                            </button>
                          </>
                        )}
                        {user?.role === 'produksi' && (
                          <>
                            <button
                              onClick={() => { if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') { openActionModal(inquiry); setSelectedActionInquiryId(null); } }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-t-xl transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                              disabled={inquiry.status === 'batal' || inquiry.status === 'selesai'}
                            >
                              Update
                            </button>
                            <button
                              onClick={() => { 
                                if (inquiry.status !== 'batal' && inquiry.status !== 'selesai' && inquiry.status !== 'progress' && inquiry.status !== 'wait for payment') { 
                                  openProcessModal(inquiry);
                                  setSelectedActionInquiryId(null);
                                }
                              }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' || inquiry.status === 'progress' || inquiry.status === 'wait for payment' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-700'}`}
                              disabled={inquiry.status === 'batal' || inquiry.status === 'selesai' || inquiry.status === 'progress' || inquiry.status === 'wait for payment'}
                            >
                              Proses
                            </button>
                            <button
                              onClick={() => { 
                                if (inquiry.status === 'progress') { 
                                  openCompleteModal(inquiry);
                                  setSelectedActionInquiryId(null);
                                }
                              }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-b-xl transition-colors ${inquiry.status !== 'progress' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                              disabled={inquiry.status !== 'progress'}
                            >
                              Selesai
                            </button>
                          </>
                        )}
                        {user?.role === 'qc' && (
                          <>
                            <button
                              onClick={() => { if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') { openActionModal(inquiry, 'proses'); setSelectedActionInquiryId(null); } }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-t-xl transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                              disabled={inquiry.status === 'batal' || inquiry.status === 'selesai'}
                            >
                              Proses
                            </button>
                            <button
                              onClick={() => { openActionModal(inquiry, 'batal'); setSelectedActionInquiryId(null); }}
                              className="w-full text-left px-4 py-2 text-sm font-medium transition-colors text-gray-700 hover:bg-red-50 hover:text-red-700"
                            >
                              Batalkan
                            </button>
                            <button
                              onClick={() => { if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') { openActionModal(inquiry, 'selesai'); setSelectedActionInquiryId(null); } }}
                              className={`w-full text-left px-4 py-2 text-sm font-medium rounded-b-xl transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                              disabled={inquiry.status === 'batal' || inquiry.status === 'selesai'}
                            >
                              Selesai
                            </button>
                          </>
                        )}
                        {user?.role === 'finance' && (
                          <button
                            onClick={() => { if (inquiry.status !== 'batal' && inquiry.status !== 'selesai') { openActionModal(inquiry); setSelectedActionInquiryId(null); } }}
                            className={`w-full text-left px-4 py-2 text-sm font-medium rounded-xl transition-colors ${inquiry.status === 'batal' || inquiry.status === 'selesai' ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}
                            disabled={inquiry.status === 'batal' || inquiry.status === 'selesai'}
                          >
                            Update
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
      {/* Action Modal */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls (below table) */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 py-4 sm:py-6">
        <button
          className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
          onClick={() => setPage(p => Math.max(1, p - 1))}
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
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">→</span>
        </button>
      </div>

    </div>
  );
};

export default InquiryTable;