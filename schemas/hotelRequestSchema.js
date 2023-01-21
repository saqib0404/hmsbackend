const mongoose = require('mongoose');

const hotelRequestSchema = mongoose.Schema({
    userId: String,
    userName: String,
    hotelName: String,
    latitude: String,
    longitude: String,
    address: {
        division: String,
        district: String,
        thana: String
    },
    documents: {
        tradeLicense: String
    },
    pending: Boolean,
    isVerified: Boolean,
});

module.exports = hotelRequestSchema;