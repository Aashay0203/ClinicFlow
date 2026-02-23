import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["patient", "admin", "doctor"],
        default: "patient",
    }
},
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);