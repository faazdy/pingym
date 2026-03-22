import sql from "../config/db.js";

// ─── Visibilidad: ejercicios del gym del usuario + los propios ───────────────
export const getExercises = async (req, res) => {
  try {
    const { id: userId, gym_id } = req.user;

    let result;
    if (gym_id) {
      result = await sql`
        SELECT e.*, u.name AS created_by_name
        FROM exercises e
        LEFT JOIN users u ON e.created_by = u.id
        WHERE e.gym_id = ${gym_id}
          OR e.created_by = ${userId}
          OR (e.created_by IS NULL AND e.gym_id IS NULL)  -- ← ejercicios globales
        ORDER BY e.muscle_group, e.name
      `;
    } else {
      result = await sql`
        SELECT e.*, u.name AS created_by_name
        FROM exercises e
        LEFT JOIN users u ON e.created_by = u.id
        WHERE e.created_by = ${userId}
          OR (e.created_by IS NULL AND e.gym_id IS NULL)  -- ← ejercicios globales
        ORDER BY e.muscle_group, e.name
      `;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Crear ejercicio (cualquier usuario autenticado) ─────────────────────────
export const createExercise = async (req, res) => {
  try {
    const { name, muscle_group, description } = req.body;
    const { id: userId, gym_id } = req.user;

    if (!name) {
      return res.status(400).json({ message: "El nombre del ejercicio es requerido" });
    }

    const result = await sql`
      INSERT INTO exercises (name, muscle_group, description, created_by, gym_id)
      VALUES (
        ${name},
        ${muscle_group || null},
        ${description || null},
        ${userId},
        ${gym_id || null}
      )
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Actualizar ejercicio (solo propietario) ─────────────────────────────────
export const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, muscle_group, description } = req.body;
    const { id: userId, gym_id, role } = req.user;

    // Obtener ejercicio existente
    const existing = await sql`SELECT * FROM exercises WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }

    const exercise = existing[0];

    // Verificar permisos:
    // - El creador puede siempre editar el suyo
    // - Admin/trainer del mismo gym pueden editar ejercicios del gym
    const isOwner = exercise.created_by === userId;
    const isGymStaff =
      gym_id &&
      exercise.gym_id === gym_id &&
      ["admin", "trainer"].includes(role);

    if (!isOwner && !isGymStaff) {
      return res.status(403).json({ message: "No tienes permisos para editar este ejercicio" });
    }

    const result = await sql`
      UPDATE exercises
      SET
        name          = ${name ?? exercise.name},
        muscle_group  = ${muscle_group ?? exercise.muscle_group},
        description   = ${description ?? exercise.description}
      WHERE id = ${id}
      RETURNING *
    `;

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Eliminar ejercicio (solo propietario) ───────────────────────────────────
export const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, gym_id, role } = req.user;

    // Obtener ejercicio existente
    const existing = await sql`SELECT * FROM exercises WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }

    const exercise = existing[0];

    // Verificar permisos: creador o admin/trainer del mismo gym
    const isOwner = exercise.created_by === userId;
    const isGymAdmin =
      gym_id &&
      exercise.gym_id === gym_id &&
      role === "admin";

    if (!isOwner && !isGymAdmin) {
      return res.status(403).json({ message: "No tienes permisos para eliminar este ejercicio" });
    }

    await sql`DELETE FROM exercises WHERE id = ${id}`;

    res.json({ message: "Ejercicio eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
