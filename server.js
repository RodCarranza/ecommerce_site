// server.js
import dotenv from 'dotenv';
dotenv.config(); // Execute immediately before importing files that need env variables!

import './src/config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server successfully launched on: http://localhost:${PORT}`);
});