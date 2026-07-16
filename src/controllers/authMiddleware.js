/**
 * Middleware to restrict route access to administrators only
 */
export const isAdmin = (req, res, next) => {
    // 1. Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // 2. Check if user's role matches 'admin' exactly
    if (req.session.user.role === 'admin') {
        return next(); // Authorized! Proceed to the route.
    }

    // 3. Deny entry to regular users
    return res.status(403).send('Access Denied: You do not have permission to access the Admin Control Panel.');
};