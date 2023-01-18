const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSecuritySchema = require('../schemas/userSecuritySchema');
const userTableSchema = require('../schemas/userTableSchema');
const userVerificationSchema = require('../schemas/userVerificationSchema');

const userSecurityModel = new mongoose.model("userSecurityModel", userSecuritySchema);
const userTableModel = new mongoose.model("userTableModel", userTableSchema);
const userVerificationModel = new mongoose.model("userVerificationModel", userVerificationSchema);

// Verify admin middleware
const veryifyMainAdmin = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const user = jwt.verify(token, process.env.ACCESS_TOKEN)

    const userDetails = await userSecurityModel.findOne({ email: user?.email });

    if (!userDetails?.isMainAdmin) {
        return res.status(403).send({ message: "Forbidden access" })
    }
    next();
}

// Verify JWT
function verifyJwt(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).send('unauthorized access')
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbiden Token" });
        }
        req.decoded = decoded;
        next();
    })
}

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    console.log(email, password);
    if (!email || !password) return res.send({ message: "Invalid Information" })
    try {
        const user = await userSecurityModel.findOne({ email });
        if (!user) return res.send({ message: "User not Found" })

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN)

            if (res.status(201)) {
                return res.send({ message: "success", data: token })
            } else {
                return res.send({ message: "failed to login" })
            }
        }
        res.send({ message: "Invalid Password" })

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// Sign up
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.send({ message: "Invalid Information" })
    const encryptedPassword = await bcrypt.hash(password, 10)
    try {
        const oldUser = await userSecurityModel.findOne({ email })
        const oldUser2 = await userTableModel.findOne({ email })
        if (oldUser || oldUser2) {
            return res.send({ message: "User already exists" })
        }
        const uniqueId = uuid.v4()
        await userSecurityModel.create({
            userId: uniqueId,
            email,
            password: encryptedPassword,
            isActive: true,
            isMainAdmin: false
        });

        await userTableModel.create({
            userId: uniqueId,
            email,
            phone: null,
            name: null,
            birthday: null,

            p_dis: null,
            p_thana: null,
            p_postcode: null,
            p_area: null,

            c_dis: null,
            c_thana: null,
            c_postcode: null,
            c_area: null,

            id_card_front_page: null,
            id_card_back_page: null,

            isVerified: false,
            isActive: true,
        });
        res.send({ message: "success" })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// Geting user Info
router.post('/user-info', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    try {
        const user = jwt.verify(token, process.env.ACCESS_TOKEN)
        userTableModel.findOne({ email: user?.email })
            .then((data) => {
                res.send({ message: "success", data: data })
            })
            .catch(err => {
                res.send({ message: err.message })
            })

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})


// Update User info ---query by email and send info in body---
router.put('/update-user/:email', verifyJwt, async (req, res) => {
    const email = req.params.email;
    console.log(email);
    if (email !== req.decoded.email) {
        return res.status(403).send({ message: "Forbidden Token" });
    }
    const {
        phone, name, birthday,
        p_dis,
        p_thana,
        p_postcode,
        p_area,

        c_dis,
        c_thana,
        c_postcode,
        c_area,

        id_card_front_page,
        id_card_back_page
    } = req.body;

    try {
        const user = await userTableModel.updateOne({ email }, {
            $set: {
                phone, name, birthday,
                p_dis,
                p_thana,
                p_postcode,
                p_area,

                c_dis,
                c_thana,
                c_postcode,
                c_area,

                id_card_front_page,
                id_card_back_page
            }
        });
        if (user) {
            res.send({ data: user })
        } else {
            res.send({ message: "User Not Found!" })
        }

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// Apply for varification
router.post('/apply-for-verify', verifyJwt, async (req, res) => {
    const { email, idNumber, frontPage, backPage } = req.body;
    if (email !== req.decoded.email) {
        return res.status(403).send({ message: "Forbidden Token" });
    }
    try {
        const oldUser = await userVerificationModel.findOne({ email })
        if (oldUser) {
            return res.send({ message: "Verification resquest has been sent already" })
        }
        await userVerificationModel.create({
            idNumber,
            email,
            frontPage,
            backPage,
            pendingStatus: true,
            isVerified: false
        });
        res.send({ message: "success" })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// Get all users for verification
router.get('/applied-users', veryifyMainAdmin, async (req, res) => {
    try {
        const allUser = await userVerificationModel.find();
        if (allUser) {
            res.status(200).send({ data: allUser });
        } else {
            res.status(404).send({ message: "Users not found" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// Verify an user
router.put('/verify-user/:email', veryifyMainAdmin, async (req, res) => {
    try {
        const email = req.params?.email;
        const user = await userTableModel.updateOne({ email }, {
            $set: {
                isVerified: true
            }
        });
        const user2 = await userVerificationModel.updateOne({ email }, {
            $set: {
                isVerified: true,
                pendingStatus: false
            }
        });
        if (user && user2) {
            res.send({ data: user })
        } else {
            res.send({ message: "Admin Not Found!" })
        }

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// Getting all the users
router.get('/', veryifyMainAdmin, async (req, res) => {
    try {
        const allUser = await userSecurityModel.find().select({ password: 0 });
        if (allUser) {
            res.status(200).send({ data: allUser });
        } else {
            res.status(404).send({ message: "Users not found" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// disable an account 
router.put('/disable/:email', veryifyMainAdmin, async (req, res) => {
    try {
        const email = req.params?.email;
        const user = await userSecurityModel.updateOne({ email }, {
            $set: {
                isActive: false
            }
        });
        const user2 = await userTableModel.updateOne({ email }, {
            $set: {
                isVerified: false,
                isActive: false
            }
        });
        const user3 = await userVerificationModel.updateOne({ email }, {
            $set: {
                isVerified: false,
                pendingStatus: true
            }
        });
        if (user && user2 && user3) {
            res.send({ data: user })
        } else {
            res.send({ message: "User Not Found!" })
        }

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// able an account 
router.put('/able/:email', veryifyMainAdmin, async (req, res) => {
    try {
        const email = req.params?.email;
        const user = await userSecurityModel.updateOne({ email }, {
            $set: {
                isActive: true
            }
        });
        const user2 = await userTableModel.updateOne({ email }, {
            $set: {
                isActive: true
            }
        });
        if (user && user2) {
            res.send({ data: user })
        } else {
            res.send({ message: "User Not Found!" })
        }

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

module.exports = { userRoute: router, userSecurityModel };