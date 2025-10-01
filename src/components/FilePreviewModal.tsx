import React from 'react';
import { Download, X, FileText } from 'lucide-react';

interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'pdf';
}

interface FilePreviewModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ attachment, onClose }) => {
  if (!attachment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">{attachment.name}</h3>
          <div className="flex gap-2">
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Download"
            >
              <Download size={20} />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-4">
          {attachment.type === 'image' ? (
            <img
              src={attachment.url}
              alt={attachment.name}
              className="max-w-full max-h-[70vh] object-contain mx-auto"
            />
          ) : (
            <div className="text-center py-8">
              <FileText size={64} className="mx-auto text-red-600 mb-4" />
              <p className="text-gray-600">Preview PDF tidak tersedia</p>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buka di Tab Baru
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;