import React from 'react';
import { FileText, Download, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Inquiry } from '../types';

interface DeskripsiModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onExportPDF?: (inquiry: Inquiry) => void;
}

const DeskripsiModal: React.FC<DeskripsiModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onExportPDF
}) => {
  if (!isOpen || !inquiry) return null;
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

  const getTypeColor = (type: string | undefined) => {
    switch (type) {
      case 'berbayar': return 'bg-blue-500 text-white border-blue-600';
      case 'gratis': return 'bg-green-100 text-green-800 border-green-200';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-10" onClick={onClose} />
      {/* Centered Modal */}
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b rounded-t-2xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Detail Inquiry</h2>
            <p className="text-sm text-gray-600 mt-1">{inquiry.nama_toko}</p>
          </div>
          <div className="flex gap-2">
            {onExportPDF && (
              <button
                onClick={() => onExportPDF(inquiry)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                title="Export ke PDF"
              >
                <Download size={16} />
                Export PDF
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-500" />
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
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(inquiry.status || '')}`}>
                    {inquiry.status || 'Belum ditentukan'}
                  </span>
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Tipe:</span>
                <p className="text-gray-800 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(inquiry.type)}`}>
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
                  {(() => {
                    const dateStr = inquiry.createdAt || inquiry.created_at;
                    if (dateStr && !isNaN(new Date(dateStr).getTime())) {
                      return new Date(dateStr).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    }
                    return 'Tanggal tidak tersedia';
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-800 prose prose-sm max-w-none">
              {inquiry.deskripsi ? (
                /<[a-z][\s\S]*>/i.test(inquiry.deskripsi)
                  ? (
                    <div dangerouslySetInnerHTML={{ __html: inquiry.deskripsi }} />
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({ src, alt, ...props }) => (
                          <img
                            src={src}
                            alt={alt || 'Image'}
                            className="max-w-full h-auto rounded-lg shadow-sm"
                            {...props}
                          />
                        ),
                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-700">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                      }}
                    >
                      {inquiry.deskripsi}
                    </ReactMarkdown>
                  )
              ) : (
                <p className="text-gray-500 italic">Tidak ada deskripsi</p>
              )}
            </div>
          </div>

          {/* Attachments */}
          {inquiry.attachments && inquiry.attachments.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3 text-lg">Lampiran</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inquiry.attachments.map((attachment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    {attachment.type === 'image' ? (
                      <div className="p-3">
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-full h-48 object-cover rounded"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            const parent = img.parentElement;
                            if (parent) {
                              img.style.display = 'none';
                              const fallback = parent.querySelector('.image-fallback') as HTMLElement;
                              if (fallback) {
                                fallback.style.display = 'flex';
                              }
                            }
                          }}
                        />
                        <div className="image-fallback hidden items-center justify-center h-48 bg-gray-100 text-gray-500">
                          <FileText size={48} />
                          <span className="mt-2 text-sm">Gagal memuat gambar</span>
                        </div>
                        <div className="mt-2 text-center">
                          <p className="text-sm text-gray-700 font-medium">{attachment.name}</p>
                        </div>
                      </div>
                    ) : (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <FileText size={24} className="text-gray-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{attachment.name}</p>
                          <p className="text-xs text-gray-500">Klik untuk membuka</p>
                        </div>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeskripsiModal;