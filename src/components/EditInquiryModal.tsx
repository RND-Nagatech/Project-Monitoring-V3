import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Edit, X, CheckCircle, AlertCircle, Phone, Building2, MessageSquare } from 'lucide-react';
import { Inquiry, User } from '../types';

interface EditInquiryModalProps {
  isOpen: boolean;
  inquiry: Inquiry | null;
  user: User | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Inquiry>) => void;
}

const EditInquiryModal: React.FC<EditInquiryModalProps> = ({
  isOpen,
  inquiry,
  user,
  onClose,
  onUpdate,
}) => {
  const [editFormData, setEditFormData] = useState({
    nomor_whatsapp_customer: '',
    nama_toko: '',
    deskripsi: '',
  });
  const [editValidationErrors, setEditValidationErrors] = useState<{
    nomor_whatsapp_customer?: string;
    nama_toko?: string;
    deskripsi?: string;
  }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editCharacterCount, setEditCharacterCount] = useState(0);

  // Update character count untuk deskripsi edit
  useEffect(() => {
    const text = editFormData.deskripsi.replace(/<[^>]*>/g, '');
    setEditCharacterCount(text.length);
  }, [editFormData.deskripsi]);

  // Update form data when inquiry changes
  useEffect(() => {
    if (inquiry && isOpen) {
      setEditFormData({
        nomor_whatsapp_customer: inquiry.nomor_whatsapp_customer,
        nama_toko: inquiry.nama_toko,
        deskripsi: inquiry.deskripsi,
      });
      setEditValidationErrors({});
      setEditSuccess(false);
    }
  }, [inquiry, isOpen]);

  // Format nomor WhatsApp Indonesia
  const formatWhatsAppNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.startsWith('0')) {
      return numericValue.replace(/^0/, '+62');
    } else if (numericValue.startsWith('62')) {
      return `+${numericValue}`;
    } else if (!numericValue.startsWith('+62')) {
      return numericValue ? `+62${numericValue}` : '';
    }
    return numericValue;
  };

  // Validasi nomor WhatsApp
  const validateWhatsAppNumber = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    if (!cleanNumber) return 'Nomor WhatsApp wajib diisi';
    if (cleanNumber.length < 10) return 'Nomor WhatsApp minimal 10 digit';
    if (cleanNumber.length > 13) return 'Nomor WhatsApp maksimal 13 digit';
    if (!cleanNumber.startsWith('628')) return 'Format nomor WhatsApp tidak valid (harus dimulai dengan +628)';
    return '';
  };

  // Validasi form edit
  const validateEditForm = () => {
    const errors: typeof editValidationErrors = {};

    const whatsappError = validateWhatsAppNumber(editFormData.nomor_whatsapp_customer);
    if (whatsappError) errors.nomor_whatsapp_customer = whatsappError;

    if (!editFormData.nama_toko.trim()) errors.nama_toko = 'Nama toko wajib diisi';

    // Strip HTML tags for description validation
    const plainTextDescription = editFormData.deskripsi.replace(/<[^>]*>/g, '').trim();
    if (!plainTextDescription) errors.deskripsi = 'Deskripsi wajib diisi';

    setEditValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'nomor_whatsapp_customer') {
      const formatted = formatWhatsAppNumber(value);
      setEditFormData(prev => ({ ...prev, [name]: formatted }));

      // Clear validation error saat user mulai mengetik
      if (editValidationErrors.nomor_whatsapp_customer) {
        setEditValidationErrors(prev => ({ ...prev, nomor_whatsapp_customer: undefined }));
      }
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));

      // Clear validation error saat user mulai mengetik
      if (editValidationErrors[name as keyof typeof editValidationErrors]) {
        setEditValidationErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleEditDeskripsiChange = (value: string) => {
    setEditFormData(prev => ({ ...prev, deskripsi: value }));

    // Clear validation error saat user mulai mengetik
    if (editValidationErrors.deskripsi) {
      setEditValidationErrors(prev => ({ ...prev, deskripsi: undefined }));
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEditForm() || !inquiry) return;

    setIsEditing(true);
    try {
      // Update inquiry through context
      onUpdate(inquiry.id, {
        ...editFormData,
        edited_by: user?.name || '',
        edited_at: new Date().toISOString(),
      });

      setEditSuccess(true);
      setTimeout(() => {
        setEditSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error updating inquiry:', error);
    } finally {
      setIsEditing(false);
    }
  };

  if (!isOpen || !inquiry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header dengan Gradient */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-t-2xl p-6 border-b border-slate-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Edit Inquiry</h2>
                <p className="text-sm text-slate-100 mt-1">Perbarui informasi inquiry customer</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
              disabled={isEditing}
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {editSuccess && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Inquiry berhasil diperbarui!</p>
              <p className="text-xs text-green-600 mt-1">Modal akan ditutup secara otomatis...</p>
            </div>
          </div>
        )}

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
            {/* Nomor WhatsApp Field */}
            <div>
              <label htmlFor="edit_nomor_whatsapp_customer" className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-600" />
                Nomor WhatsApp Customer *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="edit_nomor_whatsapp_customer"
                  name="nomor_whatsapp_customer"
                  value={editFormData.nomor_whatsapp_customer}
                  onChange={handleEditInputChange}
                  className={`w-full pl-4 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all bg-white shadow-sm ${
                    editValidationErrors.nomor_whatsapp_customer
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="+6281234567890"
                  required
                  disabled={isEditing}
                />
                {editValidationErrors.nomor_whatsapp_customer && (
                  <div className="absolute right-3 top-3 flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                )}
              </div>
              {editValidationErrors.nomor_whatsapp_customer ? (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {editValidationErrors.nomor_whatsapp_customer}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">Format: +628xxxxxxxxx (dimulai dengan 08, minimal 10 digit setelah +62)</p>
              )}
            </div>

            {/* Nama Toko Field */}
            <div>
              <label htmlFor="edit_nama_toko" className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-600" />
                Nama Toko *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="edit_nama_toko"
                  name="nama_toko"
                  value={editFormData.nama_toko}
                  onChange={handleEditInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all bg-white shadow-sm ${
                    editValidationErrors.nama_toko
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Masukkan nama toko customer"
                  required
                  disabled={isEditing}
                />
                {editValidationErrors.nama_toko && (
                  <div className="absolute right-3 top-3 flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                )}
              </div>
              {editValidationErrors.nama_toko && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {editValidationErrors.nama_toko}
                </p>
              )}
            </div>

            {/* Deskripsi Field */}
            <div>
              <label htmlFor="edit_deskripsi" className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-600" />
                Deskripsi Permintaan *
              </label>
              <div className={`border rounded-lg overflow-hidden ${
                editValidationErrors.deskripsi ? 'border-red-300' : 'border-gray-300'
              }`}>
                <ReactQuill
                  id="edit_deskripsi"
                  value={editFormData.deskripsi}
                  onChange={handleEditDeskripsiChange}
                  theme="snow"
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link', 'image'],
                      ['clean']
                    ],
                  }}
                  className="bg-white"
                  placeholder="Jelaskan secara detail kebutuhan atau permintaan customer..."
                  readOnly={isEditing}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                {editValidationErrors.deskripsi ? (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {editValidationErrors.deskripsi}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">Gunakan rich text untuk format yang lebih baik</p>
                )}
                <span className={`text-xs font-medium ${
                  editCharacterCount > 1000 ? 'text-red-600' : editCharacterCount > 500 ? 'text-yellow-600' : 'text-gray-500'
                }`}>
                  {editCharacterCount}/1000 karakter
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={isEditing}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isEditing || editSuccess}
              >
                {isEditing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Menyimpan...
                  </>
                ) : editSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Berhasil!
                  </>
                ) : (
                  <>
                    <Edit size={20} />
                    Update Inquiry
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

export default EditInquiryModal;