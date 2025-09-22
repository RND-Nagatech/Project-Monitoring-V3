const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

const router = express.Router();

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

// @desc    Upload single file
// @route   POST /api/upload/single
// @access  Private
router.post('/single', [protect, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Determine file type
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let fileType = 'pdf'; // default

    if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
      fileType = 'image';
    }

    const fileData = {
      id: req.file.filename,
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      type: fileType,
      size: req.file.size,
      uploadedAt: new Date(),
      uploadedBy: req.user.name
    };

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: fileData
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
});

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', [protect, upload.array('files', 10)], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => {
      const fileExtension = path.extname(file.originalname).toLowerCase();
      let fileType = 'pdf'; // default

      if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
        fileType = 'image';
      }

      return {
        id: file.filename,
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        type: fileType,
        size: file.size,
        uploadedAt: new Date(),
        uploadedBy: req.user.name
      };
    });

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private
router.delete('/:filename', protect, async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed'
    });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File size too large. Maximum size allowed is ${process.env.MAX_FILE_SIZE || 5000000} bytes`
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  console.error('Upload middleware error:', error);
  res.status(500).json({
    success: false,
    message: 'File upload error'
  });
});

module.exports = router;