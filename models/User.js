// models/User.js
const mongoose = require('mongoose');

// 建立 User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 建立 User 模型
const User = mongoose.model('User', userSchema);

module.exports = User;
