import mailModel from "../model/mailModel.js";
import userModel from "../model/usersModel.js";
import dbConnection from "../middlewares/dbConnection.js";

async function backfill() {
  console.log("Starting backfill for legacy mail documents...");
  try {
    const unlinkedMails = await mailModel.find({ userId: { $exists: false } });
    console.log(`Found ${unlinkedMails.length} unlinked mail documents.`);

    let updatedCount = 0;
    for (const mail of unlinkedMails) {
      if (!mail.mail_address) continue;
      const user = await userModel.findOne({ email: mail.mail_address.toLowerCase() });
      if (user) {
        mail.userId = user._id;
        await mail.save();
        updatedCount++;
      }
    }
    console.log(`Successfully backfilled ${updatedCount} documents with userId.`);
  } catch (err) {
    console.error("Backfill error:", err);
  } finally {
    dbConnection.close();
    process.exit(0);
  }
}

backfill();
