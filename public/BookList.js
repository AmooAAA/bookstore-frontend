// BookList.js
import React, { useState, useEffect } from 'react';
import './BookList.css'; // 如果你有額外 CSS 的話可以加上

const BookList = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch('https://line-shelf-ai.onrender.com/api/books')
      .then(response => response.json())
      .then(data => {
        console.log('取得的書籍資料:', data);
        setBooks(data);
      })
      .catch(error => console.error('取得書籍資料錯誤:', error));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📚 書籍列表</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {books.length > 0 ? (
          books.map(book => (
            <div key={book._id || book.title} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
              <img src={book.image_url} alt={book.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <h3>{book.title}</h3>
              <p><strong>作者：</strong>{book.author}</p>
              <p><strong>價格：</strong>${book.price}</p>
              <p><strong>狀態：</strong>{book.condition}</p>
              <p>{book.description}</p>
            </div>
          ))
        ) : (
          <p>📭 目前沒有書籍可顯示。</p>
        )}
      </div>
    </div>
  );
};

export default BookList;
