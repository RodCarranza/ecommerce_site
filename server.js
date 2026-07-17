// server.js
import './src/config/db.js';
import app from './app.js';
import dotenv from 'dotenv';

// 1. Import the centralized error handlers
import { globalErrorHandler, handleNotFound } from './src/middleware/errorMiddleware.js';

dotenv.config();

// 2. Attach error handling middleware at the very end of the stack
app.use(handleNotFound);        // Catches unmatched GET/POST routes (404)
app.use(globalErrorHandler);    // Catch-all safety net for server/controller errors (500)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server successfully launched on: http://localhost:${PORT}`);
});