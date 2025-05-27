require('dotenv').config(); // 載入 .env 檔案

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer'); // ✅ 新增 multer
const path = require('path');

const User = require('./models/User');
const Cart = require('./models/Cart'); // 引入 Cart 模型

const app = express();

// ===== Middlewares =====
app.use(cors()); // 允許所有來源跨域訪問 API
app.use(express.json()); // 解析 JSON 請求
app.use(express.static('public')); // 提供 public 資料夾的靜態檔案

// ===== Multer 設定（記憶體儲存圖片）=====
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ===== Connect to MongoDB =====
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ Database connection error:', err));

// ===== 圖片上傳 API (模擬 AI 辨識) =====
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '未上傳圖片' });
  }

  // 模擬 AI 辨識結果（假資料）
  const fakeAIResult = {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    condition: "Used - Good",
    price: 180,
    description: "A classic novel about the American dream.",
    image_url: "https://example.com/sample-image.jpg"
  };

  setTimeout(() => {
    res.json({ success: true, data: fakeAIResult });
  }, 1000); // 模擬處理延遲
});

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

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '帳號或郵箱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ success: true, message: '註冊成功' });
  } catch (err) {
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// Line 登入 API
app.post('/api/loginByLine', async (req, res) => {
  const { lineId, name, email } = req.body;

  try {
    let user = await User.findOne({ lineId });

    if (!user) {
      user = new User({
        lineId,
        name,
        email,
        username: name,
        password: '',  // 如果是使用 LINE 登入，密碼可以設為空
      });
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
      cart = new Cart({
        userId,
        items: [{ bookId, quantity, price }],
      });
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
    if (!cart) {
      return res.status(404).json({ success: false, message: '購物車不存在' });
    }

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

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
