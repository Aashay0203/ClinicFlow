import express from "express";
const router = express.Router();
import protect from "../middleware/authmiddleware.js";
import { onlyAdminEmail } from "../middleware/adminOnly.js";
import { getAllDoctors, createDoctor } from "../controllers/doctorController.js"
import roleMiddleware from "../middleware/roleMiddleware.js";

router.get("/allDoctors", getAllDoctors);
router.post("/addDoctors", protect, roleMiddleware("admin"), createDoctor);

export default router;
