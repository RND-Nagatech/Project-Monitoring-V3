const express = require('express');
const { body, validationResult } = require('express-validator');
const Inquiry = require('../models/Inquiry');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const inquiryValidation = [
  body('nomor_whatsapp_customer').notEmpty().withMessage('Customer WhatsApp number is required'),
  body('nama_toko').notEmpty().withMessage('Store name is required'),
  body('deskripsi').notEmpty().withMessage('Description is required'),
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
router.post('/', [protect, authorize('helpdesk'), ...inquiryValidation], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const inquiryData = {
      ...req.body,
      created_by: req.user.name
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
router.put('/:id', [protect, ...inquiryValidation], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    // Role-based update permissions
    const updateData = { ...req.body };

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

    const updatedInquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

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