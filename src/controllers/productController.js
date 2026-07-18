import * as ProductModel from '../models/productModel.js';
import * as ReviewModel from '../models/reviewModel.js';

/**
 * Controller to handle rendering the homepage catalog layout
 */
export const renderCatalog = async (req, res, next) => {
    try {
        // 1. Fetch real, live data from the school server using our model
        const products = await ProductModel.getAllProducts();
        
        // 2. Render our index template, passing the database records into the view
        res.render('pages/index', { products });
    } catch (error) {
        // Instead of a raw text send, hand this query error off to the global safety net
        next(error);
    }
};

/**
 * Controller to handle rendering a single product detail page
 */
export const renderProductDetail = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id, 10);
        
        // Safety check: If the ID isn't a valid number, hand it over to the custom error page layout
        if (isNaN(productId)) {
            const err = new Error('Invalid Product ID configuration format.');
            err.statusCode = 404; // Set status to Not Found
            return next(err);     // Pushes the error down into errorMiddleware.js
        }

        // 1. Fetch just that single item using our secure model query
        const product = await ProductModel.getProductById(productId);

        // If the product doesn't exist in our school database, hand it over as a 404
        if (!product) {
            const err = new Error('Product not found in our hardware vault.');
            err.statusCode = 404;
            return next(err);     // Triggers your custom 404 error page layout
        }

        // 2. Fetch all reviews associated with this product
        const reviews = await ReviewModel.getReviewsByProductId(productId);

        // 3. Render the detail page template, passing product data, reviews, and session user
        res.render('pages/product-detail', { 
            product, 
            reviews,
            user: req.session.user || null // Safely pass the session user to toggle Edit/Delete buttons
        });
    } catch (error) {
        // Bubble up unexpected server/database runtime errors
        next(error);
    }
};

/**
 * Controller to handle secure administrative product modifications
 */
export const handleUpdateProduct = async (req, res, next) => {
    const productId = parseInt(req.params.id, 10);
    const { name, price, stock_quantity } = req.body;

    // Strict authorization guard: Only allow users authenticated with the explicit 'admin' role
    if (!req.session.user || req.session.user.role !== 'admin') {
        const err = new Error('Clearance Denied: System Administrator credentials required to alter catalog parameters.');
        err.statusCode = 403; // Forbidden
        return next(err);
    }

    try {
        // Execute the secure update function via our product model
        await ProductModel.updateProductDetails(productId, name, parseFloat(price), parseInt(stock_quantity, 10));
        
        // Refresh the view workspace to instantly display the newly altered vectors
        res.redirect(`/products/${productId}`);
    } catch (error) {
        // Hand off unexpected runtime or structural database errors to global middleware
        next(error);
    }
};

/**
 * Action handler to process product description modifications
 */
export const handleUpdateDescription = async (req, res, next) => {
    const productId = parseInt(req.params.id, 10);
    const { description } = req.body;

    try {
        // Validation Guard: Ensure descriptions aren't just empty whitespace
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

        // Redirect back to the admin dashboard panel workspace
        //res.redirect('/admin/dashboard');
        // Change this line inside your handleUpdateDescription function:
res.redirect(`/products/${productId}`);
    } catch (error) {
        next(error);
    }
};