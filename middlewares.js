const  Listing  = require('./models/listing');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema, reviewSchema} = require('./schema.js');
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        // Only store redirect URL for GET requests or safe operations
        if(req.method === 'GET') {
            req.session.redirectUrl = req.originalUrl;
        }
        req.flash('error', 'You must be logged in to perform this action');
        return res.redirect('/login');
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl; // Make it available in the response locals
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errMsg);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, errMsg);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    console.log("Here in is Review Author");
    console.log(req.params);
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    console.log(review);
    console.log("Her it is: \n");
    console.log(req.user);
    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
}