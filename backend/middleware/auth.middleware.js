import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, gym_id, client_profile_id }
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

/** Usuario debe tener gym (admin, trainer o cliente de gym). No aplica a usuario independiente. */
export const requireGym = (req, res, next) => {
  if (req.user.gym_id == null) {
    return res.status(403).json({ message: "Acceso denegado. Recurso solo para usuarios vinculados a un gym" });
  }
  next();
};

/** Solo cliente puede acceder y solo a su propio client_id (param). */
export const requireOwnClient = (paramName = "client_id") => (req, res, next) => {
  const clientId = req.params[paramName] || req.body?.[paramName];
  if (!clientId) return res.status(400).json({ message: "client_id requerido" });
  if (req.user.role === "client") {
    if (req.user.client_profile_id !== clientId) {
      return res.status(403).json({ message: "Solo puedes acceder a tus propios datos" });
    }
  }
  next();
};

/** Admin o trainer con gym; o cliente solo si accede a su propio client_id. */
export const requireGymOrOwnClient = (paramName = "client_id") => (req, res, next) => {
  if (["admin", "trainer"].includes(req.user.role)) {
    if (req.user.gym_id == null) return res.status(403).json({ message: "Acceso denegado" });
    return next();
  }
  if (req.user.role === "client") {
    const clientId = req.params[paramName] || req.body?.[paramName];
    if (!clientId || req.user.client_profile_id !== clientId) {
      return res.status(403).json({ message: "Solo puedes acceder a tus propios datos" });
    }
    return next();
  }
  return res.status(403).json({ message: "Acceso denegado" });
};