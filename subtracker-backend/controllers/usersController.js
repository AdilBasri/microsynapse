import userModel from "../model/usersModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import SessionModel from "../model/sessionsModel.js";
import subscriptionModel from "../model/subscriptionModel.js";
import mailModel from "../model/mailModel.js";
import nodemailer from "nodemailer";
import * as crypto from "crypto";
import axios from "axios";

const createUser = async (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password1 = req.body.password1;
  let password2 = req.body.password2;

  if (password1 !== password2) {
    return res.json({ status: false, message: "Şifreler aynı olmalıdır." });
  }
  const password = await bcrypt.hash(password1, 10);
  let user = null;
  try {
    user = await userModel.create({
      name,
      email,
      password,
    });
  } catch (e) {
    return res
      .status(400)
      .json({ status: false, message: "Bu kullanıcı kayıtlı." });
  }

  const session = await SessionModel.create({
    userId: user._id,
    userAgent: req.headers["user-agent"] || "signup",
  });

  const token = jwt.sign(
    { userId: user._id, sessionId: session._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "365d",
    }
  );

  return res.json({ status: true, token });
};

const getUser = async (req, res) => {
  let userId = req.userId;

  let user = await userModel.findOne({ _id: userId });

  return res.json({ status: true, user: user });
};

const loginUser = async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let user = await userModel.findOne({ email });
  if (!user) {
    return res.json({ status: false, message: "Böyle bir kullanıcı yok." });
  }

  let validatePassword = await bcrypt.compare(password, user.password);
  if (!validatePassword) {
    return res.status(400).json({
      status: false,
      message: "Kullanıcı mevcut fakat şifreniz yanlış.",
    });
  }

  // Maksimum 3 oturum kontrolü !!düzenle!!
  const activeCount = await SessionModel.countDocuments({ userId: user._id });
  if (activeCount >= 50) {
    return res.status(400).json({
      status: false,
      message:
        "Maksimum 50 cihazdan oturum açabilirsiniz. Lütfen önceki oturumlardan çıkış yapın.",
    });
  }

  const session = await SessionModel.create({
    userId: user._id,
    userAgent: req.headers["user-agent"],
  });

  const token = jwt.sign(
    { userId: user._id, sessionId: session._id },
    process.env.JWT_SECRET,
    {
      expiresIn: "365d",
    }
  );

  return res.json({ status: true, token });
};

const updateName = async (req, res) => {
  const userId = req.userId; // Kullanıcı kimliği
  const { name } = req.body; // Yeni ad

  if (!name) {
    return res.status(400).json({ status: false, message: "Ad boş olamaz." });
  }

  try {
    const user = await userModel.findByIdAndUpdate(
      userId,
      { name },
      { new: true } // Güncellenmiş kullanıcıyı döndür
    );

    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "Kullanıcı bulunamadı." });
    }

    return res.json({
      status: true,
      message: "Ad başarıyla güncellendi.",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Sunucu hatası." });
  }
};

