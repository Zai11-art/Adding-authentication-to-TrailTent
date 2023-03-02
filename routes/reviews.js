const express = require('express');
const router = express.Router({mergeParams: true}); // remember to use mergeParams so that the parameters or id would connect and not set it into a different stray 

// models
const Campground = require('../models/campground');
const Review = require('../models/review');

const {reviewSchema} = require('../schemas.js');

// utilities
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');

// this code is for checking reviews validations
const validateReview = (req, res, next) => {
    // this line of code is the JOI which allows errors from objects
    const {error} = reviewSchema.validate(req.body);
    if(error) {
        console.log(error)
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// this route for submitting: Create and Update
router.post('/', validateReview, catchAsync ( async (req, res) => {
    console.log(req.params)
    const campground = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    campground.reviews.push(newReview);
    await campground.save();
    await newReview.save();
    req.flash('success', 'Review Submitted!')
    res.redirect(`/campgrounds/${campground._id}`)
}));

// for deleting reviews: Delete
router.delete('/:reviewId', catchAsync( async (req, res) => {
    const {id, reviewId} = req.params;
    const findCamp = await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    console.log(findCamp);
    const deleteReview = await Review.findByIdAndDelete(reviewId);
    console.log(deleteReview);
    req.flash('success', 'Review deleted.')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;