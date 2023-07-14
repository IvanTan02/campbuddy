const express = require('express');
const router = express.Router({ mergeParams: true });
const passport = require('passport');

const { storeReturnTo } = require('../middleware');
const userController = require('../controllers/userController');

// USER ROUTES
router.route('/register')
    .get(userController.renderRegisterForm)
    .post(userController.registerUser)

router.route('/login')
    .get(userController.renderLoginForm)
    .post(storeReturnTo,
        passport.authenticate('local',
            {
                failureFlash: true,
                failureRedirect: '/login'
            }
        ),
        userController.loginUser);

router.get('/logout', userController.logoutUser);

module.exports = router;