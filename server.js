require('dotenv').config(); // 載入 .env 檔案 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // 引入 cors
const jwt = require('jsonwebtoken'); // 用於生成 JWT
const bcrypt = require('bcryptjs'); // 用於加密密碼
const path = require('path'); // 加入這行

const app = express();

// 使用 cors 中介軟體
app.use(cors()); // 允許所有來源訪問 API

// 中介軟體
app.use(express.json());

// 提供 public 資料夾中的靜態檔案
app.use(express.static('public')); // 加這行

// 連接 MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ Database connection error:', err));

// 引入路由
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

const bookRoutes = require('./routes/bookRoutes');
app.use('/api', bookRoutes);

// 引入購物車路由
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

// 登入 API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ success: false, message: '帳號不存在' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: '密碼錯誤' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// 根目錄顯示 bookForm.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bookForm.html'));
});

// 顯示 login.html 頁面
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 啟動伺服器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
