import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const aiDbConnection = mongoose.createConnection(process.env.AI_MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default aiDbConnection;
