import sql from "../config/db.js";
// progress.controller

// Registrar peso y reps por ejercicio (admin/trainer cualquier cliente; cliente solo el propio)
export const recordProgress = async (req, res) => {
  try {
    const { client_id, exercise_id, weight, reps } = req.body;
    if (!client_id || !exercise_id) {
      return res.status(400).json({ message: "client_id y exercise_id son requeridos" });
    }
    if (weight == null && reps == null) {
      return res.status(400).json({ message: "Indica al menos weight o reps" });
    }
    if (req.user.role === "client" && req.user.client_profile_id !== client_id) {
      return res.status(403).json({ message: "Solo puedes registrar tu propio progreso" });
    }

    const result = await sql`
      INSERT INTO exercise_progress (client_id, exercise_id, weight, reps)
      VALUES (${client_id}, ${exercise_id}, ${weight ?? null}, ${reps ?? null})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Historial de progreso de un cliente (opcional: filtrar por exercise_id)
export const getClientProgress = async (req, res) => {
  try {
    const { client_id } = req.params;
    const { exercise_id } = req.query;

    if (exercise_id) {
      const result = await sql`
        SELECT ep.*, e.name as exercise_name, e.muscle_group
        FROM exercise_progress ep
        JOIN exercises e ON ep.exercise_id = e.id
        WHERE ep.client_id = ${client_id} AND ep.exercise_id = ${exercise_id}
        ORDER BY ep.created_at DESC
      `;
      return res.json(result);
    }

    const result = await sql`
      SELECT ep.*, e.name as exercise_name, e.muscle_group
      FROM exercise_progress ep
      JOIN exercises e ON ep.exercise_id = e.id
      WHERE ep.client_id = ${client_id}
      ORDER BY ep.created_at DESC
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
