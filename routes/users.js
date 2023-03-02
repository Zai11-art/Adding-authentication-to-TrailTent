const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');
const localStrategy = require('passport-local');

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const {email, username, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) {
                return next();
            }
            req.flash('success', 'Welcome to TrailTent');
            res.redirect('/campgrounds');
        })
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

// route for logging in the registered credentials
// one thing to note is that 
router.post('/login',passport.authenticate('local', { 
        failureFlash: true, 
        failureRedirect: '/login',
        failureMessage: true,
        keepSessionInfo: true
    }), 
    (req, res) => {
        req.flash('success', 'Welcome back!');
        const redirectUrl = req.session.returnTo || '/campgrounds';
        delete req.session.returnTo
        res.redirect(redirectUrl)
})

router.get('/logout', (req, res, next) => {
    req.logout(function(err){
        if  (err) {
            return next(err);
        }
        req.flash('success', 'Logged Out Successfuly');
        res.redirect('/campgrounds');
    });
});

module.exports = router;