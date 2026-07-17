import pool from '../config/db.js';

/**
 * Fetch all reviews for a specific product, including the reviewer's name
 */
export const getReviewsByProductId = async (productId) => {
    const queryText = `
        SELECT r.id, r.rating, r.comment, r.created_at, r.user_id, u.name AS reviewer_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC;
    `;
    const { rows } = await pool.query(queryText, [productId]);
    return rows;
};

/**
 * Add a brand new product review
 */
export const createReview = async (productId, userId, rating, comment) => {
    const queryText = `
        INSERT INTO reviews (product_id, user_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const { rows } = await pool.query(queryText, [productId, userId, rating, comment.trim()]);
    return rows[0];
};

/**
 * Update an existing review (ensures the user updating it is the original author)
 */
export const updateReview = async (reviewId, userId, rating, comment) => {
    const queryText = `
        UPDATE reviews
        SET rating = $1, comment = $2, created_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND user_id = $4
        RETURNING *;
    `;
    const { rows } = await pool.query(queryText, [rating, comment.trim(), reviewId, userId]);
    return rows[0];
};

/**
 * Delete a review (ensures the user deleting it is the author or an admin)
 */
export const deleteReview = async (reviewId, userId, isEmployee) => {
    let queryText;
    let params;

    if (isEmployee) {
        // Admins can delete any review
        queryText = `DELETE FROM reviews WHERE id = $1 RETURNING *;`;
        params = [reviewId];
    } else {
        // Regular users can only delete their own
        queryText = `DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *;`;
        params = [reviewId, userId];
    }

    const { rows } = await pool.query(queryText, params);
    return rows[0];
};