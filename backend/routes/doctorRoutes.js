import express from "express";
const router = express.Router();
import protect from "../middleware/authmiddleware.js";
import {
    getAllDoctors, doctorDetails, getTodayAppointments,
    getPatientHealthProfile
} from "../controllers/doctorController.js"
import roleMiddleware from "../middleware/roleMiddleware.js";


router.get("/allDoctors", getAllDoctors);
router.get(
    "/today-appointments",
    protect,
    roleMiddleware("doctor"),
    getTodayAppointments
);
router.get(
    "/patient-profile/:patientId",
    protect,
    roleMiddleware("doctor"),
    getPatientHealthProfile
);
router.get("/:id", doctorDetails);

export default router;
