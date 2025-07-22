const express = require('express'); 
const router = express.Router(); 
const Book = require('../models/Book');

// 📌 1. 建立新書籍
router.post('/books', async (req, res) => {
  try {
    // 設定書籍資料
    const { title, author, price, condition, description, seller_id, image_url, is_sold } = req.body;

    // 確保資料完整
    if (!title || !author || !price || !condition || !description || !seller_id) {
      return res.status(400).json({ error: '所有欄位都是必填的' });
    }

    // 如果 image_url 存在，確認它是否是一個有效的 URL
    if (image_url && !/^https?:\/\/[^\s]+$/.test(image_url)) {
      return res.status(400).json({ error: '請提供有效的圖片網址' });
    }

    // 創建新書籍實例
    const newBook = new Book({
      title,
      author,
      price,
      condition,
      description,
      seller_id,
      image_url,  // 如果沒有提供圖片網址，這會是 undefined
      is_sold: is_sold === "true" ? true : false,  // 確保布林值
      created_at: new Date()  // 自動加入創建時間
    });

    // 儲存新書籍
    await newBook.save();
    res.status(201).json(newBook);  // 回傳新增的書籍資料
  } catch (err) {
    res.status(500).json({ error: '無法創建書籍: ' + err.message });
  }
});

// 📌 2. 取得所有書籍（支持搜尋和過濾）
router.get('/books', async (req, res) => {
  try {
    const { search, condition } = req.query;  // 從查詢參數獲取搜尋條件

    let query = {};  // 默認查詢條件

    // 如果有搜尋條件，對書名和作者進行模糊搜尋
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },  // 書名模糊搜尋
        { author: { $regex: search, $options: 'i' } },  // 作者模糊搜尋
      ];
    }

    // 如果有書籍狀況過濾條件
    if (condition) {
      query.condition = condition;
    }

    // 查詢書籍
    const books = await Book.find(query);
    res.json(books);  // 返回過濾後的書籍資料
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

// 📌 4. 更新書籍資訊
router.put('/books/:id', async (req, res) => {
  try {
    // 確保有傳入正確的 ID
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
