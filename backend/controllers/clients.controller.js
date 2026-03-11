import sql from "../config/db.js";

export const getClients = async (req, res) => {
  try {

    const result = await sql`
      SELECT * FROM clients ORDER BY created_at DESC
    `;

    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createClient = async (req, res) => {
  try {

    const {
      gym_id,
      first_name,
      last_name,
      phone,
      address,
      eps
    } = req.body;

    const result = await sql`
      INSERT INTO clients 
      (gym_id, first_name, last_name, phone, address, eps)
      VALUES (${gym_id}, ${first_name}, ${last_name}, ${phone}, ${address}, ${eps})
      RETURNING *
    `;

    res.status(201).json(result[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};