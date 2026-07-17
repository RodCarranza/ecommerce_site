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