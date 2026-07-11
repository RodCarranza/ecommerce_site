import pool from '../config/db.js';
import bcrypt from 'bcrypt';

/**
 * Creates a brand new secure user account in the database.
 */
export const createUser = async (name, email, plainTextPassword) => {
    // Generate a salt and hash the password (10 rounds is standard industry balance of security/speed)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainTextPassword, saltRounds);

    const queryText = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at;
    `;
    const values = [name, email, passwordHash];
    
    const { rows } = await pool.query(queryText, values);
    return rows[0]; // Returns the new user data (excluding the sensitive hash)
};

/**
 * Finds a user by their email address (Used during Login check).
 */
export const getUserByEmail = async (email) => {
    const queryText = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(queryText, [email]);
    return rows[0] || null;
};