const jwt = require('jsonwebtoken');
const { userTableModel } = require('../routes/userRoute');

const checkVerified = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const user = jwt.verify(token, process.env.ACCESS_TOKEN)

    const userDetails = await userTableModel.findOne({ email: user?.email });

    if (!userDetails?.isVerified) {
        return res.status(403).send({ message: "Forbidden access" })
    }
    next();
}

module.exports = checkVerified;