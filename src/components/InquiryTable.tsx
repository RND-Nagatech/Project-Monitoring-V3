import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Attachment, Inquiry } from '../types';
import ActionModal from './ActionModal';
import DeskripsiModal from './DeskripsiModal';
import EditInquiryModal from './EditInquiryModal';
import ProcessInquiryModal from './ProcessInquiryModal';
import CompleteInquiryModal from './CompleteInquiryModal';
import { useExportToPDF } from '../hooks/useExportToPDF';
import { handleFollowUp } from '../services/whatsappService';
import Pagination from './Pagination';
import FilePreviewModal from './FilePreviewModal';
import InquiryFilters from './InquiryFilters';
import InquiryRow from './InquiryRow';


const InquiryTable: React.FC = () => {
  const {
    inquiries,
    user,
    updateInquiry,
    pagination,
    setPage,
    setRowsPerPage,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
  } = useApp();
  const { exportToPDF } = useExportToPDF();

  // For action menu (three dots)
  const [selectedActionInquiryId, setSelectedActionInquiryId] = useState<string | null>(null);

  // For modals (edit, detail, etc)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDeskripsiModalOpen, setIsDeskripsiModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editInquiry, setEditInquiry] = useState<Inquiry | null>(null);
  const [actionType, setActionType] = useState<string>('cancel');
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processInquiry, setProcessInquiry] = useState<Inquiry | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completeInquiry, setCompleteInquiry] = useState<Inquiry | null>(null);

  const openActionModal = (inquiry: Inquiry, actionType?: string) => {
    setSelectedInquiry(inquiry);
    setActionType(actionType || 'cancel');
    setIsModalOpen(true);
  };

  const openEditModal = (inquiry: Inquiry) => {
    setEditInquiry(inquiry);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditInquiry(null);
  };

  const openProcessModal = (inquiry: Inquiry) => {
    setProcessInquiry(inquiry);
    setIsProcessModalOpen(true);
  };

  const closeProcessModal = () => {
    setIsProcessModalOpen(false);
    setProcessInquiry(null);
  };

  const openCompleteModal = (inquiry: Inquiry) => {
    setCompleteInquiry(inquiry);
    setIsCompleteModalOpen(true);
  };

  const closeCompleteModal = () => {
    setIsCompleteModalOpen(false);
    setCompleteInquiry(null);
  };

  const closePreview = () => {
    setPreviewAttachment(null);
  };



  return (
<div
  className="bg-white rounded-lg shadow-sm border overflow-hidden"
  onClick={(e) => {
    const target = e.target as Element;

    const isActionButton = target.closest(".action-menu-button");
    const isActionDropdown = target.closest(".action-menu-dropdown");

    if (
      selectedActionInquiryId &&
      !isActionButton &&
      !isActionDropdown
    ) {
      setSelectedActionInquiryId(null); // tutup menu kalau klik di luar
    }
  }}
>
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Daftar Inquiry</h2>
      </div>

      {/* Filters and Search Bar */}
      <InquiryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        rowsPerPage={pagination.limit}
        setRowsPerPage={setRowsPerPage}
      />

      {/* Table */}
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
                Nama Toko
              </th>
              <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 min-w-[100px]">
                No. HP
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
                Tipe
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
            {inquiries.map((inquiry, index) => (
              <InquiryRow
                key={inquiry.id}
                inquiry={inquiry}
                index={index}
                page={pagination.page}
                rowsPerPage={pagination.limit}
                userRole={user?.role || ''}
                selectedActionInquiryId={selectedActionInquiryId}
                setSelectedActionInquiryId={setSelectedActionInquiryId}
                onEdit={openEditModal}
                onAction={openActionModal}
                onFollowUp={(inquiry) => handleFollowUp(inquiry.nomor_whatsapp_customer, inquiry.nama_toko, inquiry)}
                onProcess={openProcessModal}
                onComplete={openCompleteModal}
                onViewDescription={(inquiry) => { setSelectedInquiry(inquiry); setIsDeskripsiModalOpen(true); }}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls (below table) */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.pages}
        onPageChange={setPage}
      />

      {/* Deskripsi Detail Modal */}
      <DeskripsiModal
        isOpen={isDeskripsiModalOpen}
        onClose={() => setIsDeskripsiModalOpen(false)}
        inquiry={selectedInquiry}
        onExportPDF={exportToPDF}
      />

      {/* Action Modal */}
      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inquiry={selectedInquiry}
        userRole={user?.role}
        actionType={actionType}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        attachment={previewAttachment}
        onClose={closePreview}
      />

      {/* Edit Modal for Helpdesk */}
      <EditInquiryModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        inquiry={editInquiry}
        onSave={(updates) => {
          console.log('InquiryTable: EditInquiryModal onSave called with updates:', updates);
          if (editInquiry) {
            console.log('InquiryTable: Calling updateInquiry for edit with ID:', editInquiry.id);
            updateInquiry(editInquiry.id, updates);
          }
        }}
        user={user}
      />

      {/* Process Modal for Produksi */}
      <ProcessInquiryModal
        isOpen={isProcessModalOpen}
        onClose={closeProcessModal}
        inquiry={processInquiry}
        onProcess={async (notes) => {
          if (processInquiry) {
            try {
              let defaultNotes = notes;
              if (!notes || notes.trim() === '') {
                if (user?.role === 'qc') {
                  defaultNotes = 'Sedang diproses oleh QA';
                } else if (user?.role === 'helpdesk') {
                  defaultNotes = 'Sedang diproses oleh Helpdesk';
                } else if (user?.role === 'finance') {
                  defaultNotes = 'Sedang diproses oleh Finance';
                } else {
                  defaultNotes = 'Sedang diproses oleh produksi';
                }
              }
              await updateInquiry(processInquiry.id, {
                divisi: user?.role || 'produksi',
                produksi_by: user?.name,
                status: 'progress' as const,
                updated_at: new Date().toISOString(),
                notes: [
                  {
                    content: defaultNotes,
                    created_by: user?.name || '',
                    created_at: new Date().toISOString(),
                  }
                ]
              });
              closeProcessModal();
            } catch (error) {
              let errorMsg = 'Unknown error';
              if (
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                typeof (error as any).response?.data?.message === 'string'
              ) {
                errorMsg = (error as any).response.data.message;
              } else if (typeof error === 'string') {
                errorMsg = error;
              } else if (
                typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as any).message === 'string'
              ) {
                errorMsg = (error as any).message;
              }
              alert('Gagal update inquiry: ' + errorMsg);
            }
          }
        }}
      />

      {/* Complete Modal for Produksi */}
      <CompleteInquiryModal
        isOpen={isCompleteModalOpen}
        onClose={closeCompleteModal}
        inquiry={completeInquiry}
        onComplete={async (notes) => {
          console.log('InquiryTable: CompleteInquiryModal onComplete called with notes:', notes);
          if (completeInquiry) {
            console.log('InquiryTable: completeInquiry ID:', completeInquiry.id, 'type:', typeof completeInquiry.id);
            if (!completeInquiry.id) {
              console.error('InquiryTable: completeInquiry.id is undefined!');
              return;
            }
            let defaultNotes = notes;
            if (!notes || notes.trim() === '') {
              if (user?.role === 'qc') {
                defaultNotes = 'Telah diselesaikan oleh QA';
              } else if (user?.role === 'helpdesk') {
                defaultNotes = 'Telah diselesaikan oleh Helpdesk';
              } else if (user?.role === 'finance') {
                defaultNotes = 'Telah diselesaikan oleh Finance';
              } else {
                defaultNotes = 'Telah diselesaikan oleh produksi';
              }
            }
            const updateData = {
              divisi: user?.role || 'produksi',
              produksi_by: user?.name,
              status: 'on going QA' as const,
              updated_at: new Date().toISOString(),
              notes: [
                {
                  content: defaultNotes,
                  created_by: user?.name || '',
                  created_at: new Date().toISOString(),
                }
              ]
            };
            console.log('InquiryTable: Calling updateInquiry for complete with ID:', completeInquiry.id, 'data:', updateData);
            try {
              await updateInquiry(completeInquiry.id, updateData);
              closeCompleteModal();
            } catch (error) {
              let errorMsg = 'Unknown error';
              if (
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                typeof (error as any).response?.data?.message === 'string'
              ) {
                errorMsg = (error as any).response.data.message;
              } else if (typeof error === 'string') {
                errorMsg = error;
              } else if (
                typeof error === 'object' &&
                error !== null &&
                'message' in error &&
                typeof (error as any).message === 'string'
              ) {
                errorMsg = (error as any).message;
              }
              alert('Gagal update inquiry: ' + errorMsg);
            }
          }
        }}
      />

    </div>
  );
};

export default InquiryTable;