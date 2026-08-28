import cron from "node-cron";
import subscriptionModel from "../model/subscriptionModel.js";
import mailModel from "../model/mailModel.js";
import { sendNotification } from "../services/notificationService.js";

// Her gün gece yarısı çalışacak
cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tüm seçili ve notifyDays atanmış abonelikleri çek
    const [manualSubs, mailSubs] = await Promise.all([
      subscriptionModel.find({ selected: true, notifyDays: { $ne: null } }),
      mailModel.find({ selected: true, notifyDays: { $ne: null } }),
    ]);

    const allSubs = [...manualSubs, ...mailSubs];

    for (const sub of allSubs) {
      const dueDate = new Date(sub.date);
      dueDate.setHours(0, 0, 0, 0);

      const msPerDay = 24 * 60 * 60 * 1000;
      const diffDays = Math.round((dueDate - today) / msPerDay);

      if (diffDays === sub.notifyDays) {
        let priority;
        if (sub.notifyDays <= 3) priority = "high";
        else if (sub.notifyDays <= 15) priority = "medium";
        else priority = "low";

        if (sub.userId) {
          await sendNotification({
            userId: sub.userId,
            subscriptionId: sub._id.toString(),
            title: `${sub.company_name} aboneliğiniz ${sub.notifyDays} gün sonra yenileniyor.`,
            body: `${sub.company_name} aboneliğiniz için hatırlatma: ${sub.notifyDays} gün kaldı.`,
            priority,
          });
        } else {
          console.warn(`Bildirim gönderilemedi, userId yok: subscription ${sub._id}`);
        }
      }
    }
  } catch (err) {
    console.error("Notification cron error:", err);
  }
});

export default cron;
