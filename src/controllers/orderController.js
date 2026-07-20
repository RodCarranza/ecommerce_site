import * as OrderModel from '../models/orderModel.js';
import * as CartModel from '../models/cartModel.js';

/**
 * Renders the checkout page if the user has items in their cart
 */
export const renderCheckout = async (req, res, next) => {
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
        next(error);
    }
};

/**
 * Processes the transaction to finalize the order
 */
export const handleCheckout = async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { shippingAddress } = req.body;
    
    // 1. Validation Guard Block
    if (!shippingAddress || shippingAddress.trim() === '') {
        try {
            const cartItems = await CartModel.getCartByUserId(req.session.user.id);
            const subtotal = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
            return res.render('pages/checkout', { cartItems, subtotal, error: 'Shipping address is required.' });
        } catch (err) {
            return next(err);
        }
    }

    // 2. Transaction Processing
    try {
        await OrderModel.placeOrder(req.session.user.id, shippingAddress);
        res.redirect('/orders');
    } catch (error) {
        // Unexpected database failures in placeOrder now go straight to global error handling
        next(error);
    }
};

/**
 * Displays user order history along with itemized breakdowns
 */
export const renderOrderHistory = async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const orders = await OrderModel.getOrdersByUserId(req.session.user.id);
        
        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const items = await OrderModel.getOrderDetails(order.id, req.session.user.id);
            return { ...order, items };
        }));

        res.render('pages/orders', { orders: ordersWithDetails });
    } catch (error) {
        next(error);
    }
};

/**
 * Renders the employee Dashboard showing all orders
 */
export const renderEmployeeDashboard = async (req, res, next) => {
    try {
        const orders = await OrderModel.getAllSystemOrders();

        // Delegate query fetching to OrderModel instead of raw pool queries
        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const items = await OrderModel.getEmployeeOrderItems(order.id);
            return { ...order, items };
        }));

        res.render('pages/employee-dashboard', { orders: ordersWithDetails });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to handle updating an order's operational fulfillment status
 */
export const handleUpdateStatus = async (req, res, next) => {
    const { orderId, newStatus } = req.body;
    
    try {
        await OrderModel.updateOrderStatus(orderId, newStatus);
        
        const dashboardUrl = req.session.user && req.session.user.role === 'admin' 
            ? '/admin/dashboard' 
            : '/employee/dashboard';
        
        res.redirect(dashboardUrl);
    } catch (error) {
        next(error);
    }
};