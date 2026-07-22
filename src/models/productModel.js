import pool from '../config/db.js';

/**
 * Fetch all products from the database.
 */
export const getAllProducts = async () => {
    const queryText = 'SELECT * FROM products ORDER BY id ASC';
    const { rows } = await pool.query(queryText);
    return rows;
};

/**
 * Fetch a single product by its unique ID.
 * @param {number} id - The ID of the product
 */
export const getProductById = async (id) => {
    const queryText = 'SELECT * FROM products WHERE id = $1';
    // Parameterized input: 'id' is safely mapped to $1
    const { rows } = await pool.query(queryText, [id]);
    return rows[0] || null; // Return the product if found, otherwise null
};

/**
 * Insert a new product into the database (Used by Admins).
 */
export const createProduct = async ({ name, description, price, stock_quantity, image_url }) => {
    const queryText = `
        INSERT INTO products (name, description, price, stock_quantity, image_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [name, description, price, stock_quantity, image_url || '/images/default-product.jpg'];
    const { rows } = await pool.query(queryText, values);
    return rows[0];
};

/**
 * Update an existing product's parameters (Used by Admins).
 */
export const updateProductDetails = async (id, name, price, stockQuantity) => {
    const queryText = `
        UPDATE products 
        SET name = $1, price = $2, stock_quantity = $3 
        WHERE id = $4 
        RETURNING *;
    `;
    // Updated to use 'pool.query' and destructured the 'rows' array directly
    const { rows } = await pool.query(queryText, [name, price, stockQuantity, id]);
    return rows[0];
};

/**
 * Persist an updated description string to a specific product record
 */
export const updateProductDescription = async (productId, description) => {
    const query = 'UPDATE products SET description = $1 WHERE id = $2 RETURNING id;';
    const { rows } = await pool.query(query, [description, productId]);
    return rows[0];
};

/**
 * Permanently removes a product from the database (Used by Admins).
 * order_items.product_id uses ON DELETE SET NULL, so past orders that
 * included this product keep their sales history even after it's gone.
 */
export const deleteProductById = async (id) => {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING id;';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};