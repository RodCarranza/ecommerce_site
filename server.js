// server.js
import './src/config/db.js';
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server successfully launched on: http://localhost:${PORT}`);
});