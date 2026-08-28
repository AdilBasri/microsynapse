import jwt from "jsonwebtoken";
import SessionModel from "../model/sessionsModel.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.json({ status: false, message: "Hatalı giriş.", type: "login" });
  }

  const token = authHeader.split(" ")[1];

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET); // Token çözümle
  } catch (e) {
    console.error(e);
    return res
      .status(401)
      .json({ status: false, message: "Token geçersiz.", type: "login" });
  }

  const userId = payload.userId;
  const sessionId = payload.sessionId;

  // Oturumun hâlâ geçerli olduğunu kontrol et
  const session = await SessionModel.findOne({ _id: sessionId, userId });
  if (!session) {
    return res
      .status(401)
      .json({ status: false, message: "Oturum geçersiz.", type: "login" });
  }

  req.userId = userId;
  req.sessionId = sessionId;

  next();
};

export default authMiddleware;
