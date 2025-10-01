import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { Inquiry } from '../types';

interface ProcessInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onProcess: (notes: string) => void;
}

const ProcessInquiryModal: React.FC<ProcessInquiryModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onProcess
}) => {
  const [notes, setNotes] = useState('');

  const handleProcess = () => {
  onProcess(notes);
  setNotes('');
  // Modal akan ditutup dari parent setelah update sukses
  };

  if (!isOpen || !inquiry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Proses Inquiry</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Inquiry Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-800 mb-3">Inquiry Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p className="text-gray-600">
                <span className="font-medium">Toko:</span> {inquiry.nama_toko}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">WhatsApp:</span> {inquiry.nomor_whatsapp_customer}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Status:</span> {inquiry.status}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Created:</span> {new Date(inquiry.created_at).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Created by:</span> {inquiry.created_by || '-'}
              </p>
              {inquiry.edited_by && inquiry.edited_at && (
                <p className="text-gray-600">
                  <span className="font-medium">Edited by:</span> {inquiry.edited_by} ({new Date(inquiry.edited_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })})
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-medium">Produksi by:</span> {inquiry.produksi_by || '-'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">QC by:</span> {inquiry.qc_by || '-'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Finance by:</span> {inquiry.finance_by || '-'}
              </p>
              {inquiry.helpdesk_by && (
                <p className="text-gray-600">
                  <span className="font-medium">Helpdesk by:</span> {inquiry.helpdesk_by}
                </p>
              )}
            </div>
            {inquiry.attachments && inquiry.attachments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Lampiran</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {inquiry.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center shadow border border-gray-200"
                    >
                      {attachment.type === 'pdf' ? (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-2 w-full"
                        >
                          <FileText size={40} className="text-blue-500 mb-2" />
                          <span className="font-medium text-gray-800 text-center break-all">{attachment.name}</span>
                          <span className="text-xs text-gray-500">Klik untuk membuka</span>
                        </a>
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center gap-2 w-full"
                        >
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="w-24 h-24 object-cover rounded mb-2 border"
                          />
                          <span className="font-medium text-gray-800 text-center break-all">{attachment.name}</span>
                          <span className="text-xs text-gray-500">Klik untuk membuka</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes Field */}
          <div>
            <label htmlFor="process-notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="process-notes"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-300 resize-none"
              placeholder="Tambahkan catatan proses..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleProcess}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Mulai Proses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessInquiryModal;