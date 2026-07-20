import * as CartModel from '../models/cartModel.js';

/**
 * Displays the logged-in user's active shopping cart
 */
export const renderCart = async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const cartItems = await CartModel.getCartByUserId(req.session.user.id);
        
        // Calculate the dynamic subtotal from order_items
        const subtotal = cartItems.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);

        res.render('pages/cart', { cartItems, subtotal });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles adding an item from a product page form
 */
export const addToCart = async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { productId, quantity } = req.body;
    try {
        await CartModel.addItemToCart(req.session.user.id, productId, quantity);
        res.redirect('/cart');
    } catch (error) {
        next(error);
    }
};

/**
 * Handles removing an item from the cart
 */
export const deleteFromCart = async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { cartItemId } = req.body;
    try {
        await CartModel.removeCartItem(cartItemId, req.session.user.id);
        res.redirect('/cart');
    } catch (error) {
        next(error);
    }
};