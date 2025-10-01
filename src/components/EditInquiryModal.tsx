import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X } from 'lucide-react';
import { Inquiry, User } from '../types';

interface EditInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onSave: (updates: Partial<Inquiry>) => void;
  user: User | null;
}

const EditInquiryModal: React.FC<EditInquiryModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onSave,
  user
}) => {
  const [nomorWhatsapp, setNomorWhatsapp] = useState('');
  const [namaToko, setNamaToko] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  // Update form when inquiry changes
  useEffect(() => {
    if (inquiry) {
      setNomorWhatsapp(inquiry.nomor_whatsapp_customer);
      setNamaToko(inquiry.nama_toko);
      setDeskripsi(inquiry.deskripsi);
    }
  }, [inquiry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry) return;

    const updates: Partial<Inquiry> = {
      nomor_whatsapp_customer: nomorWhatsapp,
      nama_toko: namaToko,
      deskripsi: deskripsi,
      edited_by: user?.name,
      edited_at: new Date().toISOString(),
    };

    // Jika belum ada helpdesk_by, catat sebagai helpdesk yang memproses
    if (!inquiry.helpdesk_by && user?.role === 'helpdesk') {
      updates.helpdesk_by = user.name;
    }

    onSave(updates);
    onClose();
  };

  if (!isOpen || !inquiry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Edit Data Inquiry</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nomor WhatsApp Customer</label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={nomorWhatsapp}
              onChange={e => setNomorWhatsapp(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Toko</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={namaToko}
              onChange={e => setNamaToko(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Permintaan</label>
            <ReactQuill
              value={deskripsi}
              onChange={setDeskripsi}
              theme="snow"
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'image'],
                ],
              }}
              formats={[
                'header', 'font', 'size',
                'bold', 'italic', 'underline', 'strike', 'blockquote',
                'list', 'bullet', 'indent',
                'link', 'image', 'video'
              ]}
              className="bg-white"
              placeholder="Jelaskan kebutuhan atau permintaan customer..."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInquiryModal;