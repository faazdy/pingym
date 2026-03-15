import sql from "../config/db.js";

// Mi locker asignado (cliente de gym)
export const getMyLocker = async (req, res) => {
  try {
    const profileId = req.user.client_profile_id;
    if (!profileId || !req.user.gym_id) {
      return res.json(null);
    }
    const result = await sql`
      SELECT l.*, cl.start_date as assigned_at
      FROM lockers l
      JOIN client_lockers cl ON l.id = cl.locker_id AND cl.client_id = ${profileId} AND cl.end_date IS NULL
      WHERE l.id IS NOT NULL
      LIMIT 1
    `;
    res.json(result.length ? result[0] : null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar lockers de un gym (solo admin)
export const getLockersByGym = async (req, res) => {
  try {
    const { gym_id } = req.params;
    if (req.user.gym_id !== gym_id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    const result = await sql`
      SELECT l.*,
             cl.client_id, cl.start_date as assigned_at, cl.end_date
      FROM lockers l
      LEFT JOIN client_lockers cl ON l.id = cl.locker_id AND cl.end_date IS NULL
      WHERE l.gym_id = ${gym_id}
      ORDER BY l.locker_number
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Asignar casillero a cliente
export const assignLocker = async (req, res) => {
  try {
    const { client_id, locker_id } = req.body;
    if (!client_id || !locker_id) {
      return res.status(400).json({ message: "client_id y locker_id son requeridos" });
    }

    const locker = await sql`
      SELECT id, gym_id, status FROM lockers WHERE id = ${locker_id}
    `;
    if (locker.length === 0) {
      return res.status(404).json({ message: "Casillero no encontrado" });
    }
    if (locker[0].status === "occupied") {
      return res.status(409).json({ message: "El casillero ya está ocupado" });
    }

    const client = await sql`
      SELECT id, gym_id FROM clients_profile WHERE id = ${client_id}
    `;
    if (client.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    if (client[0].gym_id !== locker[0].gym_id) {
      return res.status(400).json({ message: "Cliente y casillero no pertenecen al mismo gym" });
    }

    const start_date = new Date().toISOString().slice(0, 10);

    await sql`
      INSERT INTO client_lockers (client_id, locker_id, start_date)
      VALUES (${client_id}, ${locker_id}, ${start_date})
    `;
    await sql`
      UPDATE lockers SET status = 'occupied' WHERE id = ${locker_id}
    `;

    const result = await sql`
      SELECT l.*, cl.client_id, cl.start_date as assigned_at
      FROM lockers l
      JOIN client_lockers cl ON l.id = cl.locker_id
      WHERE l.id = ${locker_id} AND cl.end_date IS NULL
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Liberar casillero
export const releaseLocker = async (req, res) => {
  try {
    const { client_id, locker_id } = req.body;
    if (!client_id || !locker_id) {
      return res.status(400).json({ message: "client_id y locker_id son requeridos" });
    }

    const assignment = await sql`
      SELECT id FROM client_lockers
      WHERE client_id = ${client_id} AND locker_id = ${locker_id} AND end_date IS NULL
    `;
    if (assignment.length === 0) {
      return res.status(404).json({ message: "No existe asignación activa de este casillero para el cliente" });
    }

    const end_date = new Date().toISOString().slice(0, 10);
    await sql`
      UPDATE client_lockers SET end_date = ${end_date}
      WHERE client_id = ${client_id} AND locker_id = ${locker_id} AND end_date IS NULL
    `;
    await sql`
      UPDATE lockers SET status = 'available' WHERE id = ${locker_id}
    `;

    res.json({ message: "Casillero liberado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear casillero
export const createLocker = async (req, res) => {
  try {
    const gym_id = req.user.gym_id;
    const { locker_number } = req.body;

    if (!locker_number) {
      return res.status(400).json({ message: "Número de casillero requerido" });
    }

    // Verificar que no exista ese número en el gym
    const existing = await sql`
      SELECT id FROM lockers WHERE gym_id = ${gym_id} AND locker_number = ${locker_number}
    `;
    if (existing.length > 0) {
      return res.status(409).json({ message: "Ya existe un casillero con ese número" });
    }

    const result = await sql`
      INSERT INTO lockers (gym_id, locker_number, status)
      VALUES (${gym_id}, ${locker_number}, 'available')
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar casillero
export const deleteLocker = async (req, res) => {
  try {
    const { id } = req.params;

    const locker = await sql`SELECT status FROM lockers WHERE id = ${id}`;
    if (locker.length === 0) {
      return res.status(404).json({ message: "Casillero no encontrado" });
    }
    if (locker[0].status === "occupied") {
      return res.status(409).json({ message: "No se puede eliminar un casillero ocupado" });
    }

    await sql`DELETE FROM lockers WHERE id = ${id}`;
    res.json({ message: "Casillero eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
