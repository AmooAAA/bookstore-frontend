// BookList.js
import React, { useState, useEffect } from 'react';

const BookList = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // 向後端請求所有書籍資料
    fetch('https://cccbookbot-0c3d990eba99.herokuapp.com/api/books')
      .then(response => response.json())
      .then(data => setBooks(data))
      .catch(error => console.error('Error fetching books:', error));
  }, []);

  return (
    <div>
      <h2>書籍列表</h2>
      <div className="book-list">
        {books.length > 0 ? (
          books.map(book => (
            <div key={book._id} className="book-item">
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              <p>價格: ${book.price}</p>
              <p>狀態: {book.condition}</p>
              <p>{book.description}</p>
              {/* 添加圖片顯示 */}
              {book.image_url && <img src={book.image_url} alt={book.title} />}
            </div>
          ))
        ) : (
          <p>目前沒有書籍可顯示。</p>
        )}
      </div>
    </div>
  );
};

export default BookList;
