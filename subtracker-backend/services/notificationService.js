import { Expo } from "expo-server-sdk";
import userModel from "../model/usersModel.js";

const expo = new Expo();

export async function sendNotification({ userId, subscriptionId, title, body, priority }) {
  try {
    // Kullanıcıyı bul
    const user = await userModel.findById(userId);
    if (!user) {
      console.warn("Kullanıcı bulunamadı:", userId);
      return;
    }
    const pushToken = user.expoPushToken;
    if (!pushToken) {
      console.warn("Expo push token bulunamadı kullanıcı için:", userId);
      return;
    }
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error("Geçersiz Expo push token:", pushToken);
      return;
    }

    const message = {
      to: pushToken,
      sound: "default",
      title,
      body,
      data: { subscriptionId, priority },
    };

    const chunks = expo.chunkPushNotifications([message]);
    for (const chunk of chunks) {
      try {
        const receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log("Push gönderildi, receipt:", receipts);
      } catch (error) {
        console.error("Push gönderme hatası:", error);
      }
    }
  } catch (err) {
    console.error("sendNotification hata:", err);
  }
}
