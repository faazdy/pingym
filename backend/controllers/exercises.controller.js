import sql from "../config/db.js";

// Listar todos los ejercicios (catálogo global)
export const getExercises = async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM exercises
      ORDER BY muscle_group, name
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear ejercicio (opcional, para admin)
export const createExercise = async (req, res) => {
  try {
    const { name, muscle_group, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "El nombre del ejercicio es requerido" });
    }
    const result = await sql`
      INSERT INTO exercises (name, muscle_group, description)
      VALUES (${name}, ${muscle_group || null}, ${description || null})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
