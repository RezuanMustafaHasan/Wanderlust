// Seed a dedicated local demo database without touching the configured Atlas DB.
const mongoose = require('mongoose');
const User = require('../models/user');
const Listing = require('../models/listing');
const sampleListings = require('../init/data');

async function seedDemo() {
    const password = process.env.DEMO_PASSWORD;
    if (!password || password.length < 12) {
        throw new Error('Set DEMO_PASSWORD to a password of at least 12 characters.');
    }

    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust_demo');
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const { name } of collections) {
        if (await mongoose.connection.db.collection(name).countDocuments({}, { limit: 1 })) {
            throw new Error('wanderlust_demo already contains data; nothing was changed.');
        }
    }

    const owner = await User.register(new User({
        username: 'wanderlust_demo',
        email: 'demo@example.com'
    }), password);
    await Listing.insertMany(sampleListings.map(listing => ({
        ...listing,
        owner: owner._id
    })));
    console.log(`Added ${sampleListings.length} listings to the local wanderlust_demo database.`);
    console.log('Demo username: wanderlust_demo');
}

seedDemo()
    .catch(error => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
