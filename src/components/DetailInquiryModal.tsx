import React from 'react';
import { FileText, Download, X } from 'lucide-react';
import { Inquiry } from '../types';

interface DetailInquiryModalProps {
  isOpen: boolean;
  inquiry: Inquiry | null;
  onClose: () => void;
  onExportPDF: (inquiry: Inquiry) => void;
}

const DetailInquiryModal: React.FC<DetailInquiryModalProps> = ({
  isOpen,
  inquiry,
  onClose,
  onExportPDF,
}) => {
  if (!isOpen || !inquiry) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800 border-amber-300',
      progress: 'bg-blue-100 text-blue-800 border-blue-300',
      'on going QA': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'on progress QA': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'ready for update': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'wait for payment': 'bg-orange-100 text-orange-800 border-orange-300',
      'paid off': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      selesai: 'bg-green-100 text-green-800 border-green-300',
      batal: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTypeColor = (type: string) => {
    return type === 'berbayar'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getDivisiColor = (divisi: string) => {
    const colors: Record<string, string> = {
      produksi: 'bg-purple-100 text-purple-800 border-purple-300',
      qc: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      finance: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      helpdesk: 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return colors[divisi] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-slate-600 to-slate-700 rounded-t-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Detail Inquiry</h2>
              <p className="text-sm text-slate-100">{inquiry.nama_toko}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onExportPDF(inquiry)}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors text-sm border border-white border-opacity-30"
              title="Export ke PDF"
            >
              <Download size={16} />
              Export PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto">
          {/* Inquiry Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">Informasi Inquiry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Nama Toko:</span>
                <p className="text-gray-800 mt-1">{inquiry.nama_toko}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">No. WhatsApp:</span>
                <p className="text-gray-800 mt-1">{inquiry.nomor_whatsapp_customer}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <p className="text-gray-800 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status}
                  </span>
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Tipe:</span>
                <p className="text-gray-800 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(inquiry.type ?? "Gratis")}`}>
                    {inquiry.type === 'berbayar' ? 'Berbayar' : 'Gratis'}
                  </span>
                </p>
              </div>
              {inquiry.fee && inquiry.fee > 0 && (
                <div>
                  <span className="font-medium text-gray-600">Biaya:</span>
                  <p className="text-gray-800 mt-1 font-semibold">
                    {inquiry.fee.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                  </p>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-600">Tanggal Dibuat:</span>
                <p className="text-gray-800 mt-1">
                  {new Date(inquiry.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {inquiry.created_by && (
                <div>
                  <span className="font-medium text-gray-600">Dibuat Oleh:</span>
                  <p className="text-gray-800 mt-1">{inquiry.created_by}</p>
                </div>
              )}
              {inquiry.divisi && (
                <div>
                  <span className="font-medium text-gray-600">Divisi:</span>
                  <p className="text-gray-800 mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getDivisiColor(inquiry.divisi)}`}>
                      {inquiry.divisi}
                    </span>
                  </p>
                </div>
              )}
              {inquiry.divisi_notes && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-600">Catatan Divisi:</span>
                  <p className="text-gray-800 mt-1">{inquiry.divisi_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Deskripsi Permintaan</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div
                className="text-gray-800 prose prose-sm max-w-none"
                style={{ wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: inquiry.deskripsi }}
              />
            </div>
          </div>

          {/* Attachments */}
          {inquiry.attachments && inquiry.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3 text-lg">Lampiran</h3>
              <div className="flex flex-wrap gap-2">
                {inquiry.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    <FileText size={16} />
                    {attachment.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailInquiryModal;