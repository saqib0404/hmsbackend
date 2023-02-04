const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
require("dotenv").config();
const { userRoute } = require("./routes/userRoute");
const hotelRoute = require("./routes/hotelRoute");

//middleware
app.use(cors());
app.use(express.json());

// Connection
mongoose.set('strictQuery', false);
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.csyc5ob.mongodb.net/hsm?retryWrites=true&w=majority`)
    .then(console.log("connection successfull"))
    .catch((err) => console.error(err));

// routes
app.use("/users", userRoute);
app.use("/hotel", hotelRoute);
app.use(express.static("public"))

// Tests
app.get("/", (req, res) => {
    res.send("Server is running successfully");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
