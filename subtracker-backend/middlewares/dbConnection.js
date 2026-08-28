import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbConnection = mongoose.createConnection(process.env.MONGO_URI);

export default dbConnection;
