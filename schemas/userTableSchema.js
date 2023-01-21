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

    p_dis: String,
    p_thana: String,
    p_postcode: String,
    p_area: String,

    c_dis: String,
    c_thana: String,
    c_postcode: String,
    c_area: String,

    idNumber: String,
    id_card_front_page: String,
    id_card_back_page: String,
    pendingStatus: Boolean,

    hotels: [hotelsSchema],

    isVerified: Boolean,
    isActive: Boolean,
});

module.exports = userTableSchema;