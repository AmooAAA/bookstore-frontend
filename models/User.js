// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  lineId: {
    type: String,
    unique: true,
    sparse: true, // 允許空值但不可重複
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true
    // 不設 required，LINE 登入時有可能沒有 email
  },
  password: {
    type: String,
    // 不設 required，LINE 登入時不會有密碼
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
