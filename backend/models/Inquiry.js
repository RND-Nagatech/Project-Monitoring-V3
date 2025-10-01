const mongoose = require('mongoose');

// Schema attachment
const attachmentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'image'], required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

// Schema note
const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  created_by: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const inquirySchema = new mongoose.Schema({
  nomor_whatsapp_customer: {
    type: String,
    required: [true, 'Customer WhatsApp number is required'],
    trim: true
  },
  nama_toko: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true
  },
  deskripsi: {
    type: mongoose.Schema.Types.Mixed, // bisa simpan rich text JSON/markdown
    required: [true, 'Description is required']
  },
  status: {
    type: String,
    enum: [
      'pending', 'progress', 'selesai', 'batal', 'wait for payment',
      'on going QA', 'on progress QA', 'paid off', 'ready for update'
    ],
    default: 'pending'
  },
  type: { type: String, enum: ['berbayar', 'gratis'] },
  fee: { type: Number, min: [0, 'Fee cannot be negative'] },
  divisi: { type: String, enum: ['produksi', 'qc', 'finance', 'helpdesk'] },

  attachments: [attachmentSchema],

  // User tracking fields (simpan sebagai string nama user)
  created_by: { type: String, required: true }, // User name who created the inquiry
  qc_by: { type: String }, // User name who did QC
  produksi_by: { type: String }, // User name who did production
  finance_by: { type: String }, // User name who did finance
  helpdesk_by: { type: String }, // User name who did helpdesk (cancellation)
  edited_by: { type: String }, // User name who last edited the inquiry
  edited_at: Date,

  notes: [noteSchema]
}, { timestamps: true });

// Indexes
inquirySchema.index({ status: 1 });
inquirySchema.index({ created_by: 1 });
inquirySchema.index({ nama_toko: 1 });
inquirySchema.index({ nomor_whatsapp_customer: 1 });
inquirySchema.index({ createdAt: -1 });

inquirySchema.methods.formatDate = function() {
  const dateStr = this.createdAt || this.created_at;
  if (dateStr && !isNaN(new Date(dateStr).getTime())) {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  return '';
};

module.exports = mongoose.model('Inquiry', inquirySchema, "tm_inquiry");
