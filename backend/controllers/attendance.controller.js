import sql from "../config/db.js";

// Check-in de cliente
export const checkIn = async (req, res) => {
  try {
    const gym_id = req.user.gym_id;
    const { client_id } = req.body;
    if (!client_id) {
      return res.status(400).json({ message: "client_id es requerido" });
    }

    const client = await sql`
      SELECT id, gym_id FROM clients_profile WHERE id = ${client_id}
    `;
    if (client.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    if (client[0].gym_id !== gym_id) {
      return res.status(403).json({ message: "Cliente no pertenece a este gym" });
    }

    const result = await sql`
      INSERT INTO attendance (gym_id, client_id)
      VALUES (${gym_id}, ${client_id})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    console.log("ERROR DETALLADO:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mi asistencia (cliente de gym: solo sus registros)
export const getMyAttendance = async (req, res) => {
  try {
    const profileId = req.user.client_profile_id;
    if (!profileId || !req.user.gym_id) {
      return res.json([]);
    }
    const result = await sql`
      SELECT a.*, u.name as client_name, u.email
      FROM attendance a
      JOIN clients_profile cp ON a.client_id = cp.id
      JOIN users u ON cp.user_id = u.id
      WHERE a.client_id = ${profileId}
      ORDER BY a.check_in DESC
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Historial de asistencia: por día o por semana (admin/trainer)
export const getAttendanceHistory = async (req, res) => {
  try {
    const { gym_id } = req.params;
    if (req.user.gym_id !== gym_id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    const { day, week } = req.query;

    if (day) {
      const result = await sql`
        SELECT a.*, cp.id as client_profile_id,
               u.name as client_name, u.email
        FROM attendance a
        JOIN clients_profile cp ON a.client_id = cp.id
        JOIN users u ON cp.user_id = u.id
        WHERE a.gym_id = ${gym_id}
          AND a.check_in::date = ${day}
        ORDER BY a.check_in DESC
      `;
      return res.json(result);
    }

    if (week) {
      // Formato YYYY-Www (ej: 2025-W11)
      const [y, w] = week.split("-W").map(Number);
      if (!y || !w) {
        return res.status(400).json({ message: "Formato week debe ser YYYY-Wnn (ej: 2025-W11)" });
      }
      const startOfWeek = new Date(y, 0, 1 + (w - 1) * 7);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      const startStr = startOfWeek.toISOString().slice(0, 10);
      const endStr = endOfWeek.toISOString().slice(0, 10);

      const result = await sql`
        SELECT a.*, cp.id as client_profile_id,
               u.name as client_name, u.email
        FROM attendance a
        JOIN clients_profile cp ON a.client_id = cp.id
        JOIN users u ON cp.user_id = u.id
        WHERE a.gym_id = ${gym_id}
          AND a.check_in::date >= ${startStr}
          AND a.check_in::date <= ${endStr}
        ORDER BY a.check_in DESC
      `;
      return res.json(result);
    }

    // Sin filtro: últimos 30 días
    const defaultEnd = new Date();
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    const result = await sql`
      SELECT a.*, cp.id as client_profile_id,
             u.name as client_name, u.email
      FROM attendance a
      JOIN clients_profile cp ON a.client_id = cp.id
      JOIN users u ON cp.user_id = u.id
      WHERE a.gym_id = ${gym_id}
        AND a.check_in::date >= ${defaultStart.toISOString().slice(0, 10)}
        AND a.check_in::date <= ${defaultEnd.toISOString().slice(0, 10)}
      ORDER BY a.check_in DESC
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
