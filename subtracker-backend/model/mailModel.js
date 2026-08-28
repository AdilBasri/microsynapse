import mongoose from "mongoose";
import importData from "../middlewares/aiDbConnection.js";

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    index: true,
  },
  mail_address: String,
  company_name: String,
  price: String,
  date: Date,
  selected: { type: Boolean, default: false },
  notifyDays: { type: Number, default: null },
});

const mailModel = importData.model("mails", schema);

export default mailModel;
