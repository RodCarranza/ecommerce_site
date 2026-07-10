import express from 'express';
import * as productController from '../controllers/productController.js';

const router = express.Router();

// Route for the main storefront catalog home
router.get('/', productController.renderCatalog);

// Route product by id
router.get('/products/:id', productController.renderProductDetail);

export default router;