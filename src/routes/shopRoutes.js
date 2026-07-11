import express from 'express';
import * as productController from '../controllers/productController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// -- Product routes -- //

// Route for the main storefront catalog home
router.get('/', productController.renderCatalog);
// Route for product by id
router.get('/products/:id', productController.renderProductDetail);

// Authentication Routes
router.get('/register', authController.renderRegister);
router.post('/register', authController.handleRegister);

export default router;