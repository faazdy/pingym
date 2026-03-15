import sql from "../config/db.js";

// Datos para QR de registro: el front puede generar un QR con register_url
// GET público o con token según quieras; aquí lo dejo accesible con token para no exponer datos
export const getRegisterQrData = async (req, res) => {
  try {
    const { gym_id } = req.params;
    const gym = await sql`
      SELECT id, name FROM gyms WHERE id = ${gym_id}
    `;
    if (gym.length === 0) {
      return res.status(404).json({ message: "Gym no encontrado" });
    }
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.json({
      gym_id: gym[0].id,
      gym_name: gym[0].name,
      register_url: `${baseUrl}/register?gym_id=${gym[0].id}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
