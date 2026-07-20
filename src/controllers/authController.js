import * as UserModel from '../models/userModel.js';
import bcrypt from 'bcrypt';

export const renderRegister = (req, res) => {
    res.render('pages/register', { error: null });
};

export const handleRegister = async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
        // Validation: Blank fields check
        if (!username || !email || !password) {
            return res.render('pages/register', { error: 'All fields are required.' });
        }

        // Validation: Existing user check
        const existingUser = await UserModel.getUserByEmail(email);
        if (existingUser) {
            return res.render('pages/register', { error: 'Email is already registered.' });
        }

        // Save new user safely with hashed password
        await UserModel.createUser(username, email, password);
        
        // Redirect to login with a query parameter
        res.redirect('/login?registered=true');
    } catch (error) {
        // Forward unexpected DB/hashing crashes to global error handler
        next(error);
    }
};

export const renderLogin = (req, res) => {
    const successMessage = req.query.registered === 'true' 
        ? 'Account created successfully! You can now log in.' 
        : null;

    res.render('pages/login', { error: null, success: successMessage });
};

export const handleLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        // Validation checks
        if (!email || !password) {
            return res.render('pages/login', { error: 'All fields are required.', success: null });
        }

        const user = await UserModel.getUserByEmail(email);
        if (!user) {
            return res.render('pages/login', { error: 'Invalid email or password combination.', success: null });
        }

        const match = await bcrypt.compare(password, user.password); 
        if (!match) {
            return res.render('pages/login', { error: 'Invalid email or password combination.', success: null });
        }

        // Session creation
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.redirect('/');
    } catch (error) {
        // Forward genuine server/DB crashes to global error handler
        next(error);
    }
};

export const handleLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            // Forward session destruction failures to global error handler
            return next(err);
        }
        res.clearCookie('connect.sid'); // Ensure browser cookie clearance
        res.redirect('/');
    });
};