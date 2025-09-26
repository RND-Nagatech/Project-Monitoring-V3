import React from 'react';
import { FileText, Download, X } from 'lucide-react';
import { Attachment } from '../types';

interface FilePreviewModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  attachment,
  onClose,
}) => {
  if (!attachment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header dengan Gradient */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-t-2xl p-6 border-b border-slate-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Preview Lampiran</h2>
                <p className="text-sm text-slate-100 mt-1 truncate max-w-md">{attachment.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 text-sm border border-white border-opacity-30"
                title="Download File"
              >
                <Download size={16} />
                Download
              </a>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {attachment.type === 'image' ? (
              <div className="flex justify-center">
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText size={48} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Preview Tidak Tersedia</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  File ini tidak dapat dipreview secara langsung. Silakan download file untuk melihat isinya.
                </p>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <Download size={20} />
                  Buka di Tab Baru
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;