// 1) Şifre sıfırlama talebi: POST /user/forgot-password
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res
      .status(400)
      .json({ status: false, message: "Email adresi gerekli." });

  // Kullanıcı varsa token oluştur, yoksa sessizce başarılı dön
  const user = await userModel.findOne({ email: email.toLowerCase() });
  if (!user)
    return res.json({
      status: true,
      message: "Eğer kayıtlıysanız, mail adresinize bir link gönderildi.",
    });

  // 32 byte rastgele token, hex string
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  // 1 saat geçerli
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  // Mail gönderimi (örnek nodemailer ile; SMTP config’ınızı .env’den alın)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const mailHtml = `
    <p>Merhaba ${user.name},</p>
    <p>Şifrenizi sıfırlamak için <a href="${resetUrl}">buraya tıklayın</a>. Bu link 1 saat geçerli.</p>
    <p>Link çalışmıyorsa aşağıdaki adresi tarayıcınıza yapıştırın:</p>
    <p>${resetUrl}</p>
  `;

  await transporter.sendMail({
    from: `"subtracker" <${process.env.SMTP_FROM}>`,
    to: user.email,
    subject: "subtracker Şifre Sıfırlama",
    html: mailHtml,
  });

  res.json({
    status: true,
    message: "Şifre sıfırlama linki mail adresinize gönderildi.",
  });
};

// 2) Yeni şifre atama: POST /user/reset-password/:token
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password1, password2 } = req.body;
  if (!password1 || !password2)
    return res
      .status(400)
      .json({ status: false, message: "Her iki şifre de girilmeli." });
  if (password1 !== password2)
    return res
      .status(400)
      .json({ status: false, message: "Şifreler aynı olmalı." });

  // Token ve süresi kontrolü
  const user = await userModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user)
    return res
      .status(400)
      .json({ status: false, message: "Geçersiz veya süresi dolmuş token." });

  // Şifreyi güncelle
  user.password = await bcrypt.hash(password1, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ status: true, message: "Şifreniz başarıyla güncellendi." });
};

const saveGoogleCredentials = async (req, res) => {
  const userId = req.userId;
  const { credentials } = req.body;

  if (!credentials) {
    return res.status(400).json({ status: false, message: "Eksik veri." });
  }

  try {
    // Kullanıcıyı güncelle
    const user = await userModel.findByIdAndUpdate(
      userId,
      { credentials },
      { new: true }
    );

    // start_date olarak bugün (YYYY-MM-DD)
    const start_date = new Date().toISOString().slice(0, 10);

    // Yapay zeka servisine istek at
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const response = await axios.post(
      `${aiServiceUrl}/process-mails`,
      {
        userId,
        credentials,
        start_date,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "success") {
      return res.json({
        status: true,
        message: "Google bilgileri kaydedildi ve işlem başlatıldı.",
      });
    } else {
      return res
        .status(500)
        .json({ status: false, message: "Yapay zeka işlemi başarısız." });
    }
  } catch (err) {
    console.error("saveGoogleCredentials hata:", err.message);
    return res.status(500).json({ status: false, message: "Sunucu hatası." });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "Kullanıcı bulunamadı." });
    }
    console.log("Kullanıcı bulundu, silme işlemi başlatılıyor...");
    const email = user.email;

    await subscriptionModel.deleteMany({ userId });

    await SessionModel.deleteMany({ userId });

    await mailModel.deleteMany({ $or: [{ userId }, { mail_address: email }] });

    await userModel.findByIdAndDelete(userId);

    return res.json({
      status: true,
      message: "Hesabınız ve ilişkili tüm veriler başarıyla silindi.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: "Hesap silinemedi.",
      error: err.message,
    });
  }
};

const savePushToken = async (req, res) => {
  const userId = req.userId;
  const { expoPushToken } = req.body;
  if (!expoPushToken)
    return res.status(400).json({ status: false, message: "Token eksik." });
  await userModel.findByIdAndUpdate(userId, { expoPushToken });
  res.json({ status: true, message: "Push token kaydedildi." });
};

const initiateGoogleAuth = (req, res) => {
  const userId = req.query.userId || req.userId || '';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const scope = encodeURIComponent("https://www.googleapis.com/auth/gmail.readonly email profile");
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&access_type=offline&prompt=consent&state=${userId}`;
  
  res.redirect(authUrl);
};

const handleGoogleCallback = async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code) {
    return res.status(400).send("<h1>Hata: Authorization code bulunamadı.</h1>");
  }

  try {
    const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const tokens = tokenResponse.data;
    const credentials = {
      token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
    };

    if (userId) {
      await userModel.findByIdAndUpdate(userId, { credentials });
    }

    const start_date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

    console.log("AI servisine gönderilen payload:", JSON.stringify({ userId, credentials, start_date }, null, 2));

    axios.post(
      `${aiServiceUrl}/process-mails`,
      {
        userId: userId || undefined,
        user_id: userId || undefined,
        credentials,
        start_date,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    ).catch(err => console.error("AI service trigger error:", err.response?.data || err.message || err));

    return res.send(
      "<div style='font-family:sans-serif;text-align:center;padding:50px;'><h1 style='color:#4CAF50;'>Google İzniniz Başarıyla Alındı! 🎉</h1><p style='font-size:18px;color:#333;'>Abonelik mailleriniz taranıyor. Uygulamaya geri dönebilirsiniz.</p></div>"
    );
  } catch (error) {
    console.error("handleGoogleCallback error:", error.response?.data || error.message);
    return res.status(500).send(`<h1>Google Bağlantı Hatası</h1><pre>${JSON.stringify(error.response?.data || error.message, null, 2)}</pre>`);
  }
};

export {
  createUser,
  loginUser,
  getUser,
  deleteUser,
  saveGoogleCredentials,
  initiateGoogleAuth,
  handleGoogleCallback,
  updateName,
  savePushToken,
  requestPasswordReset,
  resetPassword,
};

