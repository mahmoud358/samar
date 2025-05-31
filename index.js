const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { auth } = require("./middleware/auth");

require("dotenv").config();


// -----------"من فضلك، فكّ البيانات اللي جايالك بصيغة JSON من جسم الطلب (request body) وخليها جاهزة عندي في req.body."
app.use(express.json());


const PORT = process.env.PORT || 8000
server.listen(PORT, () => {
    connect();
    console.log(`Server running on port ${PORT}`);
});

const connect = async () => {
    try {
        console.log('MONGO URI:', process.env.MONGO);

        await mongoose.connect(process.env.MONGO);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
    }
};


// --------------- response for an end point that is not found in my routes ---------------
// app.all("*", (req, res, next) => {
//     res.status(404).json({ "status": "Failed", "message": "Page not found" });
// })

// ----------------------------------------------------
// هذا middleware مخصص لـ التعامل مع الأخطاء في التطبيق.

// يعني:

// لو حصل خطأ داخل أي Route أو Middleware.

// وتم تمرير الخطأ عن طريق next(error)،

// هذا الـ middleware هو المسؤول عن إرسال رد مناسب للمستخدم.

app.use(function (error, req, res, next) {
    console.log("error called");
    let statusCode = error.statusCode ? error.statusCode : 500;
    res.status(statusCode).json({ status: "fail", message: error.message });
})

app.use(cors());
// ================================
const accountRoute = require("./routes/accountsRoute")

app.use("/account", accountRoute)

app.all("*", (req, res, next) => {
    res.status(404).json({ "status": "Failed", "message": "Page not found" });
  });