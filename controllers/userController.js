const User = require('../models/user');

const AsyncError = require('../utilities/AsyncError');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.registerUser = AsyncError(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', `Registration successful. Welcome to CampBuddy, ${username}!`);
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register');
    }
});

module.exports.loginUser = (req, res) => {
    const { username } = req.user;
    req.flash('success', `Welcome back, ${username}!`);
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash('success', 'Successfully logged you out. Goodbye!');
        res.redirect('/campgrounds');
    });
}

