// AddBook.js
import React, { useState } from 'react';

const AddBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('new');
  const [description, setDescription] = useState('');
  const [image_url, setImageUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newBook = {
      title,
      author,
      price,
      condition,
      description,
      image_url,
    };

    try {
      const response = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBook),
      });
      const data = await response.json();
      console.log('新增書籍成功:', data);
    } catch (err) {
      console.error('新增書籍失敗:', err);
    }
  };

  return (
    <div>
      <h2>新增書籍</h2>
      <form onSubmit={handleSubmit}>
        <label>
          書名:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          作者:
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </label>
        <label>
          價格:
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>
        <label>
          狀態:
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="new">全新</option>
            <option value="used">二手</option>
          </select>
        </label>
        <label>
          描述:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          圖片URL:
          <input
            type="text"
            value={image_url}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>
        <button type="submit">新增書籍</button>
      </form>
    </div>
  );
};

export default AddBook;
