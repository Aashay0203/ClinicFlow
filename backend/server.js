import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import cors from "cors";
import appointmentRoute from "./routes/appointment.js"
import authRoute from "./routes/authRoutes.js";
import doctorRoute from "./routes/doctorRoutes.js"
import queueRoute from "./routes/queueRoute.js";
import paymentRoute from "./routes/paymentRoute.js"
import medicationRoutes from "./routes/medicationRoute.js";


const PORT = 8080;
const app = express();

app.use(cors());
app.use(express.json());

const connectMongoDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Mongoose is connectes Successfully");
    } catch (err) {
        console.log(err);
    }
}

app.use("/api/auth", authRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/queue", queueRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/medication", medicationRoutes);


app.get("/test", (req, res) => {
    res.json({ message: "Server is working" });
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
    connectMongoDb();
})