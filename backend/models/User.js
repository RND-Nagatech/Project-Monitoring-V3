const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true, // contoh: "admin001"
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['produksi', 'qc', 'finance', 'helpdesk', 'admin'],
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true // bisa null, tapi kalau ada harus unik
  },
  password: {
    type: String,
    required: true
    // simpan hasil hash (bcrypt), bukan plain text
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Indexes buat optimasi query
userSchema.index({ user_id: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hapus password kalau data dikirim keluar (toJSON / toObject)
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

userSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

// Hash password sebelum save
userSchema.pre('save', async function(next) {
  // Skip kalau password tidak diubah
  if (!this.isModified('password')) return next();

  try {
    // Hash password dengan bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method untuk compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const result = await bcrypt.compare(candidatePassword, this.password);
    return result;
  } catch (error) {
    throw error;
  }
};

// Update lastLogin saat login berhasil
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema, "tm_user");
