import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const clearMails = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI bulunamadı!");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    const result = await mongoose.connection.collection('mails').deleteMany({});
    console.log(`[SUCCESS] ${result.deletedCount} doküman 'mails' koleksiyonundan silindi.`);
    process.exit(0);
  } catch (err) {
    console.error("[ERROR] Mails silinirken hata:", err);
    process.exit(1);
  }
};

clearMails();
