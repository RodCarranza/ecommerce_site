/**
 * Middleware to restrict route access to employees only
 */
export const isEmployee = (req, res, next) => {
    // 1. Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // Allow access if the user is an 'employee' OR an 'admin'
    if (req.session.user && (req.session.user.role === 'employee' || req.session.user.role === 'admin')) {
        return next(); // Pass clearance check and proceed to the dashboard controller
    }

    // 3. Deny entry to regular users
    return res.status(403).send('Access Denied: You do not have permission to access the Admin Control Panel.');
};

/**
 * Middleware strictly for System Administrators
 */
export const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next(); // Pass verification check
    }
    const err = new Error('Access denied. You need higher-level permissions to access this vector.');
    err.statusCode = 403; // Forbidden
    return next(err);
};