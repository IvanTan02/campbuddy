const Campground = require('../models/campground');
const AsyncError = require('../utilities/AsyncError');
const { cloudinary } = require('../cloudinary');

const mapboxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mapboxGeoCoding({ accessToken: mapboxToken });

module.exports.index = AsyncError(async (req, res) => {
    const campgrounds = await Campground.find({}).populate('reviews');
    for (let campground of campgrounds) {
        campground.campRating = -1;
        if (campground.reviews.length > 0) {
            let sum = 0;
            for (let review of campground.reviews) {
                sum += review.rating;
            }
            campground.campRating = (sum / campground.reviews.length).toFixed(2);
        }
    }
    const renderInTriplets = Math.floor(campgrounds.length / 3) * 3;
    const remainingCampgrounds = campgrounds.length - renderInTriplets;
    res.render('campgrounds/index', { campgrounds, renderInTriplets, remainingCampgrounds });
})

module.exports.searchCampground = AsyncError(async (req, res) => {
    const searchTerm = req.query.query;
    let searchQuery = {};
    if (searchTerm) searchQuery = { name: { $regex: searchTerm, $options: 'i' } };
    const campgrounds = await Campground.find(searchQuery).populate('reviews')
    for (let campground of campgrounds) {
        campground.campRating = -1;
        if (campground.reviews.length > 0) {
            let sum = 0;
            for (let review of campground.reviews) {
                sum += review.rating;
            }
            campground.campRating = (sum / campground.reviews.length).toFixed(2);
        }
    }
    const renderInTriplets = Math.floor(campgrounds.length / 3) * 3;
    const remainingCampgrounds = campgrounds.length - renderInTriplets;
    return res.render('partials/searchResults', { campgrounds, renderInTriplets, remainingCampgrounds });
})

module.exports.renderCreateForm = (req, res) => {
    res.render('campgrounds/create');
}

module.exports.renderEditForm = AsyncError(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const renderInThrees = Math.floor(campground.images.length / 3) * 3;
    const remainingImages = campground.images.length - renderInThrees;
    if (!campground) {
        req.flash('error', 'Sorry, unable to find that campground.');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground, renderInThrees, remainingImages });
})

module.exports.createNewCampground = AsyncError(async (req, res) => {
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geodata.body.features[0].geometry;
    if (req.files.length !== 0) {
        campground.images = req.files.map(f => ({
            url: f.path,
            filename: f.filename
        }))
    } else {
        const defaultImg = {
            url: 'https://res.cloudinary.com/dcyyue73r/image/upload/v1689215953/CampBuddy/campgrounds/no-image-available_aeerfl.webp',
            filename: 'CampBuddy/campgrounds/no-image-available_aeerfl'
        }
        campground.images.push(defaultImg);
    }
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully created a new campground.')
    res.redirect(`/campgrounds/${campground._id}`);
})

module.exports.showCampground = AsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (campground.reviews.length > 0) {
        let sum = 0;
        for (let review of campground.reviews) {
            sum += review.rating;
        }
        campground.campRating = (sum / campground.reviews.length).toFixed(2);
    } else {
        campground.campRating = -1;
    }
    const renderInTwos = Math.floor(campground.reviews.length / 2) * 2;
    const remainingReview = campground.reviews.length - renderInTwos;
    if (!campground) {
        req.flash('error', 'Sorry, unable to find that campground.');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/details', { campground, renderInTwos, remainingReview });
})

module.exports.updateCampground = AsyncError(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    campground.images.push(...images);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    await campground.save();
    const updatedCamp = await Campground.findById(id);
    if (updatedCamp.images.length === 0) {
        const defaultImg = {
            url: 'https://res.cloudinary.com/dcyyue73r/image/upload/v1689215953/CampBuddy/campgrounds/no-image-available_aeerfl.webp',
            filename: 'CampBuddy/campgrounds/no-image-available_aeerfl'
        }
        updatedCamp.images.push(defaultImg);
        await updatedCamp.save();
    }
    req.flash('success', 'Successfully updated the campground.')
    res.redirect(`/campgrounds/${id}`);
})

module.exports.deleteCampground = AsyncError(async (req, res) => {
    const { images } = await Campground.findByIdAndDelete(req.params.id);
    for (let image of images) {
        cloudinary.uploader.destroy(image.filename);
    }
    req.flash('success', 'Successfully deleted the campground.')
    res.redirect('/campgrounds');
})
