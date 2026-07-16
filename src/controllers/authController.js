import * as UserModel from '../models/userModel.js';
import bcrypt from 'bcrypt';

export const renderRegister = (req, res) => {
    res.render('pages/register', { error: null });
};

export const handleRegister = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Basic check to make sure fields aren't blank
        if (!username || !email || !password) {
            return res.render('pages/register', { error: 'All fields are required.' });
        }

        // Check if user already exists
        const existingUser = await UserModel.getUserByEmail(email);
        if (existingUser) {
            return res.render('pages/register', { error: 'Email is already registered.' });
        }

        // Save new user safely with hashed password
        await UserModel.createUser(username, email, password);
        
        // Redirect to a placeholder login page (we will build this view tomorrow)
        res.send('Registration successful! Tomorrow we will wire this up to log you in.');
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).render('pages/register', { error: 'Server error during registration.' });
    }
};

export const renderLogin = (req, res) => {
    res.render('pages/login', { error: null });
};

export const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.render('pages/login', { error: 'All fields are required.' });
        }

        // 1. Look up user by email address
        const user = await UserModel.getUserByEmail(email);
        if (!user) {
            return res.render('pages/login', { error: 'Invalid email or password combination.' });
        }

        // 2. Compare incoming plain text password against the hashed string in your db
        const match = await bcrypt.compare(password, user.password); // Matches your schema's "password" columns

        if (!match) {
            return res.render('pages/login', { error: 'Invalid email or password combination.' });
        }

        // 3. Password matched! Save the user profile to session state memory
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        // 4. Redirect home to the catalog
        res.redirect('/');
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).render('pages/login', { error: 'Server error encountered during authentication.' });
    }
};

export const handleLogout = (req, res) => {
    // Destroy the server memory file and wipe the browser cookie
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout Error:', err.message);
        }
        res.redirect('/');
    });
};