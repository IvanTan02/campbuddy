const Campground = require('../models/campground');
const Review = require('../models/review');

const AsyncError = require('../utilities/AsyncError');

module.exports.createReview = AsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    const existingReview = campground.reviews.find(review => review.author.equals(req.user._id));
    if (existingReview) {
        req.flash('error', 'You have already left a review.')
        res.redirect(`/campgrounds/${campground._id}`);
    } else {
        const review = new Review(req.body.review);
        review.author = req.user._id;
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        req.flash('success', 'Successfully added your review.')
        res.redirect(`/campgrounds/${campground._id}`);
    }

})

module.exports.deleteReview = AsyncError(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted your review.')
    res.redirect(`/campgrounds/${id}`);
});