const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['pdf', 'image'],
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
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
    type: String,
    required: [true, 'Description is required']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'progress', 'selesai', 'batal', 'wait for payment',
               'on going QA', 'on progress QA', 'paid off', 'ready for update'],
      message: 'Invalid status value'
    },
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['berbayar', 'gratis']
  },
  fee: {
    type: Number,
    min: [0, 'Fee cannot be negative']
  },
  divisi: {
    type: String,
    enum: ['produksi', 'qc', 'finance', 'helpdesk']
  },
  divisi_notes: {
    type: String
  },
  attachments: [attachmentSchema],

  // User tracking fields
  created_by: {
    type: String,
    required: true
  },
  qc_by: String,
  produksi_by: String,
  finance_by: String,
  helpdesk_by: String,
  edited_by: String,
  edited_at: Date,

  // Metadata
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [String],
  notes: [{
    content: String,
    created_by: String,
    created_at: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
inquirySchema.index({ status: 1 });
inquirySchema.index({ created_by: 1 });
inquirySchema.index({ nama_toko: 1 });
inquirySchema.index({ nomor_whatsapp_customer: 1 });
inquirySchema.index({ createdAt: -1 });

// Virtual for formatted created date
inquirySchema.virtual('formattedCreatedDate').get(function() {
  return this.createdAt.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for formatted updated date
inquirySchema.virtual('formattedUpdatedDate').get(function() {
  return this.updatedAt.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Ensure virtual fields are serialized
inquirySchema.set('toJSON', { virtuals: true });
inquirySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inquiry', inquirySchema);