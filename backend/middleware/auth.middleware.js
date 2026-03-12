import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, gym_id }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol admin" });
  }
  next();
};

export const isAdminOrTrainer = (req, res, next) => {
  if (!["admin", "trainer"].includes(req.user.role)) {
    return res.status(403).json({ message: "Acceso denegado" });
  }
  next();
};