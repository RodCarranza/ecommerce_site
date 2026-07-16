import pool from '../config/db.js';

/**
 * Places an order using a secure database transaction
 */
export const placeOrder = async (userId, shippingAddress) => {
    // Acquire a single client from the pool for our transaction
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Start Transaction

        // 1. Find the user's active 'cart' order
        const cartQuery = `
            SELECT id FROM orders 
            WHERE user_id = $1 AND status = 'cart'
            LIMIT 1;
        `;
        const cartRes = await client.query(cartQuery, [userId]);
        if (cartRes.rows.length === 0) {
            throw new Error('Your shopping cart is empty.');
        }
        const orderId = cartRes.rows[0].id;

        // 2. Fetch all items in this cart order to verify stock and calculate total
        const itemsQuery = `
            SELECT oi.id, oi.product_id, oi.quantity, p.name, p.stock_quantity, p.price
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1;
        `;
        const itemsRes = await client.query(itemsQuery, [orderId]);
        const items = itemsRes.rows;

        if (items.length === 0) {
            throw new Error('Your cart has no products to buy.');
        }

        let calculatedTotal = 0;

        // 3. Loop through each item, verify stock, update inventory
        for (const item of items) {
            if (item.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for ${item.name}. Only ${item.stock_quantity} remaining.`);
            }

            // Decrement the stock of the product
            const updateStockQuery = `
                UPDATE products 
                SET stock_quantity = stock_quantity - $1 
                WHERE id = $2;
            `;
            await client.query(updateStockQuery, [item.quantity, item.product_id]);

            // Track purchase price total
            calculatedTotal += parseFloat(item.price) * item.quantity;
        }

        // 4. Update the order table to place the order
        const placeOrderQuery = `
            UPDATE orders 
            SET status = 'placed', 
                shipping_address = $1, 
                total_price = $2, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *;
        `;
        const finalOrderRes = await client.query(placeOrderQuery, [shippingAddress, calculatedTotal, orderId]);

        await client.query('COMMIT'); // Success! Save all changes
        return finalOrderRes.rows[0];

    } catch (error) {
        await client.query('ROLLBACK'); // Failure! Undo everything
        throw error;
    } finally {
        client.release(); // Return the pool connection
    }
};

/**
 * Fetches all past (placed, processing, completed, etc.) orders for a user
 */
export const getOrdersByUserId = async (userId) => {
    const queryText = `
        SELECT id, status, shipping_address, total_price, created_at 
        FROM orders 
        WHERE user_id = $1 AND status != 'cart'
        ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(queryText, [userId]);
    return rows;
};

/**
 * Fetches detailed items belonging to a specific order
 */
export const getOrderDetails = async (orderId, userId) => {
    const queryText = `
        SELECT oi.quantity, oi.price_at_purchase, p.name, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.order_id = $1 AND o.user_id = $2;
    `;
    const { rows } = await pool.query(queryText, [orderId, userId]);
    return rows;
};

/**
 * Fetches every single non-cart order in the system for admin monitoring
 */
export const getAllSystemOrders = async () => {
    const queryText = `
        SELECT o.id, o.status, o.shipping_address, o.total_price, o.created_at, u.name, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.status != 'cart'
        ORDER BY o.created_at DESC;
    `;
    const { rows } = await pool.query(queryText);
    return rows;
};

/**
 * Updates an order's status (e.g., 'placed' -> 'shipped')
 */
export const updateOrderStatus = async (orderId, newStatus) => {
    const queryText = `
        UPDATE orders 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
    `;
    const { rows } = await pool.query(queryText, [newStatus, orderId]);
    return rows[0];
};