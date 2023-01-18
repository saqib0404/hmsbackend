const mongoose = require('mongoose');

const userTableSchema = mongoose.Schema({
    userId: String,
    email: String,
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
    id_card_front_page: String,
    id_card_back_page: String,
    isVerified: Boolean,
    isActive: Boolean,
});

module.exports = userTableSchema;