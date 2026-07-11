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