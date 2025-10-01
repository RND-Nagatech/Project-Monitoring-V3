import React from 'react';
import { FileText } from 'lucide-react';
import { Inquiry } from '../types';
import ActionMenu from './ActionMenu';
import { getStatusColor, getTypeColor, getDivisiColor } from '../utils/colorUtils';

interface InquiryRowProps {
  inquiry: Inquiry;
  index: number;
  page: number;
  rowsPerPage: number;
  userRole: string;
  selectedActionInquiryId: string | null;
  setSelectedActionInquiryId: (id: string | null) => void;
  onEdit: (inquiry: Inquiry) => void;
  onAction: (inquiry: Inquiry, actionType?: string) => void;
  onFollowUp: (inquiry: Inquiry) => void;
  onProcess: (inquiry: Inquiry) => void;
  onComplete: (inquiry: Inquiry) => void;
  onViewDescription: (inquiry: Inquiry) => void;
}

const InquiryRow: React.FC<InquiryRowProps> = ({
  inquiry,
  index,
  page,
  rowsPerPage,
  userRole,
  selectedActionInquiryId,
  setSelectedActionInquiryId,
  onEdit,
  onAction,
  onFollowUp,
  onProcess,
  onComplete,
  onViewDescription,
}) => {

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">
        {(page - 1) * rowsPerPage + index + 1}
      </td>
      <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-medium">
        <div
          className="font-medium text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-[180px]"
          style={{ wordBreak: 'normal', whiteSpace: 'nowrap' }}
          title={inquiry.nama_toko}
        >
          {inquiry.nama_toko}
        </div>
      </td>
      <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-medium">
        {inquiry.nomor_whatsapp_customer}
      </td>
      <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-medium max-w-xs hidden md:table-cell">
        <button
          className="bg-transparent border-0 p-0 m-0 text-gray-500 hover:text-blue-600 focus:outline-none cursor-pointer transition-colors font-medium whitespace-nowrap"
          style={{ fontWeight: 500 }}
          onClick={() => onViewDescription(inquiry)}
        >
          Lihat Detail
        </button>
      </td>
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
        {Array.isArray(inquiry.notes) && inquiry.notes.length > 0 ? (
          <div className="truncate text-gray-500" title={inquiry.notes.map((n: {content: string}) => n.content).join(' | ')}>
            {/* Tampilkan note terakhir, atau semua jika mau */}
            {inquiry.notes[inquiry.notes.length - 1].content}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
        {inquiry.type ? (
          <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getTypeColor(inquiry.type)}`}>
            {inquiry.type === 'berbayar' ? 'berbayar' : 'gratis'}
          </span>
        ) : (
          <span className="text-gray-400 text-xs sm:text-sm">-</span>
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
        <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full border ${getStatusColor(inquiry.status || '')}`}>
          {inquiry.status || 'Belum ditentukan'}
        </span>
      </td>
      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 font-medium hidden md:table-cell">
        {inquiry.attachments && inquiry.attachments.length > 0 ? (
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {inquiry.attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-1 sm:px-2 py-1 bg-gray-100 rounded text-xs text-blue-600 hover:underline"
                title={att.name}
              >
                <FileText size={12} className="sm:w-4 sm:h-4" />
                <span className="truncate max-w-[60px] sm:max-w-none">{att.name}</span>
              </a>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
        <ActionMenu
        inquiry={inquiry}
        userRole={userRole}
        selectedActionInquiryId={selectedActionInquiryId}
        setSelectedActionInquiryId={setSelectedActionInquiryId}
        onEdit={onEdit}
        onAction={onAction}
        onFollowUp={onFollowUp}
        onProcess={onProcess}
        onComplete={onComplete}
        />
      </td>
    </tr>
  );
};

export default InquiryRow;