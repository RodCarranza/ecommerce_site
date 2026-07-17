import * as ReviewModel from '../models/reviewModel.js';

/**
 * Handle POST request to submit a new review
 */
export const handleCreateReview = async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    const { rating, comment } = req.body;

    // Safety checks
    if (!req.session.user) {
        return res.status(401).send('Unauthorized. You must be logged in to leave a review.');
    }

    const userId = req.session.user.id;
    const numericRating = parseInt(rating, 10);

    try {
        if (!comment || isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).send('Invalid rating value or blank review text.');
        }

        // Save to database using parameterized query
        await ReviewModel.createReview(productId, userId, numericRating, comment);

        // Redirect back to the product details page to see the new review instantly!
        res.redirect(`/products/${productId}`);
    } catch (error) {
        console.error('Create Review Error:', error.message);
        res.status(500).send('Server error encountered while posting your review.');
    }
};

/**
 * Handle POST request to delete a review (guarded by authorization check)
 */
export const handleDeleteReview = async (req, res) => {
    const productId = parseInt(req.params.productId, 10);
    const reviewId = parseInt(req.params.reviewId, 10);

    // 1. Session check
    if (!req.session.user) {
        return res.status(401).send('Unauthorized. You must log in to delete reviews.');
    }

    const userId = req.session.user.id;
    const isAdmin = req.session.user.role === 'admin';

    try {
        // 2. Attempt deletion (the model internally enforces authorization: only admin or the creator can delete)
        const deletedReview = await ReviewModel.deleteReview(reviewId, userId, isAdmin);

        if (!deletedReview) {
            return res.status(403).send('Unauthorized operation. You cannot delete reviews belonging to other users.');
        }

        // Redirect back to the product page
        res.redirect(`/products/${productId}`);
    } catch (error) {
        console.error('Delete Review Error:', error.message);
        res.status(500).send('Server error encountered while attempting to delete this review.');
    }
};

/**
 * Handle POST request to update an existing review
 */
export const handleUpdateReview = async (req, res) => {
    const productId = parseInt(req.params.productId, 10);
    const reviewId = parseInt(req.params.reviewId, 10);
    const { rating, comment } = req.body;

    // 1. Authorization check
    if (!req.session.user) {
        return res.status(401).send('Unauthorized. You must be logged in to modify reviews.');
    }

    const userId = req.session.user.id;
    const numericRating = parseInt(rating, 10);

    try {
        if (!comment || isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).send('Invalid modifications. Review text cannot be blank.');
        }

        // 2. Execute the update through the model (which secures updates via WHERE user_id)
        const updatedReview = await ReviewModel.updateReview(reviewId, userId, numericRating, comment);

        if (!updatedReview) {
            return res.status(403).send('Unauthorized operation. You can only edit your own reviews.');
        }

        // 3. Smooth redirect back to see the updated comment
        res.redirect(`/products/${productId}`);
    } catch (error) {
        console.error('Update Review Error:', error.message);
        res.status(500).send('Server error encountered while updating your review.');
    }
};