$(document).ready(function () {
  const API_KEY = '12078d0f9bca43f58e2d7459afb66660';
  const BASE_URL = 'https://newsapi.org/v2';
  const PROXY = 'https://corsproxy.io/?';
  const newsContainer = $('#news-container');
  let currentCategory = 'general';

  // Simpan data Like dan Bookmark di localStorage
  let likedArticles = JSON.parse(localStorage.getItem('likedArticles')) || [];
  let bookmarkedArticles = JSON.parse(localStorage.getItem('bookmarkedArticles')) || [];

  // Panggil kategori awal
  fetchNews(currentCategory);

  // Event klik kategori
  $('.category-btn').on('click', function () {
    $('.category-btn').removeClass('active');
    $(this).addClass('active');
    currentCategory = $(this).data('category');
    fetchNews(currentCategory);
  });

  // Event tombol cari
  $('#search-btn').on('click', function () {
    const term = $('#search-input').val().trim();
    if (term) fetchNews(currentCategory, term);
  });

  // Tekan Enter untuk cari
  $('#search-input').on('keypress', function (e) {
    if (e.which === 13) $('#search-btn').click();
  });

  // Fungsi ambil berita
  function fetchNews(category, searchTerm = '') {
    newsContainer.html(`
      <div class="loading text-center py-5">
        <i class="fas fa-spinner fa-spin fa-2x mb-2"></i>
        <p>Memuat berita...</p>
      </div>
    `);

    let targetUrl = searchTerm
      ? `${BASE_URL}/everything?q=${encodeURIComponent(searchTerm)}&sortBy=publishedAt&apiKey=${API_KEY}`
      : `${BASE_URL}/top-headlines?category=${category}&country=us&apiKey=${API_KEY}`;

    // Gunakan proxy CORS
    let url = `${PROXY}${encodeURIComponent(targetUrl)}`;

    $.getJSON(url, function (data) {
      if (data.articles && data.articles.length > 0) {
        displayNews(data.articles);
      } else {
        newsContainer.html(`
          <div class="text-center text-muted py-5">
            <i class="fas fa-newspaper fa-2x mb-2"></i>
            <p>Tidak ada berita ditemukan.</p>
          </div>
        `);
      }
    }).fail(function (xhr, status, error) {
      // Tampilkan detail error di layar untuk debugging
      console.error("Error detail:", xhr, status, error);
      newsContainer.html(`
        <div class="text-center text-danger py-5">
          <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
          <p><b>Gagal memuat berita!</b></p>
          <p>Status: ${status}</p>
          <p>Error: ${error}</p>
          <p>Response: ${xhr.responseText || 'Tidak ada respon dari server (mungkin CORS atau API key diblokir)'}</p>
          <p style="color: gray; font-size: 14px;">Coba aktifkan proxy di https://cors-anywhere.herokuapp.com/corsdemo atau gunakan backend proxy sendiri.</p>
        </div>
      `);
    });
  }

  // Fungsi tampilkan berita
  function displayNews(articles) {
    newsContainer.empty();
    articles.forEach((a) => {
      const date = new Date(a.publishedAt).toLocaleDateString();
      const imgUrl = a.urlToImage || 'https://placehold.co/400x200?text=No+Image';
      const newsUrl = a.url || '#';

      const isLiked = likedArticles.includes(a.title);
      const isBookmarked = bookmarkedArticles.includes(a.title);

      const card = `
        <div class="news-card shadow-sm rounded mb-4 position-relative">
          <div class="news-image">
            <img src="${imgUrl}" alt="${a.title}" class="img-fluid rounded-top">
          </div>
          <div class="news-content p-3">
            <div class="news-source d-flex justify-content-between small text-muted mb-2">
              <span>${a.source.name || 'Unknown'}</span>
              <span>${date}</span>
            </div>
            <h5 class="news-title fw-semibold">${a.title}</h5>
            <p class="news-desc">${a.description || 'No description available.'}</p>
            <div class="d-flex justify-content-between align-items-center">
              <a href="${newsUrl}" target="_blank" rel="noopener noreferrer" class="news-link text-decoration-none fw-bold text-primary">
                Read more <i class="fas fa-arrow-right"></i>
              </a>
              <div class="action-icons">
                <i class="fa-solid fa-thumbs-up like-btn ${isLiked ? 'liked' : ''}" data-title="${a.title}" title="Like"></i>
                <i class="fa-solid fa-bookmark bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-title="${a.title}" title="Bookmark"></i>
              </div>
            </div>
          </div>
        </div>
      `;
      newsContainer.append(card);
    });

    // Event tombol Like
    $('.like-btn').off('click').on('click', function () {
      const title = $(this).data('title');
      if (likedArticles.includes(title)) {
        likedArticles = likedArticles.filter(t => t !== title);
        $(this).removeClass('liked');
      } else {
        likedArticles.push(title);
        $(this).addClass('liked');
      }
      localStorage.setItem('likedArticles', JSON.stringify(likedArticles));
    });

    // Event tombol Bookmark
    $('.bookmark-btn').off('click').on('click', function () {
      const title = $(this).data('title');
      if (bookmarkedArticles.includes(title)) {
        bookmarkedArticles = bookmarkedArticles.filter(t => t !== title);
        $(this).removeClass('bookmarked');
      } else {
        bookmarkedArticles.push(title);
        $(this).addClass('bookmarked');
      }
      localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarkedArticles));
    });
  }
});
