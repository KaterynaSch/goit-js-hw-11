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
    loadMoreBtn: document.querySelector('.load-more'),
    guard: document.querySelector('.js-guard')
};
console.log(elements.guard);
let page ;
const limitPages = 40;

elements.form.addEventListener('submit', handlerSubmit)

async function handlerSubmit(evt) {       
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
            Notiflix.Notify.warning("Sorry, there are no images matching your search query. Please try again.")
            
        } else if (data.totalHits <= data.hits.length) {            
            createMarkup(data.hits);
            lightbox.refresh();
            Notiflix.Notify.warning("We're sorry, but you've reached the end of search results.");
            
        } else {        
        createMarkup(data.hits);
        // elements.loadMoreBtn.style.display = 'block';
        observer.observe(elements.guard);//--inf-scroll
        lightbox.refresh();
            Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`)       
        }        
            
    }
    catch (error) {
        Notiflix.Notify.failure("Sorry, no images were found for your request. Please try again.")
    }   
};

async function fetchSearch(inputQuery, page = 1) {  
    
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

function createMarkup(arr) { 
    const item = arr.map(item => 
`<div class="photo-card">
    <a href="${item.largeImageURL}">
        <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" />
    </a>
  <div class="info">
    <p><b>Likes: ${item.likes}</b></p>
    <p><b>Views: ${item.views}</b></p>
    <p><b>Comments: ${item.comments}</b></p>
    <p><b>Downloads: ${item.downloads}</b></p>
  </div>
</div>`).join('');
    elements.galleryImg.insertAdjacentHTML('beforeend', item);
}


// ------------------------Load more-------------------
// elements.loadMoreBtn.addEventListener('click', addMoreImages);

// async function addMoreImages() {
//     page += 1;
//     const inputQuery = elements.input.value.trim();
//     try {
//         const data = await fetchSearch(inputQuery, page);
//         createMarkup(data.hits);
//         lightbox.refresh();
//         const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
//         window.scrollBy({
//         top: cardHeight,
//         behavior: "smooth",
//         });
        
//         if (page > data.totalHits / limitPages) {
//             elements.loadMoreBtn.style.display = 'none';
//             Notiflix.Notify.warning(
//                 "We're sorry, but you've reached the end of search results."
//             );
//         }
//     } catch (error) {
//        Notiflix.Notify.failure('Error while fetching images. Please try again.');
//     };
// };

// ----------------------------------Infinity scroll-----------------------

const options = {
    root: null,
    rootMargin: '450px',
};
const observer = new IntersectionObserver(handlerInfinityScroll, options);
function handlerInfinityScroll(entries) {
    entries.forEach((entry) => {
        console.log(entry);
        if (entry.isIntersecting) {
            page += 1;          
            fetchSearch(page)
            .then((data) => {
                createMarkup(data.hits);
                lightbox.refresh()
            })
            .catch((error) => {
                Notiflix.Notify.failure('Error while fetching images. Please try again.');
            });
    
        }    
        
    })
};
