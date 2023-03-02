const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const {campgroundSchema} = require('../schemas.js');
const Campground = require('../models/campground');
const {isLoggedIn} = require('../utilities/middleware')

// this code is for checking campground validations
const validateCampGround = (req, res, next) => {
    // this line of code is the JOI which allows errors from objects
    const {error} = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// show the home page: index
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}));

// create a new campground: new
router.get('/new',isLoggedIn, (req,res) => {
    res.render('campgrounds/new')
});

// add a new campground: create
router.post('/', isLoggedIn, validateCampGround, catchAsync(async (req,res,next) => {
        // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
        const campground = new Campground(req.body.campground);
        await campground.save();
        req.flash('success', 'Success on creating a campground!');
        res.redirect(`/campgrounds/${campground._id}`);
})) ;

// show route : Show
router.get('/:id', catchAsync(async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground});
}));

// editing the campground finding the id: Edit
router.get('/:id/edit', isLoggedIn, catchAsync(async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
}));

// put edited data to the database: Update
router.put('/:id',isLoggedIn, validateCampGround, catchAsync(async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}));

// deletion of the camp: Delete
router.delete('/:id', isLoggedIn, catchAsync(async (req,res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}));

module.exports = router;