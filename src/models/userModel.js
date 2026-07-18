import pool from '../config/db.js';

/**
 * Fetch a user profile from the database by their unique email address
 * RESTORED: Crucial routine used by your authentication system for logins
 */
export const getUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1;';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
};

/**
 * Fetch all internal staff and consumer accounts across the database cluster
 */
export const getAllUsers = async () => {
    const query = 'SELECT id, name, email, role FROM users ORDER BY role ASC, name ASC;';
    const { rows } = await pool.query(query);
    return rows;
};

/**
 * Permanently drops a user account.
 * Thanks to your schema's native 'ON DELETE CASCADE' rules, PostgreSQL
 * automatically purges all matching reviews, orders, and active carts instantly!
 */
export const deleteUserById = async (userId) => {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id;';
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
};