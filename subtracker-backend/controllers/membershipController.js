import axios from "axios";
import crypto from "crypto";
import userModel from "../model/usersModel.js";

// 1) Ödeme başlatma: iFrame token alma
const initiatePaytrPayment = async (req, res) => {
  const userId = req.userId;
  const user = await userModel.findById(userId);
  if (!user)
    return res
      .status(404)
      .json({ status: false, message: "Kullanıcı bulunamadı." });

  const {
    PAYTR_MERCHANT_ID: merchant_id,
    PAYTR_MERCHANT_KEY: merchant_key,
    PAYTR_MERCHANT_SALT: merchant_salt,
    PAYTR_OK_URL: merchant_ok_url,
    PAYTR_FAIL_URL: merchant_fail_url,
    PAYTR_TEST_MODE = "0",
    PAYTR_DEBUG_ON = "1",
    PAYTR_TIMEOUT_LIMIT = "30",
  } = process.env;

  // 1.a) Sipariş numarası: kullanıcı + zaman damgası
  const merchant_oid = `${userId}${Date.now()}`;

  const { user_address, user_phone } = req.body;
  if (!user_address || !user_phone) {
    return res
      .status(400)
      .json({ status: false, message: "user_address ve user_phone zorunlu." });
  }

  // 1.b) Temel parametreler
  const user_ip = req.ip;
  const email = user.email;
  const payment_amount = 29 * 100; // 29 TL → 2900
  const currency = "TL";
  const basket = JSON.stringify([
    ["Premium Plan", (payment_amount / 100).toFixed(2), 1],
  ]);
  const user_basket = Buffer.from(basket).toString("base64");
  const no_installment = 1;
  const max_installment = 0;
  const lang = "tr";

  // 1.c) paytr_token hesaplama
  const hashStr =
    merchant_id +
    user_ip +
    merchant_oid +
    email +
    payment_amount +
    user_basket +
    no_installment +
    max_installment +
    currency +
    PAYTR_TEST_MODE;
  const paytr_token = crypto
    .createHmac("sha256", merchant_key)
    .update(hashStr + merchant_salt)
    .digest("base64");

  // 1.d) iFrame token isteği
  try {
    const params = new URLSearchParams({
      merchant_id,
      user_ip,
      merchant_oid,
      email,
      payment_amount,
      user_basket,
      no_installment,
      max_installment,
      currency,
      test_mode: PAYTR_TEST_MODE,
      debug_on: PAYTR_DEBUG_ON,
      timeout_limit: PAYTR_TIMEOUT_LIMIT,
      lang,
      paytr_token,
      // Opsiyonel müşteri bilgileri:
      user_name: user.name,
      user_address,
      user_phone,
      merchant_ok_url,
      merchant_fail_url,
    });

    const { data } = await axios.post(
      "https://www.paytr.com/odeme/api/get-token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (data.status !== "success")
      return res.status(400).json({ status: false, message: data.reason });

    // iFrame token ve merchant_oid’yi frontend’e gönder
    // (örn. React Native WebView’da kullanmak üzere)
    res.json({
      status: true,
      iframe_token: data.token,
      merchant_oid,
    });
  } catch (err) {
    console.error("PayTR token error:", err);
    res.status(500).json({ status: false, message: "Ödeme başlatılamadı." });
  }
};

// 2) PayTR Bildirim URL (callback)
const handlePaytrCallback = async (req, res) => {
  const { merchant_oid, status, total_amount, hash } = req.body;

  const {
    PAYTR_MERCHANT_KEY: merchant_key,
    PAYTR_MERCHANT_SALT: merchant_salt,
  } = process.env;

  // 2.a) Hash kontrolü
  const hashStr = merchant_oid + merchant_salt + status + total_amount;
  const expected = crypto
    .createHmac("sha256", merchant_key)
    .update(hashStr)
    .digest("base64");

  if (expected !== hash) {
    console.error("PayTR hash mismatch", { expected, received: hash });
    return res.status(400).end(); // OK göndermeyin ki PayTR tekrar denesin
  }

  const userId = merchant_oid.substring(0, 24);

  if (status === "success") {
    // Üyeliği premium’a yükselt ve bitiş tarihini ayarla
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    await userModel.findByIdAndUpdate(userId, {
      plan: "premium",
      planExpiry: nextMonth,
    });
  }
  // Başarısızsa gerekirse log/alert ekleyin

  // 2.c) PayTR’ye sadece düz metin OK dönün
  res.send("OK");
};

export { initiatePaytrPayment, handlePaytrCallback };
