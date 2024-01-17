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
const totalHits = 500;
let currentPage = 1;
let searchQuery = '';
const totalImages = Math.ceil(totalHits / perPage);

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.form').addEventListener('submit', function (event) {
    event.preventDefault();

    loader.style.display = 'block';

    const searchQuery = document.querySelector('.input').value;
    currentPage = 1;
    searchImages(searchQuery);
  });
});

fetchBtn.addEventListener('click', async () => {
  loader.style.display = 'block';
  searchImages(searchQuery);
  if (currentPage > totalImages) {
    fetchBtn.style.display = 'none';
    return iziToast.error({
      title: 'Error',
      message: "We're sorry, but you've reached the end of search results.",
    });
  }
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

    loader.style.display = 'none';
    // loader.classList.remove('loader--active');

    displayImages(response.data, perPage);
  } catch (error) {
    loader.style.display = 'none';
    // loader.classList.remove('loader--active');

    showErrorToast();
  } finally {
    loader.style.display = 'none';
    loader.classList.remove('loader--active');
  }

  function displayImages(data, perPage) {
    if (data.hits.length > 0) {
      const imageCards = data.hits.map(image => {
        const card = document.createElement('div');
        card.classList.add('card');

        const largeImageLink = document.createElement('a');
        largeImageLink.href = image.largeImageURL;
        largeImageLink.dataset.lightbox = 'gallery';
        // largeImageLink.setAttribute('data-title', image.tags);

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

      document.querySelector('.load-more').style.display = 'block';

      if (
        data.hits.length < perPage ||
        currentPage * perPage >= data.totalHits
      ) {
        fetchBtn.style.display = 'none';
      }
      if (currentPage * perPage >= data.totalHits) {
        iziToast.info({
          title: 'End of Search Results',
          message: "We're sorry, but you've reached the end of search results.",
        });
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

function showErrorToast() {
  iziToast.error({
    title: 'Error',
    message: 'An error occurred. Please try again later.',
  });
}

function showNoImagesFoundToast() {
  iziToast.info({
    title: 'No Images Found',
    message:
      'Sorry, there are no images matching your search query. Please try again!',
  });
}
