const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// 這裡是測試用的 GET 路由
router.get('/', (req, res) => {
  res.send('Cart API is working');
});

// 添加書籍到購物車
router.post('/add', async (req, res) => {
  const { userId, bookId, quantity } = req.body;
  console.log('Received data:', { userId, bookId, quantity });

  try {
    // 查找書籍價格
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: `書籍 ${bookId} 未找到` });
    }

    const price = book.price;

    // 查找用户的购物车
    let cart = await Cart.findOne({ userId });

    // 如果没有找到购物车，则创建新的购物车
    if (!cart) {
      console.log('Cart not found, creating new cart...');
      cart = new Cart({
        userId,
        items: [{ bookId, quantity, price }],
        totalPrice: price * quantity
      });

      // 嘗試儲存購物車
      try {
        await cart.save();
        console.log('New cart created and saved:', cart);
        return res.status(200).json(cart);
      } catch (error) {
        console.error('Error saving new cart:', error);
        return res.status(500).json({ message: '創建購物車時發生錯誤', error: error.message });
      }
    }

    // 查找购物车中的书籍
    const existingItem = cart.items.find(item => item.bookId.toString() === bookId);
    if (existingItem) {
      // 如果书籍已经存在，更新数量
      existingItem.quantity += quantity;
      existingItem.price = price;  // 更新書籍的價格

      // 嘗試儲存購物車
      try {
        await cart.save();
        console.log('Cart updated:', cart);
        res.status(200).json(cart);
      } catch (error) {
        console.error('Error updating cart:', error);
        return res.status(500).json({ message: '更新購物車時發生錯誤', error: error.message });
      }
    } else {
      // 否则，新增书籍
      cart.items.push({ bookId, quantity, price });

      // 嘗試儲存購物車
      try {
        await cart.save();
        console.log('Cart updated with new item:', cart);
        res.status(200).json(cart);
      } catch (error) {
        console.error('Error saving updated cart:', error);
        return res.status(500).json({ message: '加入書籍到購物車時發生錯誤', error: error.message });
      }
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    // 更詳細的錯誤處理
    if (error.code) {
      console.error('MongoDB error code:', error.code);
    }
    res.status(500).json({ message: '加入購物車時發生錯誤', error: error.message, code: error.code });
  }
});


// 更新購物車中的書籍數量
router.put('/update', async (req, res) => {
  const { userId, bookId, quantity } = req.body;

  try {
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
  } catch (error) {
    console.error('錯誤:', error);
    res.status(500).json({ message: '更新購物車時發生錯誤' });
  }
});

// 移除購物車中的書籍
router.delete('/remove', async (req, res) => {
  const { userId, bookId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: '購物車未找到' });
    }

    // 从购物车中删除书籍
    cart.items = cart.items.filter(item => item.bookId.toString() !== bookId);
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('錯誤:', error);
    res.status(500).json({ message: '移除書籍時發生錯誤' });
  }
});

// 結帳
router.post('/checkout', async (req, res) => {
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: '購物車為空' });
    }

    // 计算总金额
    let total = 0;
    for (const item of cart.items) {
      const book = await Book.findById(item.bookId);
      if (book) {
        total += book.price * item.quantity;
      }
    }

    // 模拟支付过程
    cart.items = []; // 清空购物车
    await cart.save();

    res.status(200).json({ message: '結帳完成', total });
  } catch (error) {
    console.error('錯誤:', error);
    res.status(500).json({ message: '結帳時發生錯誤' });
  }
});

module.exports = router;
