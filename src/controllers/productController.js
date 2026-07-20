import * as ProductModel from '../models/productModel.js';
import * as ReviewModel from '../models/reviewModel.js';

/**
 * Controller to handle rendering the homepage catalog layout
 */
export const renderCatalog = async (req, res, next) => {
    try {
        const products = await ProductModel.getAllProducts();
        res.render('pages/index', { products });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to handle rendering a single product detail page
 */
export const renderProductDetail = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id, 10);
        
        // Safety check: Invalid ID format
        if (isNaN(productId)) {
            const err = new Error('Invalid Product ID configuration format.');
            err.statusCode = 404;
            return next(err);
        }

        const product = await ProductModel.getProductById(productId);

        if (!product) {
            const err = new Error('Product not found in our hardware vault.');
            err.statusCode = 404;
            return next(err);
        }

        const reviews = await ReviewModel.getReviewsByProductId(productId);

        res.render('pages/product-detail', { 
            product, 
            reviews,
            user: req.session.user || null 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller to handle secure administrative product modifications
 */
export const handleUpdateProduct = async (req, res, next) => {
    const productId = parseInt(req.params.id, 10);
    const { name, price, stock_quantity } = req.body;

    // Strict authorization guard
    if (!req.session.user || req.session.user.role !== 'admin') {
        const err = new Error('Clearance Denied: System Administrator credentials required to alter catalog parameters.');
        err.statusCode = 403;
        return next(err);
    }

    try {
        await ProductModel.updateProductDetails(productId, name, parseFloat(price), parseInt(stock_quantity, 10));
        res.redirect(`/products/${productId}`);
    } catch (error) {
        next(error);
    }
};

/**
 * Action handler to process product description modifications
 */
export const handleUpdateDescription = async (req, res, next) => {
    const productId = parseInt(req.params.id, 10);
    const { description } = req.body;

    // Strict authorization guard
    if (!req.session.user || req.session.user.role !== 'admin') {
        const err = new Error('Clearance Denied: System Administrator credentials required to alter product descriptions.');
        err.statusCode = 403;
        return next(err);
    }

    try {
        if (!description || description.trim() === '') {
            const err = new Error('Validation Error: Product description fields cannot be left blank.');
            err.statusCode = 400;
            return next(err);
        }

        const updatedProduct = await ProductModel.updateProductDescription(productId, description.trim());

        if (!updatedProduct) {
            const err = new Error('Catalog Error: The requested item record could not be found inside the cluster.');
            err.statusCode = 404;
            return next(err);
        }

        res.redirect(`/products/${productId}`);
    } catch (error) {
        next(error);
    }
};