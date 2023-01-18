const jwt = require('jsonwebtoken');
const { userSecurityModel } = require('../routes/userRoute');

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

module.exports = veryifyMainAdmin;