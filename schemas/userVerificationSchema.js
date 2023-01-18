const mongoose = require('mongoose');

const userVerificationSchema = mongoose.Schema({
    idNumber: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    frontPage: {
        type: String,
        required: true
    },
    backPage: {
        type: String,
        required: true
    },
    pendingStatus: {
        type: Boolean,
        required: true
    },
    isVerified: {
        type: Boolean,
        required: true
    }
});

module.exports = userVerificationSchema;