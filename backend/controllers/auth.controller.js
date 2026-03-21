import sql from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ─── Register público ───────────────────────────────────────────
// Caso 1: Cliente independiente (sin gym en el body)
// Caso 2: Cliente vinculado a gym existente (gym = UUID string, ej. registro por QR)
export const register = async (req, res) => {
  try {
    const { name, email, password, gym } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nombre, email y contraseña son requeridos" });
    }

    // Validar email duplicado
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Caso 1: sin gym → usuario independiente (perfil con gym_id null)
    if (!gym) {
      const result = await sql`
        INSERT INTO users (name, email, password, role)
        VALUES (${name}, ${email}, ${hashedPassword}, 'client')
        RETURNING id, name, email, role
      `;
      const user = result[0];
      await sql`
        INSERT INTO clients_profile (gym_id, user_id)
        VALUES (NULL, ${user.id})
      `;
      return res.status(201).json(user);
    }

    if (gym != null && typeof gym !== "string") {
      return res.status(400).json({
        message: "Formato inválido: para vincularte a un gym envía el id del gym como texto (UUID)",
      });
    }

    // Caso 2: gym (string UUID) → registro desde QR, cliente de un gym existente
    if (typeof gym === "string") {
      const gymExists = await sql`SELECT id FROM gyms WHERE id = ${gym}`;
      if (gymExists.length === 0) {
        return res.status(400).json({ message: "Gym no encontrado" });
      }
      const result = await sql`
        INSERT INTO users (gym_id, name, email, password, role)
        VALUES (${gym}, ${name}, ${email}, ${hashedPassword}, 'client')
        RETURNING id, name, email, role, gym_id
      `;
      const user = result[0];
      await sql`
        INSERT INTO clients_profile (gym_id, user_id)
        VALUES (${gym}, ${user.id})
      `;
      return res.status(201).json({ ...user, profile: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Datos mínimos del gym para pantalla de registro por QR (público). */
export const getGymPublicInfo = async (req, res) => {
  try {
    const { gym_id } = req.params;
    const gym = await sql`
      SELECT id, name FROM gyms WHERE id = ${gym_id}
    `;
    if (gym.length === 0) {
      return res.status(404).json({ message: "Gym no encontrado" });
    }
    res.json(gym[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Register interno (solo admins desde el dashboard) ──────────
// Crea trainers o clients vinculados al gym del admin
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      eps,
      emergency_contact,
    } = req.body;
    const gym_id = req.user.gym_id; // viene del token del admin

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Nombre, email, contraseña y rol son requeridos" });
    }

    if (!["trainer", "client"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Rol inválido. Solo se permite trainer o client" });
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql`
      INSERT INTO users (gym_id, name, email, password, role)
      VALUES (${gym_id}, ${name}, ${email}, ${hashedPassword}, ${role})
      RETURNING id, name, email, role, gym_id
    `;

    const user = result[0];

    // Si es client, crear perfil automáticamente
    if (role === "client") {
      const profile = await sql`
        INSERT INTO clients_profile (gym_id, user_id, phone, address, eps, emergency_contact)
        VALUES (${gym_id}, ${user.id}, ${phone || null}, ${address || null}, ${eps || null}, ${emergency_contact || null})
        RETURNING id, user_id, phone, address, eps, emergency_contact
      `;
      user.profile = profile[0];
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña requeridos" });
    }

    const result = await sql`
      SELECT u.*, g.name as gym_name, cp.id as client_profile_id
      FROM users u
      LEFT JOIN gyms g ON u.gym_id = g.id
      LEFT JOIN clients_profile cp ON cp.user_id = u.id
      WHERE u.email = ${email}
    `;

    if (result.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const user = result[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        gym_id: user.gym_id ?? null,
        client_profile_id: user.client_profile_id ?? null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        gym_id: user.gym_id ?? null,
        gym_name: user.gym_name ?? null,
        client_profile_id: user.client_profile_id ?? null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── CRUD Gym ────────────────────────────────────────────────────
export const updateGym = async (req, res) => {
  try {
    const { id_gym } = req.params;
    const { name_gym, address, phone } = req.body;

    const result = await sql`
      UPDATE gyms
      SET name = ${name_gym}, address = ${address}, phone = ${phone}
      WHERE id = ${id_gym}
      RETURNING id, name, address, phone
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Gym no encontrado" });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteGym = async (req, res) => {
  try {
    const { id_gym } = req.params;

    const result =
      await sql`DELETE FROM gyms WHERE id = ${id_gym} RETURNING id`;

    if (result.length === 0) {
      return res.status(404).json({ message: "Gym no encontrado" });
    }

    res.json({ message: "Gym eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── CRUD Users ──────────────────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { id_user } = req.params;
    const { name, email } = req.body;

    const result = await sql`
      UPDATE users
      SET name = ${name}, email = ${email}
      WHERE id = ${id_user}
      RETURNING id, name, email, role
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id_user } = req.params;

    const result =
      await sql`DELETE FROM users WHERE id = ${id_user} RETURNING id`;

    if (result.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
