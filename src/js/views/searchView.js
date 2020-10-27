// export const add = (a, b) => a + b;
// export const multiply = (a, b) => a * b;
// export const ID = 23;

import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el=>{
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
};

// formatting the recipe title
 
export const limitRecipeTitle = (title, limit = 17) => {
    let newTitle = [];
 
    let reduceFunc = (acc, cur) => {
        if (acc + cur.length <= limit) {
            newTitle.push(cur);
        }
        return acc + cur.length;
    };
 
    if (title.length > limit) {
            //first 2 arguments of a reduce callback function are: previousValue and currentValue
            //this reduce has the accumulator and current as the first parameter
            //2nd parameter here is initialValue (0) of the accumulator
            //title.split(" ") returns an array of individual words
        title.split(" ").reduce(reduceFunc, 0);
            //return the result, .join will join it into a string separated by spaces
        return `${newTitle.join(' ')}...`;
    }
    return title;
};

const renderRecipe = recipe => {
    const markup = `
    <li>
       <a class="results__link" href="#${recipe.recipe_id}">
       <figure class="results__fig">
            <img src="${recipe.image_url}" alt="${recipe.title}">
        </figure>
        <div class="results__data">
            <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
            <p class="results__author">${recipe.publisher}</p>
        </div>
        </a>
   </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

// type: prev or 'next'
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page -1 : page + 1}>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
        <span>Page ${type === 'prev' ? page -1 : page + 1}</span>
    </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);
    let button;
    if(page === 1 && pages > 1){
        //Button to go to next page
        button = createButton(page, 'next');
    }else if(page < pages){
        //both buttons
        button = `
        ${createButton(page, 'prev')}
        ${createButton(page, 'next')}
        `;
    }
    else if(page === pages){
        //only button to go to prev page
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    //render results of current page
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;
    recipes.slice(start, end).forEach(renderRecipe);
    
    //render pagination buttons
    renderButtons(page, recipes.length, resPerPage);
};