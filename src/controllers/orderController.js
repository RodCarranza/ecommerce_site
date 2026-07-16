import * as OrderModel from '../models/orderModel.js';
import * as CartModel from '../models/cartModel.js';

/**
 * Renders the checkout page if the user has items in their cart
 */
export const renderCheckout = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const cartItems = await CartModel.getCartByUserId(req.session.user.id);
        if (cartItems.length === 0) {
            return res.redirect('/cart');
        }

        const subtotal = cartItems.reduce((total, item) => {
            return total + (parseFloat(item.price) * item.quantity);
        }, 0);

        res.render('pages/checkout', { cartItems, subtotal, error: null });
    } catch (error) {
        console.error('❌ Checkout Render Error:', error.message);
        res.status(500).send('Server Error preparing checkout.');
    }
};

/**
 * Processes the transaction to finalize the order
 */
export const handleCheckout = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { shippingAddress } = req.body;
    
    if (!shippingAddress || shippingAddress.trim() === '') {
        try {
            const cartItems = await CartModel.getCartByUserId(req.session.user.id);
            const subtotal = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
            return res.render('pages/checkout', { cartItems, subtotal, error: 'Shipping address is required.' });
        } catch (err) {
            return res.status(500).send('Server Error');
        }
    }

    try {
        await OrderModel.placeOrder(req.session.user.id, shippingAddress);
        res.redirect('/orders'); // Redirect to order history after checkout
    } catch (error) {
        console.error('Checkout processing error:', error.message);
        try {
            const cartItems = await CartModel.getCartByUserId(req.session.user.id);
            const subtotal = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
            res.render('pages/checkout', { cartItems, subtotal, error: error.message });
        } catch (err) {
            res.status(500).send('Transaction processing failed.');
        }
    }
};

/**
 * Displays user order history along with itemized breakdowns
 */
export const renderOrderHistory = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const orders = await OrderModel.getOrdersByUserId(req.session.user.id);
        
        // Build detailed info arrays for every past order
        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const items = await OrderModel.getOrderDetails(order.id, req.session.user.id);
            return { ...order, items };
        }));

        res.render('pages/orders', { orders: ordersWithDetails });
    } catch (error) {
        console.error('Order History Error:', error.message);
        res.status(500).send('Server Error loading your orders.');
    }
};