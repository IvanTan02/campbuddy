// EXPRESS ROUTER
const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const { checkLogin, checkCampgroundAuthor, validateCampground } = require('../middleware');
const campgroundController = require('../controllers/campgroundController');

// CAMPGROUND ROUTES
router.route('/')
    .get(campgroundController.index)
    .post(
        checkLogin,
        upload.array('image'),
        validateCampground,
        campgroundController.createNewCampground
    )

router.get('/search', campgroundController.searchCampground);

router.get('/create', checkLogin, campgroundController.renderCreateForm);

router.route('/:id')
    .get(campgroundController.showCampground)
    .put(checkLogin, checkCampgroundAuthor, upload.array('image'), validateCampground, campgroundController.updateCampground)
    .delete(checkLogin, checkCampgroundAuthor, campgroundController.deleteCampground)

router.get('/:id/edit', checkLogin, checkCampgroundAuthor, campgroundController.renderEditForm);

module.exports = router;