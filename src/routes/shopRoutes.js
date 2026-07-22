import express from 'express';
import * as productController from '../controllers/productController.js';
import * as authController from '../controllers/authController.js';
import * as cartController from '../controllers/cartController.js';
import * as orderController from '../controllers/orderController.js';
import { renderManageUsers, handleDeleteUser, renderRegisterEmployee, handleRegisterEmployee } from '../controllers/userController.js';
import { isAdmin, isEmployee } from '../middleware/authMiddleware.js';
import * as ReviewController from '../controllers/reviewController.js';
import { handleUpdateDescription } from '../controllers/productController.js';

const router = express.Router();

// -- Product routes -- //
router.get('/', productController.renderCatalog);
router.get('/products/:id', productController.renderProductDetail);

// 1. Route to handle submitting a new review
router.post('/products/:id/review', ReviewController.handleCreateReview);

// 2. Route to handle deleting a review (receives both keys so we can redirect back to the product page)
router.post('/products/:productId/review/:reviewId/delete', ReviewController.handleDeleteReview);

// 3. Route to handle updating an existing review
router.post('/products/:productId/review/:reviewId/edit', ReviewController.handleUpdateReview);

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

// -- Employee dashboard routes -- //
router.get('/employee/dashboard', isEmployee, orderController.renderEmployeeDashboard);
router.post('/employee/dashboard/update', isEmployee, orderController.handleUpdateStatus);

// -- Admin dashboard routes -- //
router.get('/admin/dashboard', isAdmin, orderController.renderEmployeeDashboard);
router.post('/admin/dashboard/update', isAdmin, orderController.handleUpdateStatus);

// -- Product administrative edits -- //
router.post('/products/:id/edit', productController.handleUpdateProduct);

// -- Secure User Directory Administration Infrastructure -- //
router.get('/admin/users', isAdmin, renderManageUsers);
router.post('/admin/users/:id/delete', isAdmin, handleDeleteUser);

// -- Admin Employee Registration -- //
router.get('/admin/employees', isAdmin, renderRegisterEmployee);
router.post('/admin/employees', isAdmin, handleRegisterEmployee);

// -- Secure Catalog Administration Infrastructure -- //
router.post('/admin/products/:id/edit-description', isAdmin, handleUpdateDescription);

// -- Admin Product Catalog Management (Create / Delete) -- //
router.get('/admin/products', isAdmin, productController.renderManageProducts);
router.post('/admin/products', isAdmin, productController.handleCreateProduct);
router.post('/admin/products/:id/delete', isAdmin, productController.handleDeleteProduct);

export default router;