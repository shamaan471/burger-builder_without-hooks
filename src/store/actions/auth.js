import axios from 'axios';

import * as actionTypes from './actionTypes';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    };
};

//singing in/up successful so store the token and userid and set error to null and loading to false in auth state in store
export const authSuccess = (token, userId) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        idToken: token,
        userId: userId
    };
};

export const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    };
};


//setting the token and userid to null in the state store
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('userId');
    return {
        type: actionTypes.AUTH_LOGOUT
    };
};


/*
*an async code that will keep track of the time to logout the user after request times out 
*/
export const checkAuthTimeout = (expirationTime) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime * 1000);
    };
};

//signing in or signing up depending on isSignup
export const auth = (email, password, isSignup) => {
    return dispatch => {
        dispatch(authStart()); //setting the loading in state to true and error to false initially
        const authData = {
            email: email,
            password: password,
            returnSecureToken: true //Whether or not to return an ID and refresh token. Should always be true.
        };
        //let url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyB5cHT6x62tTe-g27vBDIqWcwQWBSj3uiY';
        let url = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCbXnFQ0DGdVcrvbj8zjGFellSlE0gUr1M'; //url obtained from firebase (RestfulApi Signup doc)

        if (!isSignup) { //if signing in
            url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCbXnFQ0DGdVcrvbj8zjGFellSlE0gUr1M';
        }

        axios.post(url, authData)  //sending the post request to firebase to signup or login user. firebase sends a token and id in response 
            .then(response => {
                console.log(response);

                //storing the response data to the local storage of the browser
                const expirationDate = new Date(new Date().getTime() + response.data.expiresIn * 1000);
                localStorage.setItem('token', response.data.idToken);
                localStorage.setItem('expirationDate', expirationDate);
                localStorage.setItem('userId', response.data.localId);

  
                dispatch(authSuccess(response.data.idToken, response.data.localId)); //set the token and user id in state and loading and err to null in state
                dispatch(checkAuthTimeout(response.data.expiresIn));
            })
            .catch(err => {
                dispatch(authFail(err.response.data.error));
            });
    };
};


//set auth redirect path in the state
export const setAuthRedirectPath = (path) => {
    return {
        type: actionTypes.SET_AUTH_REDIRECT_PATH,
        path: path
    };
};

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token'); //local storage defined in browser
        if (!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate')); 
            if (expirationDate <= new Date()) { //if session expired
                dispatch(logout());
            } else {
                const userId = localStorage.getItem('userId');
                dispatch(authSuccess(token, userId)); //set the token and user id in state and loading and err to null in state
                dispatch(checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000 ));
            }   
        }
    };
};