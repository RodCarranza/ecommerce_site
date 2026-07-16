import pool from '../config/db.js';

/**
 * Helper function to find or create an active 'cart' order for the user
 */
const getOrCreateActiveCartOrder = async (userId) => {
    // 1. Look for an existing order with status 'cart'
    const findQuery = `
        SELECT id FROM orders 
        WHERE user_id = $1 AND status = 'cart'
        LIMIT 1;
    `;
    const { rows } = await pool.query(findQuery, [userId]);

    if (rows.length > 0) {
        return rows[0].id;
    }

    // 2. If none exists, create a new order with status 'cart'
    const createQuery = `
        INSERT INTO orders (user_id, status)
        VALUES ($1, 'cart')
        RETURNING id;
    `;
    const result = await pool.query(createQuery, [userId]);
    return result.rows[0].id;
};

/**
 * Adds an item to the user's active cart order (or updates quantity in order_items)
 */
export const addItemToCart = async (userId, productId, quantity) => {
    // Get the active cart order ID
    const orderId = await getOrCreateActiveCartOrder(userId);

    // Check if product is already in this cart order
    const checkQuery = `
        SELECT id, quantity FROM order_items 
        WHERE order_id = $1 AND product_id = $2;
    `;
    const { rows } = await pool.query(checkQuery, [orderId, productId]);

    // Fetch the product price to store it in price_at_purchase
    const priceQuery = `SELECT price FROM products WHERE id = $1;`;
    const productRes = await pool.query(priceQuery, [productId]);
    const priceAtPurchase = productRes.rows[0].price;

    if (rows.length > 0) {
        // Item exists, let's update the quantity
        const newQuantity = rows[0].quantity + parseInt(quantity, 10);
        const updateQuery = `
            UPDATE order_items 
            SET quantity = $1, price_at_purchase = $2
            WHERE id = $3
            RETURNING *;
        `;
        const result = await pool.query(updateQuery, [newQuantity, priceAtPurchase, rows[0].id]);
        return result.rows[0];
    } else {
        // Item doesn't exist, insert new item into order_items
        const insertQuery = `
            INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await pool.query(insertQuery, [orderId, productId, quantity, priceAtPurchase]);
        return result.rows[0];
    }
};

/**
 * Gets all items in a user's active cart order, joining with products
 */
export const getCartByUserId = async (userId) => {
    const queryText = `
        SELECT oi.id AS cart_item_id, oi.quantity, p.id AS product_id, p.name, p.price, p.image_url 
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = $1 AND o.status = 'cart';
    `;
    const { rows } = await pool.query(queryText, [userId]);
    return rows;
};

/**
 * Removes a single item entirely from the order_items table
 */
export const removeCartItem = async (orderItemId, userId) => {
    // Ensuring the user owns the order that this item belongs to
    const queryText = `
        DELETE FROM order_items 
        WHERE id = $1 AND order_id IN (
            SELECT id FROM orders WHERE user_id = $2 AND status = 'cart'
        );
    `;
    await pool.query(queryText, [orderItemId, userId]);
};