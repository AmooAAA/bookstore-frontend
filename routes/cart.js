const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// 添加書籍到購物車
router.post('/add', async (req, res) => {
  const { userId, bookId, quantity } = req.body;
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    const newCart = new Cart({
      userId,
      items: [{ bookId, quantity }]
    });
    await newCart.save();
    return res.status(200).json(newCart);
  }

  const existingItem = cart.items.find(item => item.bookId.toString() === bookId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ bookId, quantity });
  }
  await cart.save();
  res.status(200).json(cart);
});

// 更新購物車中的書籍數量
router.put('/update', async (req, res) => {
  const { userId, bookId, quantity } = req.body;
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return res.status(404).json({ message: '購物車未找到' });
  }

  const item = cart.items.find(item => item.bookId.toString() === bookId);
  if (item) {
    item.quantity = quantity;
    await cart.save();
    return res.status(200).json(cart);
  }

  return res.status(404).json({ message: '書籍未在購物車中' });
});

// 移除購物車中的書籍
router.delete('/remove', async (req, res) => {
  const { userId, bookId } = req.body;
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return res.status(404).json({ message: '購物車未找到' });
  }

  cart.items = cart.items.filter(item => item.bookId.toString() !== bookId);
  await cart.save();
  res.status(200).json(cart);
});

// 結帳
router.post('/checkout', async (req, res) => {
  const { userId } = req.body;
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: '購物車為空' });
  }

  let total = 0;
  for (const item of cart.items) {
    const book = await Book.findById(item.bookId);
    total += book.price * item.quantity;
  }

  // 模擬支付處理
  cart.items = [];
  await cart.save();
  res.status(200).json({ message: '結帳完成', total });
});

module.exports = router;
