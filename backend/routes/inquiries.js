const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Inquiry = require('../models/Inquiry');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper function to get full URL for attachments
const getAttachmentUrl = (filename) => {
  const port = process.env.PORT || 5001;
  return `http://localhost:${port}/uploads/${filename}`;
};

// Utility function to strip HTML tags but preserve lists and images
const stripHtmlTags = (html) => {
  // Allow ul, ol, li tags for lists and img tags for images
  const allowedTags = ['ul', 'ol', 'li', 'img'];
  const allowedRegex = new RegExp(`<(?!/?(${allowedTags.join('|')})\\b)[^>]*>`, 'gi');
  return html.replace(allowedRegex, '').trim();
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, `${basename}-${uniqueSuffix}${extension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;

  // Check extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and office documents are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000 // 5MB default
  },
  fileFilter: fileFilter
});

// Validation rules
const inquiryValidation = [
  body('nomor_whatsapp_customer').optional(),
  body('nama_toko').optional(),
  body('deskripsi').optional(),
  body('status').optional().isIn(['pending', 'progress', 'selesai', 'batal', 'wait for payment', 'on going QA', 'on progress QA', 'paid off', 'ready for update']).withMessage('Invalid status'),
  body('type').optional().isIn(['berbayar', 'gratis']).withMessage('Type must be berbayar or gratis'),
  body('fee').optional().isNumeric().withMessage('Fee must be a number'),
  body('divisi').optional().isIn(['produksi', 'qc', 'finance', 'helpdesk']).withMessage('Invalid division')
];

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { nama_toko: { $regex: search, $options: 'i' } },
        { nomor_whatsapp_customer: { $regex: search, $options: 'i' } },
        { deskripsi: { $regex: search, $options: 'i' } }
      ];
    }

    // Role-based filtering (optional - can be customized)
    // For example, helpdesk might only see their own inquiries
    // if (req.user.role === 'helpdesk') {
    //   query.created_by = req.user.name;
    // }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const inquiries = await Inquiry.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Inquiry.countDocuments(query);

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single inquiry
// @route   GET /api/inquiries/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      data: inquiry
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Private (Helpdesk only)
router.post('/', [protect, upload.array('attachments', 10)], async (req, res) => {
  try {
    // Validate required fields
    const { nomor_whatsapp_customer, nama_toko, deskripsi, status, divisi, created_by } = req.body;

    if (!nomor_whatsapp_customer || !nama_toko || !deskripsi) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [
          { msg: 'Customer WhatsApp number is required', param: 'nomor_whatsapp_customer' },
          { msg: 'Store name is required', param: 'nama_toko' },
          { msg: 'Description is required', param: 'deskripsi' }
        ]
      });
    }

    // Process uploaded files
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'pdf';
        attachments.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.originalname,
          url: getAttachmentUrl(file.filename),
          type: fileType,
          size: file.size
        });
      });
    }

    const inquiryData = {
      nomor_whatsapp_customer,
      nama_toko,
      deskripsi: stripHtmlTags(deskripsi), // Strip HTML tags from description
      status: req.user.role === 'helpdesk' ? 'pending' : (status || undefined), // Set to pending for helpdesk users
      divisi: divisi || '',
      created_by: created_by || req.user.name,
      attachments
    };

    const inquiry = await Inquiry.create(inquiryData);

    res.status(201).json({
      success: true,
      message: 'Inquiry created successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update inquiry
// @route   PUT /api/inquiries/:id
// @access  Private
router.put('/:id', [protect, upload.array('attachments', 10), ...inquiryValidation], async (req, res) => {
  try {
    console.log('PUT /api/inquiries/:id called with params:', req.params);
    console.log('Request body:', req.body);
    console.log('User role:', req.user.role);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    console.log('Found inquiry:', inquiry ? 'YES' : 'NO');

    if (!inquiry) {
      console.log('Inquiry not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Process uploaded files for attachments
    const newAttachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'pdf';
        newAttachments.push({
          id: file.filename,
          name: file.originalname,
          type: fileType,
          size: file.size,
          url: getAttachmentUrl(file.filename),
        });
      });
    }

  // Role-based update permissions
  const updateData = { ...req.body };
  console.log('Initial updateData:', updateData);
  console.log('divisi_notes received:', updateData.divisi_notes);

    // Strip HTML tags from description if it's being updated
    if (updateData.deskripsi) {
      updateData.deskripsi = stripHtmlTags(updateData.deskripsi);
    }


    // Parse notes if sent as string (from FormData)
    if (typeof updateData.notes === 'string') {
      try {
        updateData.notes = JSON.parse(updateData.notes);
      } catch (e) {
        updateData.notes = [];
      }
    }

    // Merge only if new files uploaded and no attachments array sent from frontend
    if (newAttachments.length > 0) {
      updateData.attachments = [...(inquiry.attachments || []), ...newAttachments];
    } else if (updateData.attachments && Array.isArray(updateData.attachments)) {
      // If frontend sends attachments, use as is (avoid double)
      // Optionally: filter duplicate by id/url here if needed
    }

    // Force update divisi_notes even if empty string
    if (typeof updateData.divisi_notes !== 'undefined') {
      inquiry.divisi_notes = updateData.divisi_notes;
      updateData.divisi_notes = updateData.divisi_notes;

      // Push to notes array for history
      inquiry.notes = inquiry.notes || [];
      inquiry.notes.push({
        content: updateData.divisi_notes,
        created_by: req.user.name,
        created_at: new Date()
      });
      inquiry.markModified('notes');
      await inquiry.save(); // Save notes array update
    }

    // Track who made the update
    if (req.user.role === 'produksi') {
      updateData.produksi_by = req.user.name;
    } else if (req.user.role === 'qc') {
      updateData.qc_by = req.user.name;
    } else if (req.user.role === 'finance') {
      updateData.finance_by = req.user.name;
    } else if (req.user.role === 'helpdesk') {
      updateData.helpdesk_by = req.user.name;
      updateData.edited_by = req.user.name;
      updateData.edited_at = new Date();
    }

    console.log('Final updateData:', updateData);

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Update result:', updatedInquiry ? 'SUCCESS' : 'FAILED');

    res.json({
      success: true,
      message: 'Inquiry updated successfully',
      data: updatedInquiry
    });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update inquiry status only
// @route   PATCH /api/inquiries/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, followUpMessage } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    inquiry.status = status;
    if (followUpMessage) {
      inquiry.divisi_notes = followUpMessage;
    }
    await inquiry.save();

    res.json({
      success: true,
      message: 'Inquiry status updated successfully',
      data: inquiry
    });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private (Admin/Helpdesk only)
router.delete('/:id', [protect, authorize('helpdesk')], async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    await Inquiry.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get inquiry statistics
// @route   GET /api/inquiries/stats/overview
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const stats = await Inquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object format
    const statusStats = {};
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    // Ensure all statuses are included (even with 0 count)
    const allStatuses = ['pending', 'progress', 'selesai', 'batal', 'wait for payment',
                        'on going QA', 'on progress QA', 'paid off', 'ready for update'];

    allStatuses.forEach(status => {
      if (!(status in statusStats)) {
        statusStats[status] = 0;
      }
    });

    res.json({
      success: true,
      data: statusStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;