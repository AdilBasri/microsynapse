import mongoose from "mongoose";
import dbConnection from "../middlewares/dbConnection.js";

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  userAgent: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// İndeksleyerek hızlı silme ve sayma işlemi için
sessionSchema.index({ userId: 1, createdAt: 1 });

const SessionModel = dbConnection.model("sessions", sessionSchema);

export default SessionModel;
