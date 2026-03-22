import sql from "../config/db.js";

// Listar rutinas de un gym (admin o trainer del mismo gym)
export const getRoutinesByGym = async (req, res) => {
  try {
    const { gym_id } = req.params;
    if (req.user.gym_id !== gym_id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    const result = await sql`
      SELECT r.*, u.name as trainer_name
      FROM routines r
      LEFT JOIN users u ON r.trainer_id = u.id
      WHERE r.gym_id = ${gym_id}
      ORDER BY r.created_at DESC
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear rutina (admin/trainer con gym, o usuario independiente con gym_id null)
export const createRoutine = async (req, res) => {
  try {
    const gym_id = req.user.gym_id ?? null;
    const { name, description, trainer_id, exercises } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Nombre de rutina es requerido" });
    }
    const effectiveTrainerId = gym_id ? (trainer_id || req.user.id) : req.user.id;

    const routine = await sql`
      INSERT INTO routines (gym_id, name, description, trainer_id)
      VALUES (${gym_id}, ${name}, ${description || null}, ${effectiveTrainerId})
      RETURNING *
    `;
    const routineId = routine[0].id;

    if (Array.isArray(exercises) && exercises.length > 0) {
      for (const ex of exercises) {
        await sql`
          INSERT INTO routine_exercises (routine_id, exercise_id, sets, reps, suggested_weight)
          VALUES (${routineId}, ${ex.exercise_id}, ${ex.sets ?? null}, ${ex.reps ?? null}, ${ex.suggested_weight ?? null})
        `;
      }
    }

    const full = await sql`
      SELECT * FROM routines WHERE id = ${routineId}
    `;
    res.status(201).json(full[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ejercicios de una rutina (solo si puede ver la rutina)
export const getRoutineExercises = async (req, res) => {
  try {
    const { routine_id } = req.params;
    const routine = await sql`SELECT id, gym_id, trainer_id FROM routines WHERE id = ${routine_id}`;
    if (routine.length === 0) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }
    const r = routine[0];
    const canAccess =
      (r.gym_id && r.gym_id === req.user.gym_id) ||
      (req.user.client_profile_id && (await sql`SELECT 1 FROM client_routines WHERE routine_id = ${routine_id} AND client_id = ${req.user.client_profile_id}`).length > 0) ||
      (!r.gym_id && r.trainer_id === req.user.id);
    if (!canAccess) {
      return res.status(403).json({ message: "No puedes ver esta rutina" });
    }
    const result = await sql`
      SELECT re.*, e.name as exercise_name, e.muscle_group, e.description as exercise_description
      FROM routine_exercises re
      JOIN exercises e ON re.exercise_id = e.id
      WHERE re.routine_id = ${routine_id}
      ORDER BY re.id
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Asignar rutina a cliente
export const assignRoutineToClient = async (req, res) => {
  try {
    const { client_id, routine_id } = req.body;
    if (!client_id || !routine_id) {
      return res.status(400).json({ message: "client_id y routine_id son requeridos" });
    }
    const existing = await sql`
      SELECT id FROM client_routines WHERE client_id = ${client_id} AND routine_id = ${routine_id}
    `;
    if (existing.length > 0) {
      return res.status(409).json({ message: "La rutina ya está asignada a este cliente" });
    }
    const result = await sql`
      INSERT INTO client_routines (client_id, routine_id)
      VALUES (${client_id}, ${routine_id})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Rutinas asignadas a un cliente
export const getClientRoutines = async (req, res) => {
  try {
    const { client_id } = req.params;
    const result = await sql`
      SELECT cr.*, r.name as routine_name, r.description, u.name as trainer_name
      FROM client_routines cr
      JOIN routines r ON cr.routine_id = r.id
      LEFT JOIN users u ON r.trainer_id = u.id
      WHERE cr.client_id = ${client_id}
      ORDER BY cr.assigned_at DESC
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mis rutinas: asignadas a mí o creadas por mí (usuario independiente o cliente)
export const getMyRoutines = async (req, res) => {
  try {
    const profileId = req.user.client_profile_id;
    if (!profileId) {
      return res.json([]);
    }
    const result = await sql`
      SELECT r.*, u.name as trainer_name, cr.assigned_at
      FROM routines r
      LEFT JOIN users u ON r.trainer_id = u.id
      LEFT JOIN client_routines cr ON cr.routine_id = r.id AND cr.client_id = ${profileId}
      WHERE r.trainer_id = ${req.user.id}        -- ← rutinas creadas por el usuario (con o sin gym)
        OR cr.client_id = ${profileId}           -- ← rutinas asignadas por el trainer
      ORDER BY r.created_at DESC
    `;
    const seen = new Set();
    const unique = result.filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });
    res.json(unique);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Agregar ejercicio a una rutina existente
export const addExerciseToRoutine = async (req, res) => {
  try {
    const { routine_id } = req.params;
    const { exercise_id, sets, reps, suggested_weight } = req.body;

    if (!exercise_id) {
      return res.status(400).json({ message: "exercise_id es requerido" });
    }

    // Verificar que la rutina pertenece al gym del usuario
    const routine = await sql`SELECT gym_id FROM routines WHERE id = ${routine_id}`;
    if (routine.length === 0) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }
    const isGymMatch = routine[0].gym_id && routine[0].gym_id === req.user.gym_id;
    const isOwner = !routine[0].gym_id && routine[0].trainer_id === req.user.id;

    if (!isGymMatch && !isOwner) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const result = await sql`
      INSERT INTO routine_exercises (routine_id, exercise_id, sets, reps, suggested_weight)
      VALUES (${routine_id}, ${exercise_id}, ${sets ?? null}, ${reps ?? null}, ${suggested_weight ?? null})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar ejercicio de una rutina
export const removeExerciseFromRoutine = async (req, res) => {
  try {
    const { routine_id, exercise_id } = req.params;

    const result = await sql`
      DELETE FROM routine_exercises
      WHERE routine_id = ${routine_id} AND id = ${exercise_id}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }

    res.json({ message: "Ejercicio eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar ejercicios disponibles para el usuario autenticado (con ownership)
// — Misma lógica que exercises.controller.js getExercises —
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
        ORDER BY e.muscle_group, e.name
      `;
    } else {
      result = await sql`
        SELECT e.*, u.name AS created_by_name
        FROM exercises e
        LEFT JOIN users u ON e.created_by = u.id
        WHERE e.created_by = ${userId}
        ORDER BY e.muscle_group, e.name
      `;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar rutina (admin/trainer del gym o usuario independiente dueño)
export const deleteRoutine = async (req, res) => {
  try {
    const { routine_id } = req.params;
    const routine = await sql`SELECT * FROM routines WHERE id = ${routine_id}`;

    if (routine.length === 0) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }

    const r = routine[0];
    const canDelete =
      (r.gym_id && r.gym_id === req.user.gym_id && ["admin", "trainer"].includes(req.user.role)) ||
      (!r.gym_id && r.trainer_id === req.user.id);

    if (!canDelete) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    await sql`DELETE FROM routines WHERE id = ${routine_id}`;
    res.json({ message: "Rutina eliminada" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
};

// Desasignar rutina de un cliente
export const unassignRoutineFromClient = async (req, res) => {
  try {
    const { client_id, routine_id } = req.body;
    if (!client_id || !routine_id) {
      return res.status(400).json({ message: "client_id y routine_id son requeridos" });
    }

    const result = await sql`
      DELETE FROM client_routines
      WHERE client_id = ${client_id} AND routine_id = ${routine_id}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Asignación no encontrada" });
    }

    res.json({ message: "Rutina desasignada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};