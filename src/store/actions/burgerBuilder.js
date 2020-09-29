import * as actionTypes from './actionTypes';
import axios from '../../axios-orders';


//update the ingredients, price and set building to true in burgerbuilder state
export const addIngredient = ( name ) => {
    return {
        type: actionTypes.ADD_INGREDIENT,
        ingredientName: name
    };
};

export const removeIngredient = ( name ) => {
    return {
        type: actionTypes.REMOVE_INGREDIENT,
        ingredientName: name
    };
};

export const setIngredients = ( ingredients ) => {
    return {
        type: actionTypes.SET_INGREDIENTS,
        ingredients: ingredients
    };
};

export const fetchIngredientsFailed = () => {
    return {
        type: actionTypes.FETCH_INGREDIENTS_FAILED
    };
};

//initialize the initial ingredients in the state by importing from db
//the respnse.data will contain the ingredients object
export const initIngredients = () => {
    return dispatch => {
        axios.get( 'https://react-my-burger-3b001.firebaseio.com/ingredients.json' )
            .then( response => {
               dispatch(setIngredients(response.data)); //set the ingredients, price to default (4) and error and building to false in state
            } )
            .catch( error => {
                dispatch(fetchIngredientsFailed());
            } );
    };
};