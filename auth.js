const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // 引入使用者模型
const router = express.Router();

// 登入 API
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 查找使用者
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: '帳號不存在' });
    }

    // 比對密碼
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: '密碼錯誤' });
    }

    // 產生 JWT
    const token = jwt.sign({ id: user._id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ success: true, token });  // 回傳 token
  } catch (err) {
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

module.exports = router;
