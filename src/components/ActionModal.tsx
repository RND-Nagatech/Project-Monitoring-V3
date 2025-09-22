import React, { useState } from 'react';
import { X, Upload, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Inquiry, Attachment } from '../types';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  userRole?: string;
  actionType?: string;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, inquiry, userRole, actionType }) => {
  const { updateInquiry, user } = useApp();
  const [formData, setFormData] = useState<{
    type: string;
    fee: string;
    notes: string;
    attachments: (File | Attachment)[];
  }>({
    type: '',
    fee: '',
    notes: '',
    attachments: inquiry?.attachments || [], // Gunakan attachments yang sudah ada
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const produksiFileInputRef = React.useRef<HTMLInputElement>(null);
  const financeFileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inquiry) {
      setFormData({
        type: inquiry.type || '',
        fee: inquiry.fee?.toString() || '',
        notes: userRole !== 'produksi' ? '' : (inquiry.divisi_notes || ''),
        attachments: inquiry.attachments || [], // Pertahankan attachments yang sudah ada
      });
    }
  }, [inquiry, userRole]);

  if (!isOpen || !inquiry || !userRole) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Proses attachments untuk disimpan
      const formattedAttachments: Attachment[] = formData.attachments.map((file, index) => {
        // Jika sudah berupa Attachment (file yang sudah ada), gunakan langsung
        if ('id' in file && 'url' in file && 'name' in file && 'type' in file) {
          return file;
        }

        // Jika file baru (File object), konversi menjadi Attachment
        const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
        return {
          id: `${Date.now()}-${index}`,
          url: URL.createObjectURL(file),
          name: file.name,
          type: fileType,
        };
      });

      const updates: Partial<Inquiry> = {
        divisi: userRole,
        divisi_notes: formData.notes,
        attachments: formattedAttachments, // Simpan semua attachments (lama + baru)
      };

      // Record who processed this step
      if (user) {
        switch (userRole) {
          case 'produksi':
            updates.produksi_by = user.name;
            break;
          case 'qc':
            updates.qc_by = user.name;
            break;
          case 'finance':
            updates.finance_by = user.name;
            break;
          case 'helpdesk':
            updates.helpdesk_by = user.name;
            break;
        }
      }

      if (userRole === 'produksi') {
        updates.type = formData.type as 'berbayar' | 'gratis';
        if (formData.type === 'berbayar' && formData.fee) {
          updates.fee = parseInt(formData.fee);
        }
        // Set status based on type: berbayar -> wait for payment, gratis -> progress
        updates.status = formData.type === 'berbayar' ? 'wait for payment' : 'progress';
      } else if (userRole === 'qc') {
        if (actionType === 'proses') {
          updates.status = 'on progress QA';
        } else {
          updates.status = 'ready for update';
        }
      } else if (userRole === 'finance') {
        updates.status = 'paid off';
      } else if (userRole === 'helpdesk') {
        updates.status = actionType === 'selesai' ? 'selesai' : 'batal';
      }

      updateInquiry(inquiry.id, updates);
      onClose();
    } catch (error) {
      console.error('Error updating inquiry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Tambahkan file baru ke attachments yang sudah ada, bukan mengganti
      setFormData(prev => ({ 
        ...prev, 
        attachments: [...prev.attachments, ...filesArray] 
      }));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      // Tambahkan file baru ke attachments yang sudah ada, bukan mengganti
      setFormData(prev => ({ 
        ...prev, 
        attachments: [...prev.attachments, ...filesArray] 
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const formatNumber = (value: string) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    // Format with thousand separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseNumber = (formattedValue: string) => {
    // Remove thousand separators for storage
    return formattedValue.replace(/\./g, '');
  };

  const renderFormFields = () => {
    switch (userRole) {
      case 'produksi':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type Project *
              </label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-700 text-base font-medium transition-all duration-150 appearance-none cursor-pointer shadow-sm"
                  style={{ minHeight: '44px', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                  required
                >
                  <option value="" disabled hidden>Pilih Tipe Project</option>
                  <option value="berbayar">Berbayar</option>
                  <option value="gratis">Gratis</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
            </div>

            {formData.type === 'berbayar' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee (Rp)
                </label>
                <input
                  type="text"
                  value={formData.fee ? formatNumber(formData.fee) : ''}
                  onChange={(e) => {
                    const rawValue = parseNumber(e.target.value);
                    setFormData(prev => ({ ...prev, fee: rawValue }));
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  required={formData.type === 'berbayar'}
                  style={{ MozAppearance: 'textfield' }}
                  onWheel={(e) => e.currentTarget.blur()} // Prevent scroll wheel from changing value
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Attachment
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`w-full p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
                onClick={() => produksiFileInputRef.current?.click()}
              >
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG, GIF up to 10MB</p>
                  </div>
                </div>
                <input
                  id="file-input-produksi"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={produksiFileInputRef}
                />
              </div>
              {formData.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">File yang Diupload ({formData.attachments.length})</h4>
                  <div className="space-y-3">
                    {formData.attachments.map((file, index) => {
                      // Tentukan tipe file dan ukuran
                      const isAttachment = 'id' in file && 'url' in file;
                      const fileType = isAttachment ? file.type : (file.type.startsWith('image/') ? 'image' : 'pdf');
                      const fileSize = isAttachment ? (file as any).size || 0 : file.size;
                      const fileUrl = isAttachment ? file.url : URL.createObjectURL(file);

                      return (
                        <div key={index} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              {fileType === 'image' ? (
                                <div className="relative">
                                  <img
                                    src={fileUrl}
                                    alt={file.name}
                                    className="w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm"
                                  />
                                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    ✓
                                  </div>
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center border-2 border-white shadow-sm">
                                  <FileText size={20} className="text-red-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                {fileSize > 0 && (
                                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                    {(fileSize / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {fileType === 'image' ? 'Gambar' : 'PDF'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                attachments: prev.attachments.filter((_, i) => i !== index),
                              }));
                            }}
                            className="flex-shrink-0 ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus file"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        );

      case 'finance':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Bukti Pembayaran
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`w-full p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                isDragOver 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
              }`}
              onClick={() => financeFileInputRef.current?.click()}
            >
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-orange-600 hover:text-orange-500">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                </div>
              </div>
              <input
                id="file-input-finance"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                onChange={handleFileChange}
                className="hidden"
                ref={financeFileInputRef}
              />
            </div>
            {formData.attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">File yang Diupload ({formData.attachments.length})</h4>
                <div className="space-y-3">
                  {formData.attachments.map((file, index) => {
                    // Tentukan tipe file dan ukuran
                    const isAttachment = 'id' in file && 'url' in file;
                    const fileType = isAttachment ? file.type : (file.type.startsWith('image/') ? 'image' : 'pdf');
                    const fileSize = isAttachment ? (file as any).size || 0 : file.size;
                    const fileUrl = isAttachment ? file.url : URL.createObjectURL(file);

                    return (
                      <div key={index} className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {fileType === 'image' ? (
                              <div className="relative cursor-pointer group" onClick={() => window.open(fileUrl, '_blank')}>
                                <img
                                  src={fileUrl}
                                  alt={file.name}
                                  className="w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm group-hover:shadow-md transition-shadow"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  ✓
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                  <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-medium">Lihat</span>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center border-2 border-white shadow-sm cursor-pointer hover:bg-red-200 transition-colors"
                                onClick={() => window.open(fileUrl, '_blank')}
                                title="Klik untuk melihat PDF"
                              >
                                <FileText size={20} className="text-red-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium truncate ${fileType === 'pdf' ? 'text-blue-600 hover:text-blue-800 cursor-pointer hover:underline' : 'text-gray-900'}`}
                              onClick={fileType === 'pdf' ? () => window.open(fileUrl, '_blank') : undefined}
                              title={fileType === 'pdf' ? 'Klik untuk melihat PDF' : undefined}
                            >
                              {file.name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {fileSize > 0 && (
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                  {(fileSize / 1024 / 1024).toFixed(2)} MB
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {fileType === 'image' ? 'Gambar' : 'PDF'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              attachments: prev.attachments.filter((_, i) => i !== index),
                            }));
                          }}
                          className="flex-shrink-0 ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus file"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (userRole) {
      case 'produksi': return 'Update Produksi';
      case 'qc': return 'QC Review';
      case 'finance': return 'Finance Action';
      case 'helpdesk': return 'Helpdesk Action';
      default: return 'Action';
    }
  };

  const getSubmitButtonText = () => {
    switch (userRole) {
      case 'produksi': return 'Update Data';
      case 'qc': return actionType === 'proses' ? 'Proses' : 'Selesai Inquiry';
      case 'finance': return 'Selesai Inquiry';
      case 'helpdesk': return actionType === 'selesai' ? 'Selesai Inquiry' : 'Batal Inquiry';
      default: return 'Update';
    }
  };

  const getSubmitButtonColor = () => {
    switch (userRole) {
      case 'produksi': return 'bg-blue-600 hover:bg-blue-700';
      case 'qc': return 'bg-green-600 hover:bg-green-700';
      case 'finance': return 'bg-orange-600 hover:bg-orange-700';
      case 'helpdesk': return actionType === 'selesai' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const getSubmitIcon = () => {
    switch (userRole) {
      case 'helpdesk': return actionType === 'selesai' ? <CheckCircle size={20} /> : <XCircle size={20} />;
      default: return <CheckCircle size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {getModalTitle()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Inquiry Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
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
          </div>

          {/* Dynamic Form Fields */}
          {renderFormFields()}

          {/* Notes Field */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tambahkan catatan..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-3 ${getSubmitButtonColor()} text-white rounded-lg transition-colors flex items-center justify-center gap-2`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {getSubmitIcon()}
                  {getSubmitButtonText()}
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;