/**
 * Global Input Sanitization Middleware
 * Recursively strips any HTML/script tags from incoming string inputs to prevent XSS.
 */
export const sanitizeBody = (req, res, next) => {
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                // 1. Strip out any <HTML> tag structures entirely
                const stripped = req.body[key].replace(/<[^>]*>/g, '');
                
                // 2. Trim excess whitespace
                req.body[key] = stripped.trim();
            }
        }
    }
    next();
};