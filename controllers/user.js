const User = require('../models/user');
const passport = require('passport');

module.exports.renderSignupForm = (req, res) => {
    res.render('users/signup.ejs');
};

module.exports.signup = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Wanderlust!');
            res.redirect('/listings');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login.ejs');
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect(res.locals.redirectUrl || '/listings');
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        if (!req.user) req.flash('success', 'You have successfully logged out!');
        res.redirect('/listings');
    });
};