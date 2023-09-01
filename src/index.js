import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
const lightbox = new SimpleLightbox('.gallery a');

const elements = {
    form: document.querySelector('.search-form'),
    input: document.querySelector('input[name="searchQuery"]'),
    serchButton: document.querySelector('button[type="submit"]'),
    galleryImg: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more')
};

let page ;
const limitPages = 40;
elements.loadMoreBtn.style.display = 'none';

elements.form.addEventListener('submit', handlerSubmit)

async function handlerSubmit(evt) {          // ФУНКЦІЯ ОБРОБКИ САБМІТУ ФОРМИ
    evt.preventDefault();
    
      
    if (elements.input.value === '') {
        Notiflix.Notify.info("Please fill in the search value.");
        return;
    }
    let inputQuery = elements.input.value.trim();    
    
    page = 1;
    try {
            elements.galleryImg.innerHTML = '';
            const data = await fetchSearch(inputQuery, page);
            if (data.hits.length === 0) {
                elements.loadMoreBtn.style.display = 'none';
                // elements.galleryImg.innerHTML = '';
                Notiflix.Notify.warning("Sorry, there are no images matching your search query. Please try again.")
                
            } else if (data.totalHits <= data.hits.length) {
                elements.loadMoreBtn.style.display = 'none';
                // elements.galleryImg.innerHTML = '';
                createMarkup(data.hits);
                lightbox.refresh();
                Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
                
            } else {
            //    elements.galleryImg.innerHTML = '';
            createMarkup(data.hits);
            elements.loadMoreBtn.style.display = 'block';
            lightbox.refresh();
            Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`) 
            }        
            
        }
        catch (error) {
            Notiflix.Notify.failure("Sorry, no images were found for your request. Please try again.")
        }
    
 
}

async function fetchSearch(inputQuery, page = 1) {  //АСИНХРОННА ФУНКЦІЯ-ПОШУК ЗБІРКИ КАРТИНОК ПО СЛОВУ З ІНПУТУ
    
    const BASE_URL = 'https://pixabay.com/api/';
    const API_KEY = '39138145-0133bb68dd7b803a442388e53';
    const params = new URLSearchParams({
        key: API_KEY,
        q: inputQuery,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: "true",
        per_page: limitPages,
        page: page
     });
    try {
        const response = await axios
        .get(`${BASE_URL}?${params}`)
        
        return response.data
    } catch (error) {
        throw new Error;
        
    }    

};

function createMarkup(arr) { //СТВОРЕННЯ РОЗМІТКИ
    const item = arr.map(item => 
`<div class="photo-card">
    <a class="gallery_link" href="${item.largeImageURL}">
        <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
    </a>
  <div class="info">
    <p class="info-item">
      <b>Likes: ${item.likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${item.views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${item.comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${item.downloads}</b>
    </p>
  </div>
</div>`).join('');
    elements.galleryImg.insertAdjacentHTML('beforeend', item);
}

elements.loadMoreBtn.addEventListener('click', addMoreImages) //ПРОСЛУХОВУВАЧ НА КЛІК ПО КНОПЦІ "ДОДАТИ ЩЕ КАРТИНОК"


async function addMoreImages() {  //Ф-ЦІЯ ОТРИМАННЯ ДОД. ПОРЦІЇ КАРТИНОК ПО КЛІКУ НА КНОПКУ
    page += 1;    
    const inputQuery = elements.input.value.trim();
    try {
        const data = await fetchSearch(inputQuery, page);
        createMarkup(data.hits);
        lightbox.refresh();
        
        if (page > data.totalHits / limitPages) {   //ПЕРЕВІРКА КІЛЬКОСТІ СТОРІНОК
            elements.loadMoreBtn.style.display = 'none';
            Notiflix.Notify.warning(
                "We're sorry, but you've reached the end of search results."
            );
        }
    } catch (error) {
       Notiflix.Notify.failure('Error while fetching images. Please try again.'); 
    };
};