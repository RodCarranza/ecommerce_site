import pool from './src/config/db.js';

const mockProducts = [
    {
        name: 'Quantum Mechanical Keyboard',
        description: 'A premium clicky mechanical keyboard with customizable RGB backlighting and tactile blue switches.',
        price: 89.99,
        stock_quantity: 25,
        image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500'
    },
    {
        name: 'Ergonomic Wireless Mouse',
        description: 'Precision wireless mouse designed with a comfortable thumb rest, high DPI tracking, and long battery life.',
        price: 45.50,
        stock_quantity: 40,
        image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500'
    },
    {
        name: 'UltraWide 4K Monitor',
        description: '34-inch curved display offering stunning clarity, accurate color profiles, and a smooth 144Hz refresh rate.',
        price: 349.99,
        stock_quantity: 10,
        image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500'
    },
    {
        name: 'Noise-Canceling Headphones',
        description: 'Over-ear Bluetooth headphones with active noise cancellation, deep bass, and plush memory foam ear cups.',
        price: 120.00,
        stock_quantity: 15,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
    }
];

const seedDatabase = async () => {
    try {
        console.log('Starting database seeding process...');

        // Clean out any existing products to prevent massive duplicates if re-run
        await pool.query('TRUNCATE TABLE order_items, reviews, products CASCADE;');
        console.log('Old product data cleared safely.');

        for (const product of mockProducts) {
            const queryText = `
                INSERT INTO products (name, description, price, stock_quantity, image_url)
                VALUES ($1, $2, $3, $4, $5);
            `;
            const values = [product.name, product.description, product.price, product.stock_quantity, product.image_url];
            await pool.query(queryText, values);
            console.log(`Seeded product: ${product.name}`);
        }

        console.log('Seeding successfully completed!');
    } catch (error) {
        console.error('Error seeding database:', error.message);
    } finally {
        // Essential: End the pool connection so the terminal doesn't hang open
        await pool.end();
        process.exit(0);
    }
};

seedDatabase();