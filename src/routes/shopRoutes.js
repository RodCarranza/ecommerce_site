import express from 'express';
import * as productController from '../controllers/productController.js';
import * as authController from '../controllers/authController.js';
import * as cartController from '../controllers/cartController.js';
import * as orderController from '../controllers/orderController.js';
import { isAdmin } from '../controllers/authMiddleware.js';

const router = express.Router();

// -- Product routes -- //
router.get('/', productController.renderCatalog);
router.get('/products/:id', productController.renderProductDetail);

// -- Authentication Routes -- //
router.get('/register', authController.renderRegister);
router.post('/register', authController.handleRegister);
router.get('/login', authController.renderLogin);
router.post('/login', authController.handleLogin);
router.get('/logout', authController.handleLogout);

// -- Shopping Cart Routes -- //
router.get('/cart', cartController.renderCart);              // Renders the cart page
router.post('/cart', cartController.addToCart);              // Adds item to cart (POST)
router.post('/cart/delete', cartController.deleteFromCart);  // Removes item from cart (POST)

// -- Checkout and order routes -- //
router.get('/checkout', orderController.renderCheckout);
router.post('/checkout', orderController.handleCheckout);
router.get('/orders', orderController.renderOrderHistory);

// -- Admin dashboard routes -- //
router.get('/admin/dashboard', isAdmin, orderController.renderAdminDashboard);
router.post('/admin/dashboard/update', isAdmin, orderController.handleUpdateStatus);

export default router;