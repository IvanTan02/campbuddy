const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./utilities/schemaValidation')
const ExpressError = require('./utilities/ExpressError')

// Check if user is logged in
module.exports.checkLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in to do that.');
        return res.redirect('/login');
    }
    next();
}

// Stores the user's intended destination URL for redirection
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// Verifies the campground's author
module.exports.checkCampgroundAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that.');
        return res.redirect(`/campgrounds/${campground._id}`);
    }
    next();
}

// Verifies the review's author
module.exports.checkReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// Validate all campground fields
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const message = error.details.map(element => element.message).join(',');
        throw new ExpressError(message, 400);
    } else {
        next();
    }
}

// Validate all review fields
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map(element => element.message).join(',');
        throw new ExpressError(message, 400);
    } else {
        next();
    }
}