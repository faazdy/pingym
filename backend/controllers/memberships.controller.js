import sql from "../config/db.js";

// Listar membresías de un gym (solo admin)
export const getMembershipsByGym = async (req, res) => {
  try {
    const { gym_id } = req.params;
    if (req.user.gym_id !== gym_id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    const result = await sql`
      SELECT * FROM memberships
      WHERE gym_id = ${gym_id}
      ORDER BY name
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear membresía (admin)
export const createMembership = async (req, res) => {
  try {
    const gym_id = req.user.gym_id;
    const { name, duration_days } = req.body;
    if (!name || duration_days == null) {
      return res.status(400).json({ message: "Nombre y duración (días) son requeridos" });
    }
    const result = await sql`
      INSERT INTO memberships (gym_id, name, duration_days)
      VALUES (${gym_id}, ${name}, ${duration_days})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Asignar membresía a cliente
export const assignMembershipToClient = async (req, res) => {
  try {
    const { client_id, membership_id } = req.body;
    if (!client_id || !membership_id) {
      return res.status(400).json({ message: "client_id y membership_id son requeridos" });
    }

    const membership = await sql`
      SELECT id, duration_days, gym_id FROM memberships WHERE id = ${membership_id}
    `;
    if (membership.length === 0) {
      return res.status(404).json({ message: "Membresía no encontrada" });
    }

    const client = await sql`
      SELECT id, gym_id FROM clients_profile WHERE id = ${client_id}
    `;
    if (client.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    if (client[0].gym_id !== membership[0].gym_id) {
      return res.status(400).json({ message: "Cliente y membresía no pertenecen al mismo gym" });
    }

    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setDate(end_date.getDate() + membership[0].duration_days);

    await sql`
      UPDATE client_memberships 
      SET status = 'expired'
      WHERE client_id = ${client_id} AND status = 'active'
    `;

    const result = await sql`
      INSERT INTO client_memberships (client_id, membership_id, start_date, end_date, status)
      VALUES (${client_id}, ${membership_id}, ${start_date.toISOString().slice(0, 10)}, ${end_date.toISOString().slice(0, 10)}, 'active')
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Membresías de un cliente con días restantes; marcar expired si ya venció
export const getClientMemberships = async (req, res) => {
  try {
    const { client_id } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    // Marcar como expired las que ya vencieron
    await sql`
      UPDATE client_memberships
      SET status = 'expired'
      WHERE client_id = ${client_id} AND status = 'active' AND end_date < ${today}
    `;

    const result = await sql`
      SELECT cm.*, m.name as membership_name, m.duration_days,
             (cm.end_date::date - ${today}::date) as days_remaining
      FROM client_memberships cm
      JOIN memberships m ON cm.membership_id = m.id
      WHERE cm.client_id = ${client_id}
      ORDER BY cm.end_date DESC
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Actualizar membresía
export const updateMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration_days } = req.body;

    const result = await sql`
      UPDATE memberships
      SET name = ${name}, duration_days = ${duration_days}
      WHERE id = ${id} AND gym_id = ${req.user.gym_id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Membresía no encontrada" });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar membresía
export const deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      DELETE FROM memberships
      WHERE id = ${id} AND gym_id = ${req.user.gym_id}
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Membresía no encontrada" });
    }

    res.json({ message: "Membresía eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};