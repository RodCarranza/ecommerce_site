import * as CartModel from '../models/cartModel.js';

/**
 * Displays the logged-in user's active shopping cart
 */
export const renderCart = async (req, res) => {
    // If the user isn't logged in, redirect them to the login screen
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const cartItems = await CartModel.getCartByUserId(req.session.user.id);
        
        // Calculate the dynamic subtotal from your order_items
        const subtotal = cartItems.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);

        res.render('pages/cart', { cartItems, subtotal });
    } catch (error) {
        console.error('❌ Cart View Error:', error.message);
        res.status(500).send('Server Error loading your shopping cart.');
    }
};

/**
 * Handles adding an item from a product page form
 */
export const addToCart = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { productId, quantity } = req.body;
    try {
        await CartModel.addItemToCart(req.session.user.id, productId, quantity);
        res.redirect('/cart');
    } catch (error) {
        console.error('❌ Add to Cart Error:', error.message);
        res.status(500).send('Failed to add item to shopping cart.');
    }
};

/**
 * Handles removing an item from the cart
 */
export const deleteFromCart = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { cartItemId } = req.body;
    try {
        await CartModel.removeCartItem(cartItemId, req.session.user.id);
        res.redirect('/cart');
    } catch (error) {
        console.error('❌ Remove from Cart Error:', error.message);
        res.status(500).send('Failed to remove item.');
    }
};