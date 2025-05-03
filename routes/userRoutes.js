require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 註冊 API
router.post('/users', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '此 email 已註冊'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: '註冊成功',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('註冊錯誤:', err);
    res.status(500).json({
      success: false,
      message: '無法創建用戶'
    });
  }
});

// 登入 API
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: '請輸入 email 和密碼' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: '帳號不存在' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: '密碼錯誤' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: '登入成功',
      token
    });
  } catch (err) {
    console.error('登入錯誤:', err);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// LINE 登入 API
router.post('/loginByLine', async (req, res) => {
  const { lineId, name, email } = req.body;

  try {
    // 查找是否已經有此 LINE ID 的用戶
    let user = await User.findOne({ lineId });

    if (!user) {
      // 如果沒有，創建新用戶
      user = new User({
        lineId,
        name,
        email,
        username: name,  // 可以根據需要設置
        password: '',    // 若要使用 LINE 登入，密碼可以留空
      });
      await user.save();
    }

    // 使用 JWT 簽發 token
    const token = jwt.sign(
      { id: user._id, username: user.username, lineId: user.lineId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 回傳 token 和成功訊息
    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// 取得所有用戶
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得用戶清單' });
  }
});

module.exports = router;
