/**
 * Global Error Handler Middleware
 * Catch-all safety net for any uncaught backend errors (500 errors)
 */
export const globalErrorHandler = (err, req, res, next) => {
    // 1. Log the entire error with stack trace inside terminal for developer eyes only
    console.error(' [CENTRALIZED ERROR HANDLER]:', err.stack || err.message);

    // 2. Hide specific system error messages from standard users in production
    const isProduction = process.env.NODE_ENV === 'production';
    const cleanMessage = isProduction 
        ? 'An internal server anomaly occurred. Our engineers have been alerted.' 
        : err.message || 'An unexpected system error occurred.';

    // 3. Render our customized error page
    res.status(err.statusCode || 500).render('pages/error', {
        statusCode: err.statusCode || 500,
        message: cleanMessage
    });
};

/**
 * Catch-All 404 (Route Not Found) Middleware
 */
export const handleNotFound = (req, res, next) => {
    res.status(404).render('pages/error', {
        statusCode: 404,
        message: `Resource not located: We couldn't find '${req.originalUrl}' in our hardware vault.`
    });
};