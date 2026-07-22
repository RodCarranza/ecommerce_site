// app.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import shopRoutes from './src/routes/shopRoutes.js';
import { sanitizeBody } from './src/middleware/sanitizeMiddleware.js';
import { handleNotFound, globalErrorHandler } from './src/middleware/errorMiddleware.js';

const app = express();

// Fix for ESM: Node doesn't give us __dirname by default anymore, so we calculate it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Setup View Engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// 2. Middleware Pipeline
app.use(express.static(path.join(__dirname, 'public'))); // Serves CSS/Images

// Parse incoming request bodies BEFORE sanitizing them
app.use(express.json());                               // Parses JSON data
app.use(express.urlencoded({ extended: true }));       // Parses form submissions

// Global Input Sanitizer (Intercepts req.body to strip toxic HTML/XSS payloads)
app.use(sanitizeBody);

// 3. Configure Secure Sessions 
app.use(session({
    secret: process.env.SESSION_SECRET, // In production, this would go in .env file
    resave: false,                             // Don't save session if unmodified
    saveUninitialized: false,                  // Don't create session until something is stored
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24,           // Cookie expires in 24 hours
        secure: true                          // Set to true only if using HTTPS (leave false for localhost)
    }
}));

// 4. Pass Session Data Globally to All EJS Views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; // Makes 'user' variable accessible in header/footer partials automatically
    next();
});

// Real Storefront Routes
app.use('/', shopRoutes);

// Catch-all 404 handler (matches anything that didn't hit a route above)
app.use(handleNotFound);

// Global Error Handler (MUST BE LAST so next(err) can fall into it)
app.use(globalErrorHandler);

export default app;
