import * as ReviewModel from '../models/reviewModel.js';

/**
 * Handle POST request to submit a new review
 */
export const handleCreateReview = async (req, res, next) => {
    const productId = parseInt(req.params.id, 10);
    const { rating, comment } = req.body;

    // 1. Session check
    if (!req.session.user) {
        const err = new Error('Access denied. You must be authenticated to post feedback.');
        err.statusCode = 401; // Unauthorized
        return next(err);
    }

    // 🛑 NEW ACCESSIBILITY GUARD UPGRADE: Block BOTH employees and admins from submitting reviews
    if (req.session.user.role === 'employee' || req.session.user.role === 'admin') {
        const err = new Error('Clearance Restriction: Internal staff accounts are unauthorized to submit public storefront catalog feedback.');
        err.statusCode = 403; // Forbidden
        return next(err);
    }

    const userId = req.session.user.id;
    const numericRating = parseInt(rating, 10);

    try {
        // 2. Input validation: reject blank comments (after sanitization stripped any tags)
        if (!comment || comment.trim() === '' || isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            const err = new Error('Invalid submissions detected. Reviews must contain clean, non-empty text and a rating from 1-5.');
            err.statusCode = 400; // Bad Request
            return next(err);
        }

        // Save sanitized review in the database
        await ReviewModel.createReview(productId, userId, numericRating, comment);

        res.redirect(`/products/${productId}`);
    } catch (error) {
        next(error); // Pipe unexpected DB errors to the centralized handler
    }
};

/**
 * Handle POST request to update an existing review
 */
export const handleUpdateReview = async (req, res, next) => {
    const productId = parseInt(req.params.productId, 10);
    const reviewId = parseInt(req.params.reviewId, 10);
    const { rating, comment } = req.body;

    // 1. Session check
    if (!req.session.user) {
        const err = new Error('Access denied. Log in to modify feedback records.');
        err.statusCode = 401;
        return next(err);
    }

    const userId = req.session.user.id;
    const numericRating = parseInt(rating, 10);

    try {
        // 2. Input validation
        if (!comment || comment.trim() === '' || isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            const err = new Error('Modifications rejected. Review updates cannot be left blank.');
            err.statusCode = 400;
            return next(err);
        }

        // 3. Update database query
        const updatedReview = await ReviewModel.updateReview(reviewId, userId, numericRating, comment);

        if (!updatedReview) {
            const err = new Error('Unauthorized operational clearance. You do not own this review.');
            err.statusCode = 403; // Forbidden
            return next(err);
        }

        res.redirect(`/products/${productId}`);
    } catch (error) {
        next(error);
    }
};

/**
 * Handle POST request to delete a review
 */
export const handleDeleteReview = async (req, res, next) => {
    const productId = parseInt(req.params.productId, 10);
    const reviewId = parseInt(req.params.reviewId, 10);

    if (!req.session.user) {
        const err = new Error('Access denied. Log in to remove feedback records.');
        err.statusCode = 401;
        return next(err);
    }

    const userId = req.session.user.id;
    
    // 🌟 FIX: Named this variable 'isEmployee' so it perfectly matches what 
    // is passed to your ReviewModel query on the line below, stopping the 500 error!
    const isEmployee = req.session.user.role === 'employee' || req.session.user.role === 'admin';
    
    try {
        const deletedReview = await ReviewModel.deleteReview(reviewId, userId, isEmployee);

        if (!deletedReview) {
            const err = new Error('Unauthorized clearance. You are not permitted to remove this record.');
            err.statusCode = 403;
            return next(err);
        }

        res.redirect(`/products/${productId}`);
    } catch (error) {
        next(error);
    }
};