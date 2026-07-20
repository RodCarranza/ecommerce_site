import * as UserModel from '../models/userModel.js';

/**
 * Render the administrative access matrix dashboard
 */
export const renderManageUsers = async (req, res, next) => {
    // 1. Strict Authorization Guard
    if (!req.session.user || req.session.user.role !== 'admin') {
        const err = new Error('Clearance Denied: System Administrator credentials required.');
        err.statusCode = 403;
        return next(err);
    }

    try {
        const users = await UserModel.getAllUsers();
        
        // Filter out the active admin's own ID from the dashboard list
        const otherUsers = users.filter(user => user.id !== req.session.user.id);
        
        res.render('pages/manage-users', { users: otherUsers });
    } catch (error) {
        next(error);
    }
};

/**
 * Action handler to process profile removal operations
 */
export const handleDeleteUser = async (req, res, next) => {
    const userId = parseInt(req.params.id, 10);

    // 1. Strict Authorization Guard
    if (!req.session.user || req.session.user.role !== 'admin') {
        const err = new Error('Clearance Denied: System Administrator credentials required.');
        err.statusCode = 403;
        return next(err);
    }

    // 2. ID Parameter Validation
    if (isNaN(userId)) {
        const err = new Error('Invalid User ID configuration format.');
        err.statusCode = 400;
        return next(err);
    }

    // 3. Backend Self-Deletion Guard
    if (userId === req.session.user.id) {
        const err = new Error('Operation Blocked: You cannot delete your own active administrator account.');
        err.statusCode = 400;
        return next(err);
    }

    try {
        await UserModel.deleteUserById(userId);
        
        res.redirect('/admin/users');
    } catch (error) {
        next(error);
    }
};