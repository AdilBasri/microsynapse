import SessionModel from "../model/sessionsModel.js";

// Çıkış yap: mevcut oturumu sil
const logoutUser = async (req, res) => {
  const sessionId = req.sessionId;
  const userId = req.userId;

  try {
    await SessionModel.findOneAndDelete({ _id: sessionId, userId });
    return res.json({ status: true, message: "Başarıyla çıkış yapıldı." });
  } catch (err) {
    return res
      .status(500)
      .json({ status: false, message: "Çıkış yapılamadı." });
  }
};

const listSessions = async (req, res) => {
  const userId = req.userId;

  const sessions = await SessionModel.find({ userId })
    .sort({ createdAt: -1 })
    .select("_id userAgent createdAt");

  return res.json({ status: true, sessions });
};

export { listSessions, logoutUser };
