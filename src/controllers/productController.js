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

/**
 * Renders the admin product management page: existing catalog plus a create form
 */
export const renderManageProducts = async (req, res, next) => {
    // Strict authorization guard
    if (!req.session.user || req.session.user.role !== 'admin') {
        const err = new Error('Clearance Denied: System Administrator credentials required.');
        err.statusCode = 403;
        return next(err);
    }

    try {
        const products = await ProductModel.getAllProducts();
        res.render('pages/manage-products', { products, error: null });
    } catch (error) {
        next(error);
    }
};

/**
 * Handles creating a brand new product from the admin form
 */
export const handleCreateProduct = async (req, res, next) => {
    // Strict authorization guard
    if (!req.session.user || req.session.user.role !== 'admin') {
        const err = new Error('Clearance Denied: System Administrator credentials required.');
        err.statusCode = 403;
        return next(err);
    }

    const { name, description, price, stock_quantity, image_url } = req.body;
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock_quantity, 10);

    try {
        // Validation: name and a valid non-negative price are required
        if (!name || name.trim() === '' || isNaN(parsedPrice) || parsedPrice < 0) {
            const products = await ProductModel.getAllProducts();
            return res.render('pages/manage-products', {
                products,
                error: 'Product name and a valid non-negative price are required.'
            });
        }

        await ProductModel.createProduct({
            name: name.trim(),
            description: description ? description.trim() : null,
            price: parsedPrice,
            stock_quantity: isNaN(parsedStock) || parsedStock < 0 ? 0 : parsedStock,
            image_url: image_url && image_url.trim() !== '' ? image_url.trim() : undefined
        });

        res.redirect('/admin/products');
    } catch (error) {
        next(error);
    }
};

/**
 * Handles permanently deleting a product from the catalog
 */
export const handleDeleteProduct = async (req, res, next) => {
    // Strict authorization guard
    if (!req.session.user || req.session.user.role !== 'admin') {
        const err = new Error('Clearance Denied: System Administrator credentials required.');
        err.statusCode = 403;
        return next(err);
    }

    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
        const err = new Error('Invalid Product ID configuration format.');
        err.statusCode = 400;
        return next(err);
    }

    try {
        const deleted = await ProductModel.deleteProductById(productId);

        if (!deleted) {
            const err = new Error('Catalog Error: The requested item record could not be found inside the cluster.');
            err.statusCode = 404;
            return next(err);
        }

        res.redirect('/admin/products');
    } catch (error) {
        next(error);
    }
};