import express from 'express';
import * as productController from '../controllers/productController.js';

const router = express.Router();

// Route for the main storefront home catalog
router.get('/', productController.renderCatalog);

export default router;