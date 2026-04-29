import { verifyToken } from "../utils/auth.js";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, name }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
