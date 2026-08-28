import mongoose from "mongoose";
import importData from "../middlewares/dbConnection.js";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Lütfen adınızı giriniz."],
  },
  email: {
    type: String,
    required: [true, "Lütfen emailinizi giriniz."],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Lütfen şifre oluşturunuz."],
  },
  plan: {
    type: String,
    enum: ["normal", "premium"],
    default: "normal",
  },
  planExpiry: {
    type: Date,
    default: null,
  },
  expoPushToken: { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
});

const userModel = importData.model("users", schema);

export default userModel;
