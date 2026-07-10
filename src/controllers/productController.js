import * as ProductModel from '../models/productModel.js';

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