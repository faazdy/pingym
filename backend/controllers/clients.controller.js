import sql from "../config/db.js";

// Obtener todos los clientes de un gym (admin o trainer del mismo gym)
export const getClients = async (req, res) => {
  try {
    const { gym_id } = req.params;
    if (req.user.gym_id !== gym_id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const result = await sql`
      SELECT 
        cp.*,
        u.name,
        u.email,
        cm.status AS membership_status,
        cm.end_date AS membership_end_date,
        GREATEST(0, (cm.end_date - CURRENT_DATE)) AS days_remaining
      FROM clients_profile cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN client_memberships cm 
        ON cm.client_id = cp.id 
        AND cm.status = 'active'
      WHERE cp.gym_id = ${gym_id}
      ORDER BY cp.created_at DESC
    `;

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un cliente por id (admin/trainer mismo gym, o cliente solo el propio)
export const getClientById = async (req, res) => {
  try {
    const { id_client } = req.params;
    if (req.user.role === "client" && req.user.client_profile_id !== id_client) {
      return res.status(403).json({ message: "Solo puedes ver tu propio perfil" });
    }
    const result = await sql`
      SELECT cp.*, u.name, u.email 
      FROM clients_profile cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.id = ${id_client}
    `;
    if (result.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    const row = result[0];
    if (["admin", "trainer"].includes(req.user.role) && row.gym_id !== req.user.gym_id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar perfil de cliente
export const updateClient = async (req, res) => {
  try {
    const { id_client } = req.params;
    const { phone, address, eps, emergency_contact } = req.body;

    const result = await sql`
      UPDATE clients_profile
      SET phone = ${phone}, address = ${address}, 
          eps = ${eps}, emergency_contact = ${emergency_contact}
      WHERE id = ${id_client}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Borrar cliente — borra el user y en cascada el client_profile
export const deleteClient = async (req, res) => {
  try {
    const { id_user } = req.params;

    const result = await sql`
      DELETE FROM users WHERE id = ${id_user} RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};