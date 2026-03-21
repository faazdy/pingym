import sql from "../config/db.js";
import bcrypt from "bcrypt";

export const createGymWithAdmin = async (req, res) => {
  try {
    const { gym, admin } = req.body;
    const gymName = gym?.name?.trim();
    const address = gym?.address?.trim() || null;
    const phone = gym?.phone?.trim() || null;

    const adminName = admin?.name?.trim();
    const adminEmail = admin?.email?.trim()?.toLowerCase();
    const adminPassword = admin?.password;

    if (!gymName || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        message: "Gym (nombre), y admin (nombre, email, contraseña) son requeridos",
      });
    }

    const existingEmail = await sql`SELECT id FROM users WHERE email = ${adminEmail}`;
    if (existingEmail.length > 0) {
      return res.status(409).json({ message: "El email del admin ya está registrado" });
    }

    const existingGym = await sql`SELECT id FROM gyms WHERE name = ${gymName}`;
    if (existingGym.length > 0) {
      return res.status(409).json({ message: "Ya existe un gym con ese nombre" });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const payload = await sql.begin(async (tx) => {
      const newGym = await tx`
        INSERT INTO gyms (name, address, phone)
        VALUES (${gymName}, ${address}, ${phone})
        RETURNING id, name, address, phone, created_at
      `;
      const newUser = await tx`
        INSERT INTO users (gym_id, name, email, password, role)
        VALUES (${newGym[0].id}, ${adminName}, ${adminEmail}, ${hashedPassword}, 'admin')
        RETURNING id, name, email, role, gym_id
      `;
      return { gym: newGym[0], admin: newUser[0] };
    });

    res.status(201).json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllGyms = async (req, res) => {
  try {
    const rows = await sql`
      SELECT
        g.id,
        g.name,
        g.address,
        g.phone,
        g.created_at,
        (
          SELECT json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email
          )
          FROM users u
          WHERE u.gym_id = g.id AND u.role = 'admin'
          ORDER BY u.created_at ASC
          LIMIT 1
        ) AS admin
      FROM gyms g
      ORDER BY g.created_at DESC
    `;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
