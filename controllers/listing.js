const Listing = require('../models/listing.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs',{allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render('listings/new.ejs');
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
                    path: 'reviews', 
                        populate: {
                            path: "author"
                        }
                }
        )
        .populate('owner');
    if(!listing) {
        req.flash('error', 'Listing Not Found!');
        return res.redirect('/listings');
    }
    res.render('listings/show.ejs', { listing });
};

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.image.url = url;
    newListing.image.filename = filename;
    newListing.owner = req.user._id;
    newListing.geometry = response.body.features[0].geometry;
    await newListing.save();
    req.flash('success', 'New Listing Created Successfully!');
    res.redirect('/listings');
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    console.log(req.params);
    const listing = await Listing.findById(id);
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,h_250");
    res.render('listings/edit.ejs', { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    if(typeof req.file !== 'undefined') {
        let url = req.file.path;
        let filename = req.file.filename;
        req.body.listing.image = { url,filename };
    }
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    console.log("Here to delete\n");
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing Deleted Successfully!');
    res.redirect('/listings');
};