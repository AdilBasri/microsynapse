import mailModel from "../model/mailModel.js";
import userModel from "../model/usersModel.js";
import subscriptionModel from "../model/subscriptionModel.js";

const getAllSubscriptions = async (req, res) => {
  const user = await userModel.findById(req.userId);
  if (!user)
    return res
      .status(404)
      .json({ status: false, message: "Kullanıcı bulunamadı." });

  const external = await mailModel
    .find({ mail_address: user.email })
    .select("company_name price date selected");
  const internal = await subscriptionModel
    .find({ userId: req.userId })
    .select("company_name price date selected subs_type category"); // subs_type burada olmalı!

  return res.json({
    status: true,
    subscriptions: [...external, ...internal],
  });
};

const getUserSubscriptionData = async (req, res) => {
  let userId = req.userId;

  let user = await userModel.findOne({ _id: userId });
  if (!user) {
    return res
      .status(404)
      .json({ status: false, message: "Kullanıcı bulunamadı." });
  }

  const userEmail = user.email;

  const externalSubscriptions = await mailModel
    .find({ mail_address: userEmail })
    .select("company_name price date selected");

  const internalSubscriptions = await subscriptionModel
    .find({ userId: userId })
    .select("company_name price date selected subs_type");

  let subscriptions;
  if (user.plan === "normal") {
    // sadece seçili olanları al
    const selExternal = externalSubscriptions.filter((s) => s.selected);
    const selInternal = internalSubscriptions.filter((s) => s.selected);
    // ilk 3’ü döndür
    subscriptions = [...selExternal, ...selInternal].slice(0, 3);
  } else {
    // premium: hepsi
    subscriptions = [...externalSubscriptions, ...internalSubscriptions];
  }

  if (subscriptions.length === 0) {
    return res
      .status(404)
      .json({ status: false, message: "Abonelik bulunamadı." });
  }

  return res.json({
    status: true,
    subscriptions,
    showAd: user.plan === "normal",
  });
};

const createSubscription = async (req, res) => {
  let userId = req.userId;

  let user = await userModel.findOne({ _id: userId });
  if (!user) {
    return res
      .status(404)
      .json({ status: false, message: "Kullanıcı bulunamadı." });
  }

  if (user.plan === "normal") {
    const count = await subscriptionModel.countDocuments({ userId });
    if (count >= 3) {
      return res.status(403).json({
        status: false,
        message: "Normal üyelik: en fazla 3 manuel abonelik ekleyebilirsiniz.",
      });
    }
  }

  let company_name = req.body.company_name;
  let price = req.body.price;
  let date = req.body.date;
  let subs_date = req.body.subs_date;
  let subs_type = req.body.subs_type;

  if (!company_name || !price || !date) {
    return res.status(400).json({ status: false, message: "Eksik bilgi." });
  }

  const existingSubscription = await subscriptionModel.findOne({
    company_name,
    price,
    date,
  });

  if (existingSubscription) {
    return res.status(400).json({
      status: false,
      message: "Bu abonelik zaten mevcut.",
    });
  }

  try {
    const subscription = await subscriptionModel.create({
      userId,
      company_name,
      price,
      date,
      subs_date,
      subs_type,
    });

    return res.status(201).json({
      status: true,
      message: "Abonelik başarıyla kaydedildi.",
      subscription,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: false,
      message: "Bir hata oluştu, lütfen tekrar deneyin.",
    });
  }
};

const toggleSelectSubscription = async (req, res) => {
  const { subscriptionId, select } = req.body;
  const userId = req.userId;

  const user = await userModel.findById(userId);
  if (!user)
    return res
      .status(404)
      .json({ status: false, message: "Kullanıcı bulunamadı." });

  if (user.plan === "normal" && select) {
    const mCount = await subscriptionModel.countDocuments({
      userId,
      selected: true,
    });
    const eCount = await mailModel.countDocuments({
      mail_address: user.email,
      selected: true,
    });
    if (mCount + eCount >= 3) {
      return res.status(403).json({
        status: false,
        message: "Normal üyelik: en fazla 3 abonelik seçebilirsiniz.",
      });
    }
  }

  // 1) Güncelleme: önce manuel koleksiyon, değilse mail koleksiyonu
  let updated = await subscriptionModel.findOneAndUpdate(
    { _id: subscriptionId, userId },
    { selected: select },
    { new: true }
  );
  if (!updated) {
    updated = await mailModel.findOneAndUpdate(
      { _id: subscriptionId, mail_address: user.email },
      { selected: select },
      { new: true }
    );
  }

  if (!updated) {
    return res
      .status(404)
      .json({ status: false, message: "Abonelik bulunamadı." });
  }

  // 2) Yanıt
  res.json({ status: true, subscription: updated });
};

const deleteSubscription = async (req, res) => {
  const userId = req.userId;
  const subscriptionId = req.params.id;

  // 1. Kullanıcının dahili abonelik koleksiyonunda ara
  const internalSub = await subscriptionModel.findOne({
    _id: subscriptionId,
    userId,
  });

  if (internalSub) {
    await subscriptionModel.deleteOne({ _id: subscriptionId, userId });
    return res.json({
      status: true,
      message: "Dahili abonelik başarıyla silindi.",
      deletedFrom: "internal",
    });
  }

  // 2. Dahili koleksiyonda yoksa mailModel'de ara
  //    (kullanıcının e-posta adresini alıyoruz)
  const user = await userModel.findById(userId);
  if (!user) {
    return res
      .status(404)
      .json({ status: false, message: "Kullanıcı bulunamadı." });
  }

  const externalSub = await mailModel.findOne({
    _id: subscriptionId,
    mail_address: user.email,
  });

  if (externalSub) {
    await mailModel.deleteOne({
      _id: subscriptionId,
      mail_address: user.email,
    });
    return res.json({
      status: true,
      message: "Harici abonelik başarıyla silindi.",
      deletedFrom: "external",
    });
  }

  // 3. Hiçbir yerde bulunamadıysa
  return res
    .status(404)
    .json({ status: false, message: "Abonelik bulunamadı." });
};

const setNotification = async (req, res) => {
  const userId = req.userId;
  const {
    instantNotifications,
    lowPriority,
    mediumPriority,
    highPriority,
    daySettings
  } = req.body;

  // Basit validasyon
  if (
    !daySettings ||
    !Number.isInteger(daySettings.low) ||
    !Number.isInteger(daySettings.medium) ||
    !Number.isInteger(daySettings.high)
  ) {
    return res.status(400).json({
      status: false,
      message: "Geçersiz gün ayarları.",
    });
  }

  // Kullanıcıyı bul ve ayarları güncelle
  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({ status: false, message: "Kullanıcı bulunamadı." });
  }

  user.notificationSettings = {
    instantNotifications,
    lowPriority,
    mediumPriority,
    highPriority,
    daySettings,
  };
  await user.save();

  res.json({
    status: true,
    message: "Bildirim ayarları kaydedildi.",
    notificationSettings: user.notificationSettings,
  });
};

export {
  getUserSubscriptionData,
  createSubscription,
  deleteSubscription,
  toggleSelectSubscription,
  getAllSubscriptions,
  setNotification,
};
