// 🔄 網址參數檢查，自動跳轉其他頁面
window.onload = function () {
  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");
  if (page && page !== "bookForm.html") {
    window.location.href = `${page}.html`;
  }
};

// 初始化 LIFF，有登入用真帳號，沒登入用預設帳號
async function initLIFF() {
  try {
    await liff.init({ liffId: "2007363323-BlP5rZeJ" });

    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      const userId = profile.userId;
      const displayName = profile.displayName;

      localStorage.setItem('user_id', userId);
      document.getElementById('lineName').innerText = displayName;
    } else {
      // 預設開發帳號
      const defaultUserId = "dev_user_001";
      localStorage.setItem('user_id', defaultUserId);
      document.getElementById('lineName').innerText = "開發者模式";
      console.log("使用預設帳號：", defaultUserId);
    }
  } catch (err) {
    console.error("LIFF 初始化失敗，使用預設帳號", err);
    const defaultUserId = "dev_user_001";
    localStorage.setItem('user_id', defaultUserId);
    document.getElementById('lineName').innerText = "開發者模式";
  }
}

// 自願登入按鈕
function loginWithLINE() {
  if (!liff.isLoggedIn()) {
    liff.login();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await initLIFF();
  await filterBooks();
});

document.getElementById('filterForm').addEventListener('submit', function(e) {
  e.preventDefault();
  filterBooks();
});

function resetFilters() {
  document.getElementById('filterForm').reset();
  filterBooks();
}

async function filterBooks() {
  const title = document.getElementById('filterTitle').value.toLowerCase();
  const author = document.getElementById('filterAuthor').value.toLowerCase();
  const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
  const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
  const condition = document.getElementById('filterCondition').value;
  const is_sold = document.getElementById('filterSold').value;

  const response = await fetch('https://cccbookbot-0c3d990eba99.herokuapp.com/api/books');
  const books = await response.json();
  const tbody = document.querySelector('#booksTable tbody');
  tbody.innerHTML = '';

  books.filter(book => {
    return (
      (!title || book.title.toLowerCase().includes(title)) &&
      (!author || book.author.toLowerCase().includes(author)) &&
      book.price >= minPrice &&
      book.price <= maxPrice &&
      (!condition || book.condition === condition) &&
      (!is_sold || String(book.is_sold) === is_sold)
    );
  }).forEach(book => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>$${book.price}</td>
      <td>${book.condition}</td>
      <td>${book.is_sold ? '✔️' : '❌'}</td>
      <td><img src="${book.image_url}" alt="書籍圖片"></td>
      <td><button onclick="addToCart('${book._id}')">加入購物車</button></td>
    `;
    tbody.appendChild(row);
  });
}

async function addToCart(bookId) {
  const userId = localStorage.getItem("user_id");
  if (!userId) {
    alert("使用者 ID 遺失，請重新整理頁面");
    return;
  }

  try {
    const res = await fetch("https://cccbookbot-0c3d990eba99.herokuapp.com/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId, bookId, quantity: 1 })
    });

    const result = await res.json();
    if (res.ok) {
      alert("已加入購物車！");
    } else {
      alert(result.message || "加入購物車失敗");
    }
  } catch (error) {
    console.error("錯誤：", error);
    alert("無法連接伺服器，請稍後再試");
  }
}
