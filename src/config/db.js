import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the connection immediately on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Failed to connect to the school PostgreSQL server:', err.message);
    } else {
        console.log('Successfully connected to BYU CSE PostgreSQL Server.');
    }
});

export default pool;