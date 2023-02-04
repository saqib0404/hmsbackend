const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multiparty = require('multiparty');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSecuritySchema = require('../schemas/userSecuritySchema');
const userTableSchema = require('../schemas/userTableSchema');

const userSecurityModel = new mongoose.model("userSecurityModel", userSecuritySchema);
const userTableModel = new mongoose.model("userTableModel", userTableSchema);

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
            return res.status(403).send({ message: "Forbidden Token" });
        }
        req.decoded = decoded;
        next();
    })
}

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.send({ message: "Invalid Information" })
    try {
        const user = await userSecurityModel.findOne({ email });
        if (!user) return res.status(404).send({ message: "User not Found" })

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN)

            if (res.status(201)) {
                return res.status(200).send({ message: "success", token })
            } else {
                return res.status(500).send({ message: "failed to login" })
            }
        }
        res.status(404).send({ message: "Invalid Password" })

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// Sign up
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(404).send({ message: "Invalid Information" })
    const encryptedPassword = await bcrypt.hash(password, 10)
    try {
        const oldUser = await userSecurityModel.findOne({ email })
        const oldUser2 = await userTableModel.findOne({ email })
        if (oldUser || oldUser2) {
            return res.status(409).send({ message: "User already exists" })
        }
        const uniqueId = uuid.v4().slice(0, 7)
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

            p_division: null,
            p_district: null,
            p_thana: null,
            p_area: null,

            c_division: null,
            c_district: null,
            c_thana: null,
            c_area: null,

            id_card_front_page: null,
            id_card_back_page: null,

            idNumber: null,
            frontPage: null,
            backPage: null,
            pendingStatus: null,

            isVerified: false,
            isActive: true,
            pending: null
        });
        res.status(201).send({ message: "success" })
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
                res.status(200).send({ message: "success", data: data })
            })
            .catch(err => {
                res.status(404).send({ message: err.message })
            })

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// Check main admin
router.get('/admin/:email', async (req, res) => {
    const email = req.params.email;
    const user = await userSecurityModel.findOne({ email });
    res.send({ isMainAdmin: user?.isMainAdmin === true })
})

// Update User info ---query by email and send info in body---
router.put('/update-user/:email', verifyJwt, async (req, res) => {
    const email = req.params.email;
    if (email !== req.decoded.email) {
        return res.status(403).send({ message: "Forbidden Token" });
    }
    const {
        phone, name, birthday,
        p_division,
        p_district,
        p_thana,
        p_area,

        c_division,
        c_district,
        c_thana,
        c_area,
    } = req.body.data;
    console.log(phone);
    try {
        const user = await userTableModel.updateOne({ email }, {
            $set: {
                phone, name, birthday,
                p_division,
                p_district,
                p_thana,
                p_area,

                c_division,
                c_district,
                c_thana,
                c_area,
            }
        });
        if (user) {
            res.status(200).send({ data: user, message: "success" })
        } else {
            res.status(404).send({ message: "User Not Found!" })
        }

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// Apply for varification
router.post('/apply-for-verify/:userId', async (req, res) => {
    const userId = req.params.userId;
    let form = new multiparty.Form({ uploadDir: "./public/images/" })
    form.parse(req, async function (err, fields, files) {
        if (err) return res.send({ error: err.message })
        const imagePath1 = files.id_card_front_page[0].path;
        const imageFileName1 = imagePath1.slice(imagePath1.lastIndexOf("\\") + 1);
        const imageURL1 = "http://localhost:5000/images/" + imageFileName1;

        const imagePath2 = files.id_card_back_page[0].path;
        const imageFileName2 = imagePath2.slice(imagePath2.lastIndexOf("\\") + 1);
        const imageURL2 = "http://localhost:5000/images/" + imageFileName2;

        try {
            const updatedDoc = await userTableModel.updateOne(
                { userId },
                {
                    $set: {
                        idNumber: fields.idNumber[0],
                        id_card_front_page: imageURL1,
                        id_card_back_page: imageURL2,
                        pendingStatus: true,
                    }
                },
            )
            if (updatedDoc) {
                res.status(200).redirect(`http://localhost:3000`);
            } else {
                return res.status(500).send({ message: "Update failed" })
            }
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    })

})

// Get all users for verification
router.get('/applied-users', veryifyMainAdmin, async (req, res) => {
    try {
        const allUser = await userTableModel.find();
        if (allUser) {
            res.status(200).send({ data: allUser, message: "success" });
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
                isVerified: true,
                pendingStatus: false
            }
        })
        if (user) {
            res.status(200).send({ data: user, message: "success" })
        } else {
            res.status(404).send({ message: "Admin Not Found!" })
        }

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

// Getting all the users
router.get('/', veryifyMainAdmin, async (req, res) => {
    try {
        const allUser = await userSecurityModel.find().select({ password: 0, _id: 0 });
        if (allUser) {
            res.status(200).send({ data: allUser, message: "success" });
        } else {
            res.status(404).send({ message: "Users not found" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})
router.get('/all', veryifyMainAdmin, async (req, res) => {
    try {
        const allUser = await userTableModel.find().select({ _id: 0 });
        if (allUser) {
            res.status(200).send({ data: allUser, message: "success" });
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
                isActive: false,
                pendingStatus: null
            }
        })
        if (user && user2) {
            res.status(200).send({ data: user, mesage: "success" })
        } else {
            res.status(404).send({ message: "User Not Found!" })
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
                isActive: true,
                pendingStatus: null
            }
        });
        if (user && user2) {
            res.status(200).send({ data: user, message: "success" })
        } else {
            res.status(404).send({ message: "User Not Found!" })
        }

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
})

module.exports = { userRoute: router, userSecurityModel, userTableModel };