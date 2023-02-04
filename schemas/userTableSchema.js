const mongoose = require('mongoose');

const hotelsSchema = mongoose.Schema({
    hotelId: String,
    hotelName: String,
    role: String
})

const userTableSchema = mongoose.Schema({
    userId: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    phone: String,
    name: String,
    birthday: String,

    p_division: String,
    p_district: String,
    p_thana: String,
    p_area: String,

    c_division: String,
    c_district: String,
    c_thana: String,
    c_area: String,

    idNumber: String,
    id_card_front_page: String,
    id_card_back_page: String,
    pendingStatus: Boolean,

    hotels: [hotelsSchema],

    isVerified: Boolean,
    isActive: Boolean,
    pending: Boolean
});

module.exports = userTableSchema;