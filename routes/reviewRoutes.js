const express = require('express');
const router = express.Router({ mergeParams: true });

const { validateReview, checkLogin, checkReviewAuthor } = require('../middleware');
const reviewController = require('../controllers/reviewController');

// REVIEW ROUTES
router.post('/', checkLogin, validateReview, reviewController.createReview);

router.delete('/:reviewId', checkLogin, checkReviewAuthor, reviewController.deleteReview);

module.exports = router;