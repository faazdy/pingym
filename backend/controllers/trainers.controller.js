import sql from "../config/db.js";
import bcrypt from "bcrypt";

// Listar trainers del gym
export const getTrainers = async (req, res) => {
  try {
    const gym_id = req.user.gym_id;
    const result = await sql`
      SELECT id, name, email, role, created_at
      FROM users
      WHERE gym_id = ${gym_id} AND role = 'trainer'
      ORDER BY created_at DESC
    `;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Registrar trainer (solo admin)
export const registerTrainer = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const gym_id = req.user.gym_id;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nombre, email y contraseña son requeridos" });
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql`
      INSERT INTO users (gym_id, name, email, password, role)
      VALUES (${gym_id}, ${name}, ${email}, ${hashedPassword}, 'trainer')
      RETURNING id, name, email, role, gym_id, created_at
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar trainer
export const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const gym_id = req.user.gym_id;

    const result = await sql`
      UPDATE users
      SET name = ${name}, email = ${email}
      WHERE id = ${id} AND gym_id = ${gym_id} AND role = 'trainer'
      RETURNING id, name, email, role
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Trainer no encontrado" });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar trainer
export const deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const gym_id = req.user.gym_id;

    const result = await sql`
      DELETE FROM users
      WHERE id = ${id} AND gym_id = ${gym_id} AND role = 'trainer'
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Trainer no encontrado" });
    }

    res.json({ message: "Trainer eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};