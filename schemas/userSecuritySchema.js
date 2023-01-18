const mongoose = require('mongoose');

const userSecuritySchema = mongoose.Schema({
    userId:{
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    },
    isMainAdmin: {
        type: Boolean,
        required: true
    }
});

module.exports = userSecuritySchema;