const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    userId: String,
    userName: String
})

const roomTypeSchema = mongoose.Schema({
    type: String,
    bedType: String
})

const servicesSchema = mongoose.Schema({
    serviceName: String
})

const roomSchema = mongoose.Schema({
    roomNo: String,
    roomType: String,
    bathroomType: String,
    balconyType: String,
    services: [servicesSchema]
})

const bathroomSchema = mongoose.Schema({
    type: String
})

const balconySchema = mongoose.Schema({
    view: String
})

const roleSchema = mongoose.Schema({
    role: String,
    users: [usersSchema],
    permission: [String]
})

const permissionSchema = mongoose.Schema({
    permission: String
})

const hotelPanelSchema = mongoose.Schema({
    hotelId: String,
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
    roles: [roleSchema],
    rooms: [roomSchema],
    roomTypes: [roomTypeSchema],
    bathroomTypes: [bathroomSchema],
    balconyTypes: [balconySchema]
});

module.exports = hotelPanelSchema;