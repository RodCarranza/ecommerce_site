import * as OrderModel from '../models/orderModel.js';
import * as CartModel from '../models/cartModel.js';
import pool from '../config/db.js';

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
        // 🛠️ FIX: Hand off database fetch faults to the central error middleware
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
    
    // Address Validation Guard Block
    if (!shippingAddress || shippingAddress.trim() === '') {
        try {
            const cartItems = await CartModel.getCartByUserId(req.session.user.id);
            const subtotal = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
            return res.render('pages/checkout', { cartItems, subtotal, error: 'Shipping address is required.' });
        } catch (err) {
            // 🛠️ FIX: Routed to the global safety net
            return next(err);
        }
    }

    try {
        await OrderModel.placeOrder(req.session.user.id, shippingAddress);
        res.redirect('/orders'); // Redirect to order history after checkout
    } catch (error) {
        try {
            // Attempt to gracefully re-render with validation context if transaction rules fail
            const cartItems = await CartModel.getCartByUserId(req.session.user.id);
            const subtotal = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
            res.render('pages/checkout', { cartItems, subtotal, error: error.message });
        } catch (err) {
            // 🛠️ FIX: If even the secondary cart rollback query crashes, bubble it out to the portal
            next(err);
        }
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
        
        // Build detailed info arrays for every past order
        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const items = await OrderModel.getOrderDetails(order.id, req.session.user.id);
            return { ...order, items };
        }));

        res.render('pages/orders', { orders: ordersWithDetails });
    } catch (error) {
        // 🛠️ FIX: Routed mapping or connection limits to the error layout
        next(error);
    }
};

/**
 * Renders the employee Dashboard showing all orders
 */
export const renderEmployeeDashboard = async (req, res, next) => {
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
        // 🛠️ FIX: Cleanly route cluster mapping exceptions to the system logs view
        next(error);
    }
};

/**
 * Controller to handle updating an order's operational fulfillment status
 */
export const handleUpdateStatus = async (req, res, next) => {
    const { orderId, newStatus } = req.body;
    
    try {
        // 1. Persist the updated fulfillment status to the database cluster
        await OrderModel.updateOrderStatus(orderId, newStatus);
        
        // 2. Dynamically determine the destination path depending on the staff member's clearance role
        const dashboardUrl = req.session.user && req.session.user.role === 'admin' 
            ? '/admin/dashboard' 
            : '/employee/dashboard';
        
        // 3. Return the user smoothly back to their dedicated operational workspace
        res.redirect(dashboardUrl);
    } catch (error) {
        // Hand unexpected database faults off to the global centralized error handler middleware
        next(error);
    }
};