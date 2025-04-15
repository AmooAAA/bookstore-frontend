const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  condition: { type: String, required: true }, // 不加 enum，因為你用的是像 "90%" 這樣的自訂內容
  description: { type: String },
  seller_id: { type: String, required: true },
  image_url: { type: String },  // ✅ 圖片網址
  is_sold: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', bookSchema);
