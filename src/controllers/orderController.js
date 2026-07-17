import * as OrderModel from '../models/orderModel.js';
import * as CartModel from '../models/cartModel.js';
import pool from '../config/db.js';

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
        console.error('Checkout Render Error:', error.message);
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

/**
 * Renders the employee Dashboard showing all orders
 */
export const renderEmployeeDashboard = async (req, res) => {
    try {
        const orders = await OrderModel.getAllSystemOrders();

        // Populate items for every system order
        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const employeeItemsQuery = `
                SELECT oi.quantity, oi.price_at_purchase, p.name 
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = $1;
            `;
            const { rows } = await pool.query(employeeItemsQuery, [order.id]);
            
            return { ...order, items: rows };
        }));

        res.render('pages/employee-dashboard', { orders: ordersWithDetails });
    } catch (error) {
        console.error('employee Dashboard Error:', error.message);
        res.status(500).send('Server error loading employee Panel.');
    }
};

/**
 * Handles toggling order state updates
 */
export const handleUpdateStatus = async (req, res) => {
    const { orderId, newStatus } = req.body;
    try {
        await OrderModel.updateOrderStatus(orderId, newStatus);
        res.redirect('/employee/dashboard');
    } catch (error) {
        console.error('Status Update Error:', error.message);
        res.status(500).send('Failed to update status.');
    }
};