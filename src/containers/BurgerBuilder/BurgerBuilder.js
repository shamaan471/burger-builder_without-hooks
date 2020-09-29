import React, { Component } from 'react';
import { connect } from 'react-redux';

import Aux from '../../hoc/Auxillary/Auxillary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import * as actions from '../../store/actions/index';
import axios from '../../axios-orders';

class BurgerBuilder extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {...}
    // }
    state = {
        purchasing: false //to decide whether to show the modal
    }


    //initialize the initial ingredients in the state by importing from db
    componentDidMount () {
        console.log(this.props); 
        this.props.onInitIngredients();
    }

    //to disable continue button if amt of ing <= 0
    updatePurchaseState ( ingredients ) {
        const sum = Object.keys( ingredients )
            .map( igKey => {
                return ingredients[igKey];
            } )
            .reduce( ( sum, el ) => {
                return sum + el;
            }, 0 );
        return sum > 0;
    }

    purchaseHandler = () => {
        if (this.props.isAuthenticated) {  //through cheking the token id in the auth state in sotre
            this.setState( { purchasing: true } );  //now show the modal with order summary
        } else {
            //?????????????????????????????????????????????????????????????????????
            this.props.onSetAuthRedirectPath('/checkout'); //set auth redirect path in the state
            //?????????????????????????????????????????????????????????????????????
            this.props.history.push('/auth');  //go to the auth page
        }
    }

    purchaseCancelHandler = () => {
        this.setState( { purchasing: false } );
    }

    //if continue in th modal clicked
    purchaseContinueHandler = () => {
        this.props.onInitPurchase(); //set purchased in ordered state to false
        this.props.history.push('/checkout'); //go to checkout
    }

    render () {
        const disabledInfo = {
            ...this.props.ings
        };
        for ( let key in disabledInfo ) {
            disabledInfo[key] = disabledInfo[key] <= 0
        }
        let orderSummary = null;
        let burger = this.props.error ? <p>Ingredients can't be loaded!</p> : <Spinner />;

        if ( this.props.ings ) {
            burger = (
                <Aux>
                    <Burger ingredients={this.props.ings} />
                    <BuildControls
                        ingredientAdded={this.props.onIngredientAdded}
                        ingredientRemoved={this.props.onIngredientRemoved}
                        disabled={disabledInfo}
                        purchasable={this.updatePurchaseState(this.props.ings)}
                        ordered={this.purchaseHandler} //onClick of the order button (go to sihnup or checkout)
                        isAuth={this.props.isAuthenticated} //to decide whether to set the button to signup or checkout
                        price={this.props.price} />
                </Aux>
            );
            orderSummary = <OrderSummary
                ingredients={this.props.ings}
                price={this.props.price}
                purchaseCancelled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler} />;
        }
        // {salad: true, meat: false, ...}
        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        );
    }
}

const mapStateToProps = state => {
    return {
        ings: state.burgerBuilder.ingredients,
        price: state.burgerBuilder.totalPrice,
        error: state.burgerBuilder.error,
        isAuthenticated: state.auth.token !== null
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: (ingName) => dispatch(actions.addIngredient(ingName)),
        onIngredientRemoved: (ingName) => dispatch(actions.removeIngredient(ingName)),
        onInitIngredients: () => dispatch(actions.initIngredients()), //initialize the initial ingredients in the state by importing from db
        onInitPurchase: () => dispatch(actions.purchaseInit()), //set purchased in ordered state to false
        onSetAuthRedirectPath: (path) => dispatch(actions.setAuthRedirectPath(path)) //set auth redirect path in the state
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler( BurgerBuilder, axios ));