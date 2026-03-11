import sql from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//register user
export const register = async (req, res) => {
  try {

    const { gym_id, name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    //email validate
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const result = await sql`
      INSERT INTO users (gym_id, name, email, password, role)
      VALUES (${gym_id}, ${name}, ${email}, ${hashedPassword}, ${role || "trainer"})
      RETURNING id, name, email, role
    `;

    res.status(201).json(result[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//login user
export const login = async (req, res) => {
  try {

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña requeridos" });
    }

    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;

    if (result.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const user = result[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// register gym
export const registerGym = async(req, res)=>{
  try {
    const { name_gym, address, phone } = req.body
    const validateExistGym = await sql` SELECT * FROM gyms WHERE name = ${name_gym}`

    if(validateExistGym.length > 0){
      return res.status(409).json({ error: 'Gym with this name is already exist. Please insert another name.'})
    }

    const query = await sql`
    INSERT INTO gyms (name, address, phone)
    VALUES (${name_gym}, ${address}, ${phone})
    RETURNING id, name, address, phone
    `;
    res.status(201).json(query[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}