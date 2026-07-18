import * as UserModel from '../models/userModel.js';

/**
 * Render the administrative access matrix dashboard
 */
export const renderManageUsers = async (req, res, next) => {
    try {
        const users = await UserModel.getAllUsers();
        
        // SAFETY GAP: Filter out the active admin's own ID from the dashboard list.
        // This prevents an administrator from accidentally clicking delete on themselves and getting locked out!
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
    
    try {
        await UserModel.deleteUserById(userId);
        
        // Smoothly return back to the refreshed administration deck
        res.redirect('/admin/users');
    } catch (error) {
        next(error);
    }
};