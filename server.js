require('dotenv').config(); // 載入 .env 檔案

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const User = require('./models/User');
const Cart = require('./models/Cart'); // 引入 Cart 模型

const app = express();

// ===== Middlewares =====
app.use(cors()); // 允許所有來源跨域訪問 API
app.use(express.json()); // 解析 JSON 請求
app.use(express.static('public')); // 提供 public 資料夾的靜態檔案

// ===== Connect to MongoDB =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ Database connection error:', err));

// ===== Routes =====
// 使用者路由
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

// 書籍路由
const bookRoutes = require('./routes/bookRoutes');
app.use('/api', bookRoutes);

// 購物車路由
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

// ===== Auth APIs =====
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ success: false, message: '帳號不存在' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: '密碼錯誤' });

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

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ success: false, message: '帳號或郵箱已存在' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ success: true, message: '註冊成功' });
  } catch (err) {
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

app.post('/api/loginByLine', async (req, res) => {
  const { lineId, name, email } = req.body;

  try {
    let user = await User.findOne({ lineId });
    if (!user) {
      user = new User({ lineId, name, email, username: name, password: '' });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, lineId: user.lineId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// ===== Cart APIs =====
app.post('/api/cart/add', async (req, res) => {
  const { userId, bookId, quantity, price } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ bookId, quantity, price }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.bookId.toString() === bookId);
      if (itemIndex === -1) {
        cart.items.push({ bookId, quantity, price });
      } else {
        cart.items[itemIndex].quantity += quantity;
      }
    }

    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

app.get('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const cart = await Cart.findOne({ userId }).populate('items.bookId');
    if (!cart) return res.status(404).json({ success: false, message: '購物車不存在' });

    res.status(200).json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// ===== Frontend Pages (HTML) =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bookForm.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// ===== Start Server (手機也能連) =====
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
