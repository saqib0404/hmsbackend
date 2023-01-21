const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const checkVerified = require('../customMiddleware/checkVerified');
const verifyMainAdmin = require('../customMiddleware/verifyMainAdmin');
const { userTableModel } = require('../routes/userRoute');
const hotelRequestSchema = require('../schemas/hotelRequestSchema');
const hotelPanelSchema = require('../schemas/hotelPanelSchema')

const hotelRequestModel = new mongoose.model("hotelRequestModel", hotelRequestSchema);
const hotelPanelModel = new mongoose.model("hotelPanelModel", hotelPanelSchema);

// Request For a hotel
router.post('/:userId', checkVerified, async (req, res) => {
    const userId = req.params.userId;
    const {
        userName,
        hotelName,
        latitude,
        longitude,
        division,
        district,
        thana,
        tradeLicense
    } = req.body;

    try {
        const request = await hotelRequestModel.create({
            userName,
            userId,
            hotelName,
            latitude,
            longitude,
            address: {
                division,
                district,
                thana
            },
            documents: {
                tradeLicense
            },
            pending: true,
            isVerified: false,
        });
        if (request) {
            res.status(201).send({ message: "success" })
        } else {
            res.status(404).send({ message: "Error!" })
        }
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// get All requests
router.get('/', verifyMainAdmin, async (req, res) => {
    try {
        const hotels = await hotelRequestModel.find();
        if (hotels) {
            res.status(200).send({ data: hotels, message: "success" });
        } else {
            res.status(404).send({ message: "Users not found" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// Verify hotel
router.put('/verify', verifyMainAdmin, async (req, res) => {
    const { address, documents, userId, userName, hotelName, latitude, longitude } = req.body
    // console.log(data);
    const uniqueId = uuid.v4().slice(0, 7)
    try {
        // updating request collection
        const verified = await hotelRequestModel.updateOne({ userId, hotelName }, {
            $set: {
                pending: false,
                isVerified: true
            }
        })
        if (verified.acknowledged) {
            // Updating user collection
            await userTableModel.updateOne({ userId }, {
                $addToSet:
                {
                    hotels: {
                        hotelId: hotelName + "-" + uniqueId,
                        hotelName,
                        role: "Owner"
                    }
                }
            })
        }
        // Adding to hotal panel
        await hotelPanelModel.create({
            hotelName,
            hotelId: hotelName + "-" + uniqueId,
            latitude,
            longitude,
            address: {
                division: address?.division,
                district: address?.district,
                thana: address?.thana
            },
            documents: {
                tradeLicense: documents?.tradeLicense
            },
            roles: {
                role: "Owner",
                users: {
                    userId,
                    userName
                },
                permission: [1, 2, 3, 4, 5]
            }
        });


        // if (verified) {
        res.status(200).send({ data: verified, message: "success" })
        // } else {
        //     res.status(404).send({ message: "data Not Found!" })
        // }

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

module.exports = router