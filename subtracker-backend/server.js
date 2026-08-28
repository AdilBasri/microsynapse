import cors from "cors";
import express from "express";
import authMiddleware from "./middlewares/authMiddleware.js";
import {
  getUserSubscriptionData,
  createSubscription,
  deleteSubscription,
  toggleSelectSubscription,
  getAllSubscriptions,
  setNotification,
} from "./controllers/subscriptionController.js";
import {
  createUser,
  loginUser,
  getUser,
  deleteUser,
  saveGoogleCredentials,
  updateName,
  savePushToken,
  requestPasswordReset,
  resetPassword,
} from "./controllers/usersController.js";
import { logoutUser, listSessions } from "./controllers/sessionController.js";
import {
  initiatePaytrPayment,
  handlePaytrCallback,
} from "./controllers/membershipController.js";

import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors({ origin: "*" }));

app.post("/user/create", createUser);
app.post("/user/login", loginUser);
app.put("/user/update-name", authMiddleware, updateName);
app.get("/user/info", authMiddleware, getUser);
app.post("/user/google-credentials", authMiddleware, saveGoogleCredentials);
app.post("/user/logout", authMiddleware, logoutUser);
app.get("/user/sessions", authMiddleware, listSessions);
app.delete("/user/delete", authMiddleware, deleteUser);
app.post("/user/push-token", authMiddleware, savePushToken);
app.post("/user/forgot-password", requestPasswordReset);
app.post("/user/reset-password/:token", resetPassword);

// 1.adım: ödeme iFrame token isteği
app.post("/membership/paytr-initiate", authMiddleware, initiatePaytrPayment);
// 2.adım: PayTR Bildirim URL’niz (unauthorized)
app.post(
  "/membership/paytr-callback",
  express.urlencoded({ extended: true }),
  handlePaytrCallback
);
// Başarılı ödeme sayfası (iframe içinde gösterilecek)
app.get("/membership/paytr-success", (req, res) => {
  res.send(
    "<h1>Ödemeniz başarıyla tamamlandı! Uygulamayı kapatabilirsiniz.</h1>"
  );
});
// Başarısız ödeme sayfası
app.get("/membership/paytr-fail", (req, res) => {
  res.send("<h1>Ödeme başarısız oldu. Lütfen tekrar deneyin.</h1>");
});

app.get("/subscriptions", authMiddleware, getUserSubscriptionData);
app.get("/subscriptions/all", authMiddleware, getAllSubscriptions);
app.post("/subscriptions/select", authMiddleware, toggleSelectSubscription);
app.post("/subscription/create", authMiddleware, createSubscription);
app.delete("/subscription/delete/:id", authMiddleware, deleteSubscription);
app.put("/subscription/notification/", authMiddleware, setNotification);

import "./schedulers/notificationScheduler.js";

const port = 5002;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
