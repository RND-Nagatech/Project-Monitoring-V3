import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface InquiryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  nomor_whatsapp_customer: string;
  nama_toko: string;
  deskripsi: string;
  attachments: File[];
}

const InquiryForm: React.FC<InquiryFormProps> = ({ isOpen, onClose }) => {
  const { addInquiry, user } = useApp();
  const [formData, setFormData] = useState<FormData>({
    nomor_whatsapp_customer: '',
    nama_toko: '',
    deskripsi: '',
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('nomor_whatsapp_customer', formData.nomor_whatsapp_customer);
      submitData.append('nama_toko', formData.nama_toko);
      submitData.append('deskripsi', formData.deskripsi);
      // submitData.append('status', 'pending'); // Removed automatic pending status
      submitData.append('divisi', user?.role || '');
      submitData.append('created_by', user?.name || '');

      // Add attachments
      formData.attachments.forEach((file) => {
        submitData.append('attachments', file);
      });

      await addInquiry(submitData);

      setFormData({
        nomor_whatsapp_customer: '',
        nama_toko: '',
        deskripsi: '',
        attachments: [],
      });
      onClose();
    } catch (error) {
      console.error('Error adding inquiry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'nomor_whatsapp_customer') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDeskripsiChange = (value: string) => {
    setFormData(prev => ({ ...prev, deskripsi: value }));
  };


  // File upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...filesArray] }));
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...filesArray] }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            Tambah Inquiry Baru
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="nomor_whatsapp_customer" className="block text-sm font-medium text-gray-700 mb-2">
              Nomor WhatsApp Customer *
            </label>
            <input
              type="tel"
              id="nomor_whatsapp_customer"
              name="nomor_whatsapp_customer"
              value={formData.nomor_whatsapp_customer}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-all"
              placeholder="contoh: 081234567890"
              required
            />
          </div>

          <div>
            <label htmlFor="nama_toko" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Toko *
            </label>
            <input
              type="text"
              id="nama_toko"
              name="nama_toko"
              value={formData.nama_toko}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-all"
              placeholder="Masukkan nama toko"
              required
            />
          </div>


          <div>
            <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi *
            </label>
            <ReactQuill
              id="deskripsi"
              value={formData.deskripsi}
              onChange={handleDeskripsiChange}
              theme="snow"
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link'],
                ],
              }}
              formats={[
                'header', 'font', 'size',
                'bold', 'italic', 'underline', 'strike', 'blockquote',
                'list', 'bullet', 'indent',
                'link'
              ]}
              className="bg-white"
              placeholder="Jelaskan kebutuhan atau permintaan customer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Attachment</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('attachment-input')?.click()}
            >
              <p className="text-gray-500">Klik untuk upload atau drag & drop file di sini</p>
              <input
                id="attachment-input"
                type="file"
                multiple
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <ul className="mt-4 space-y-2">
              {formData.attachments.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-700">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} className="inline-block w-8 h-8 object-cover mr-2 rounded" />
                    ) : (
                      <span className="w-8 h-8 mr-2 bg-gray-300 rounded flex items-center justify-center">PDF</span>
                    )}
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

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
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Plus size={20} />
                  Simpan Inquiry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InquiryForm;