import * as ProductModel from '../models/productModel.js';
import * as ReviewModel from '../models/reviewModel.js';

/**
 * Controller to handle rendering the homepage catalog layout
 */
export const renderCatalog = async (req, res) => {
    try {
        // 1. Fetch real, live data from the school server using our model
        const products = await ProductModel.getAllProducts();
        
        // 2. Render our index template, passing the database records into the view
        res.render('pages/index', { products });
    } catch (error) {
        console.error('Controller Error fetching catalog:', error.message);
        res.status(500).send('Server Error loading the product catalog.');
    }
};

/**
 * Controller to handle rendering a single product detail page
 */
export const renderProductDetail = async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        
        // Safety check: If the ID isn't a valid number, trigger a clean 404
        if (isNaN(productId)) {
            return res.status(404).send('Invalid Product ID configuration.');
        }

        // 1. Fetch just that single item using our secure model query
        const product = await ProductModel.getProductById(productId);

        // If the product doesn't exist in our school database, throw a 404
        if (!product) {
            return res.status(404).send('Product not found in our hardware vault.');
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
        console.error('Controller Error fetching product details:', error.message);
        res.status(500).send('Server Error loading product details.');
    }
};