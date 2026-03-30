// routes/authRoutes.js
import express from "express";
const router = express.Router();
import { signup, login } from "../controllers/authControllers.js";
import { doctorSignup } from "../controllers/authControllers.js";

router.post("/signup", signup);
router.post("/login", login);
router.post("/doctorSignup", doctorSignup);

export default router;
