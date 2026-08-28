import mongoose from "mongoose";
import importData from "../middlewares/dbConnection.js";

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  company_name: { type: String, required: true },
  price: { type: String, required: true },
  date: { type: Date, required: true },
  subs_date: { type: String, required: true },
  selected: { type: Boolean, default: false },
  notifyDays: { type: Number, default: null },
  subs_type: { type: String, required: true },
});

const subscriptionModel = importData.model("subscriptions", schema);

export default subscriptionModel;
