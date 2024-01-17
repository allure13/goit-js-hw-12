import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api';
const galleryContainer = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const fetchBtn = document.querySelector('.load-more');

const perPage = 40;
let currentPage = 1;
let searchQuery = '';
let totalHits = 0;
let totalPages = 0;

let clearImagesOnSearch = true;

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.form').addEventListener('submit', function (event) {
    event.preventDefault();

    loader.style.display = 'block';

    // Оновлення значення searchQuery
    const newSearchQuery = document.querySelector('.input').value;

    // Перевірка, чи змінилася пошукова фраза
    if (newSearchQuery !== searchQuery) {
      currentPage = 1;
      clearImagesOnSearch = true;
      searchQuery = newSearchQuery;
      searchImages(searchQuery);
    }
  });
});

fetchBtn.addEventListener('click', async () => {
  loader.style.display = 'block';
  clearImagesOnSearch = false;
  searchImages(searchQuery);
});

async function searchImages(query) {
  const searchParams = {
    key: '41530173-f95b78bdec41263a85620f647',
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: perPage,
    page: currentPage,
  };

  try {
    const response = await axios.get(
      `${BASE_URL}/?${new URLSearchParams(searchParams)}`
    );
    totalHits = response.data.totalHits;
    totalPages = Math.ceil(totalHits / perPage);
    displayImages(response.data, perPage);
  } catch (error) {
    showErrorToast();
  } finally {
    loader.style.display = 'none';
    loader.classList.remove('loader--active');
  }

  function displayImages(data) {
    if (data.hits.length > 0) {
      if (clearImagesOnSearch) {
        galleryContainer.innerHTML = '';
      }

      const imageCards = data.hits.map(image => {
        const card = document.createElement('div');
        card.classList.add('card');

        const largeImageLink = document.createElement('a');
        largeImageLink.href = image.largeImageURL;
        largeImageLink.dataset.lightbox = 'gallery';

        const img = document.createElement('img');
        img.src = image.webformatURL;
        img.alt = image.tags;

        largeImageLink.appendChild(img);

        card.appendChild(largeImageLink);

        const details = document.createElement('div');
        details.classList.add('details');

        const likes = document.createElement('p');
        likes.textContent = `Likes: ${image.likes}`;
        details.appendChild(likes);

        const views = document.createElement('p');
        views.textContent = `Views: ${image.views}`;
        details.appendChild(views);

        const comments = document.createElement('p');
        comments.textContent = `Comments: ${image.comments}`;
        details.appendChild(comments);

        const downloads = document.createElement('p');
        downloads.textContent = `Downloads: ${image.downloads}`;
        details.appendChild(downloads);

        card.appendChild(details);

        return card.outerHTML;
      });

      galleryContainer.insertAdjacentHTML('beforeend', imageCards.join(''));

      const lightbox = new SimpleLightbox('.gallery a', {});
      lightbox.refresh();

      document.querySelector('.load-more').style.display =
        currentPage < totalPages ? 'block' : 'none';

      if (currentPage >= totalPages) {
        showInfoToast();
      }

      currentPage += 1; // додаю сторінку при натисканні на кнопку
    } else {
      showNoImagesFoundToast();

      fetchBtn.style.display = 'none';
    }
    // Отримання висоти однієї карточки галереї
    const cardHeight = document
      .querySelector('.card')
      .getBoundingClientRect().height;

    // Плавна прокрутка сторінки на дві висоти карточки галереї
    window.scrollBy({
      top: cardHeight * 2, // Прокрутити на дві висоти карточки
      behavior: 'smooth', // Зробити прокрутку плавною
    });
  }
}

function showInfoToast() {
  iziToast.info({
    title: 'End of Search Results',
    message: "We're sorry, but you've reached the end of search results.",
    position: 'topRight',
    messageSize: 14,
  });
}

function showErrorToast() {
  iziToast.error({
    title: 'Error',
    message: 'An error occurred. Please try again later.',
    position: 'topRight',
    messageSize: 14,
  });
}

function showNoImagesFoundToast() {
  iziToast.info({
    title: 'No Images Found',
    message:
      'Sorry, there are no images matching your search query. Please try again!',
    position: 'topRight',
    messageSize: 14,
  });
}
