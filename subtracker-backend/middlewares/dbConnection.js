import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbConnection = mongoose.createConnection(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default dbConnection;
