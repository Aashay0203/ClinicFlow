// controllers/authController.js
import User from "../models/userSchema.js";
import Doctor from "../models/docterSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // 1. Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create user
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
        });

        // 4. Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "Signup successful",
            token,
            user: {
                id: user._id,
                role: user.role,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Signup failed", error: err.message });
    }
};

export const doctorSignup = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            speciality,
            startTime,
            avgConsultTime,
            fee
        } = req.body;

        // 1️⃣ Check doctor exists
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ message: "Doctor already exists" });
        }

        // 2️⃣ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3️⃣ Create doctor with ALL doctor fields
        const doctor = await Doctor.create({
            name,
            email,
            phone,
            password: hashedPassword,
            speciality,
            startTime,
            avgConsultTime,
            fee
        });

        // 4️⃣ Generate token
        const token = jwt.sign(
            { userId: doctor._id, role: "doctor", email: doctor.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "Doctor signup successful",
            token
        });

    } catch (err) {
        res.status(500).json({
            message: "Doctor signup failed",
            error: err.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let account = null;
        let role = null;

        // 1️⃣ Try User collection first
        account = await User.findOne({ email });
        if (account) {
            role = account.role; // patient/admin
        } else {
            // 2️⃣ If not found, try Doctor collection
            account = await Doctor.findOne({ email });
            if (account) {
                role = "doctor";
            }
        }

        if (!account) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3️⃣ Compare password
        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 4️⃣ Generate JWT
        const token = jwt.sign(
            {
                userId: account._id,
                role: role,
                email: account.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: account._id,
                role,
                email: account.email
            }
        });

    } catch (err) {
        res.status(500).json({
            message: "Login failed",
            error: err.message
        });
    }
};