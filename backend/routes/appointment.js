import express from "express";
const router = express.Router();
import protect from "../middleware/authmiddleware.js";
import { appointmentBook, getAppointmentStatus, markAppointmentArrived } from "../controllers/appointmentController.js";
import { get } from "mongoose";

router.get("/my-appointments", protect, async (req, res) => {
    res.json({
        message: "Protected route accessed",
        userId: req.user.userId,
    });
});

router.post("/book", protect, appointmentBook);
router.get("/:id/status", protect, getAppointmentStatus);
router.put("/:id/arrive", protect, markAppointmentArrived);

export default router;
