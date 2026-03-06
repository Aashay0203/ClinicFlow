import express from "express";
const router = express.Router();
import protect from "../middleware/authmiddleware.js";
import { getAllDoctors, doctorDetails } from "../controllers/doctorController.js"
import roleMiddleware from "../middleware/roleMiddleware.js";
import { doctorSignup } from "../controllers/authControllers.js";

router.post("/signup", protect, roleMiddleware("admin"), doctorSignup);
router.get("/allDoctors", getAllDoctors);
router.get("/:id", doctorDetails);

export default router;
