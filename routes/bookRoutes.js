const express = require('express');  
const router = express.Router(); 
const Book = require('../models/Book');


// 📌 1. 建立新書籍
router.post('/books', async (req, res) => {
  try {
    const { title, author, price, condition, description, seller_id, image_url, is_sold } = req.body;

    if (!title || !author || !price || !condition || !description || !seller_id) {
      return res.status(400).json({ error: '所有欄位都是必填的' });
    }

    if (image_url && !/^https?:\/\/[^\s]+$/.test(image_url)) {
      return res.status(400).json({ error: '請提供有效的圖片網址' });
    }

    const newBook = new Book({
      title,
      author,
      price,
      condition,
      description,
      seller_id,
      image_url,
      is_sold: is_sold === "true" ? true : false,
      created_at: new Date()
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ error: '無法創建書籍: ' + err.message });
  }
});


// 📌 2. 取得所有書籍（支援搜尋 & 過濾）
router.get('/books', async (req, res) => {
  try {
    const { search, condition } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (condition) {
      query.condition = condition;
    }

    const books = await Book.find(query);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: '無法取得書籍資料: ' + err.message });
  }
});


// 📌 3. 取得特定書籍
router.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: '找不到這本書' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: '無法取得書籍: ' + err.message });
  }
});


// 📌 4. 更新書籍資訊（PUT）
router.put('/books/:id', async (req, res) => {
  try {
    const { title, author, price, condition, description, image_url, is_sold } = req.body;

    // 驗證必填欄位（你可以自行決定是否強制）
    if (!title || !author || !price || !condition || !description) {
      return res.status(400).json({ error: '請填寫所有必要欄位' });
    }

    // 驗證圖片網址
    if (image_url && !/^https?:\/\/[^\s]+$/.test(image_url)) {
      return res.status(400).json({ error: '圖片網址格式錯誤' });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        price,
        condition,
        description,
        image_url,
        is_sold: is_sold === "true" ? true : false
      },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ error: '找不到要更新的書' });
    }

    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ error: '更新書籍錯誤: ' + err.message });
  }
});


// 📌 5. 刪除書籍
router.delete('/books/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ error: '書籍不存在' });
    }
    res.json({ message: '書籍已成功刪除' });
  } catch (err) {
    res.status(500).json({ error: '刪除書籍錯誤: ' + err.message });
  }
});


module.exports = router;
