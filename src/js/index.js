import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/* Global state of the app
*- search object 
* - current recipe object
* - shopping list object
* - Likeed recipes
*/
const state = {};

/**Search controller */

const controlSearch = async () => {
    //1) Get the query from view
    const query = searchView.getInput();
    console.log(query);

    if(query){
        //2) New search obj and add to state
        state.search = new Search(query);

        //3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

       try{ 

        //4) Search for recipes
        await state.search.getResults();

        //5) Render results on UI
        //console.log(state.search.results);
        clearLoader();
        searchView.renderResults(state.search.results);
        }catch(err){
          alert('Something wrong with the search...');
          clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.results, goToPage);
    }
});


/**Recipe controller */


const controlRecipe = async () => {
    //get id from url
    const id = window.location.hash.replace('#', '');

    if (id){
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight Selected search item
        if (state.search) searchView.highlightSelected(id);

        //create newrecipe object
        state.recipe = new Recipe(id);

        try{
        //get recipe data and parse Ingredients.
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();

        //calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();

        //render recipe
        clearLoader();
        recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
            );

    }catch(err){
        console.log(err);
         alert('Error Processing Recipe.');
        } 
    }
};



['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**List Controller */

const controlList = () => {
    //create a new list IF there in none yet
    if(!state.list) state.list = new List();

    //add each ingredient to the List
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}


//Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle delete event / delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //delete from state
        state.list.deleteItem(id);

        //delete from UI
        listView.deleteItem(id);

        //Handle the count update
    }else if(e.target.matches('.shopping__count-value')){
        if(state.recipe.ingredients > 1){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
        }
    }
});

/**Like controller */

const controlLike = ()=> {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    if(!state.likes.isLiked(currentID)){
        //add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        //toggle the like button
        likesView.toggleLikeBtn(true);

        //add like to UI like  
        likesView.renderLike(newLike);

    //user Has liked current recipe
    }else{
        //remove like to the state
        state.likes.deleteLike(currentID);

        //toggle the like button
        likesView.toggleLikeBtn(false);

        //remove like to UI like
        likesView.deleteLike(currentID);

    }
    likesView.toggleLikeMenu(state.likes.getNumberLikes());

};

//Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    //Restore likes
    state.likes.readStorage();

    //toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumberLikes());

    //Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


//Handling recipe button clicks(increasing and decreasing)
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        //decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }        
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        //increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }else if (e.target.matches('.recipe__btn-add, .recipe__btn-add *' )){
        //add ingredients to shopping like
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        //like controlller
        controlLike();
    }
});





















// import str from './models/Search';

// //1way--import{add, multiply, ID} from './views/searchView';
// //2nd way--import{add as a, multiply as m, ID} from './views/searchView';

// import * as searchView from './views/searchView';

// console.log(`Using import functions! ${searchView.add(searchView.ID, 2)} and ${searchView.multiply(3, 5)} , ${str}`);


// const res = await axios(`${PROXY}http://food2fork.com/api/search?key=${KEY}&q=${this.query}`);


// const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);

// const res = await axios(`${PROXY}http://food2fork.com/api/get?key=${KEY}&rId=${this.id}`);


// const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);


//https://forkify-api.herokuapp.com/api/search
//https://forkify-api.herokuapp.com/api/get