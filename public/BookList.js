// BookList.js
import React, { useState, useEffect } from 'react';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true); // 加載狀態
  const [error, setError] = useState(null);     // 錯誤狀態

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('https://cccbookbot-0c3d990eba99.herokuapp.com/api/books');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return <p>📚 正在載入書籍資料...</p>;
  }

  if (error) {
    return <p>❌ 載入書籍資料時發生錯誤：{error}</p>;
  }

  return (
    <div>
      <h2>📚 書籍列表</h2>
      <div className="book-list">
        {books.length > 0 ? (
          books.map(book => (
            <div key={book._id} className="book-item">
              <h3>{book.title}</h3>
              <p>作者：{book.author}</p>
              <p>價格：${book.price}</p>
              <p>狀態：{book.condition}</p>
              <p>描述：{book.description}</p>
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
