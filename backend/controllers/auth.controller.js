import sql from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//register user
export const register = async (req, res) => {
  try {

    const { gym_id, name, email, password, role, phone, address, eps, emergency_contact } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    //email validate
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const result = await sql`
      INSERT INTO users (gym_id, name, email, password, role)
      VALUES (${gym_id}, ${name}, ${email}, ${hashedPassword}, ${role || "client"})
      RETURNING id, name, email, role
    `;
    //client register
    const user = result[0]
    if (user.role === "client") {
      const clientRegister = await sql`
        INSERT INTO clients_profile (gym_id, user_id, phone, address, eps, emergency_contact)
        VALUES (${gym_id}, ${user.id}, ${phone}, ${address}, ${eps}, ${emergency_contact})
        RETURNING id, user_id, phone, address, eps, emergency_contact
      `;
      user.profile = clientRegister[0] //para mostrar el perfil cliente 
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
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


// update user
export const updateUser = async (req, res) => {
  try {
    const { id_user } = req.params;
    const { name, email } = req.body;

    const result = await sql`
      UPDATE users
      SET name = ${name}, email = ${email}
      WHERE id = ${id_user}
      RETURNING id, name, email, role
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete user (en cascada elimina client_profile)
export const deleteUser = async (req, res) => {
  try {
    const { id_user } = req.params;

    const result = await sql`
      DELETE FROM users WHERE id = ${id_user} RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// update gym
export const updateGym = async (req, res) => {
  try {
    const { id_gym } = req.params;
    const { name_gym, address, phone } = req.body;

    const result = await sql`
      UPDATE gyms
      SET name = ${name_gym}, address = ${address}, phone = ${phone}
      WHERE id = ${id_gym}
      RETURNING id, name, address, phone
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Gym no encontrado" });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// delete gym (en cascada elimina todo lo relacionado)
export const deleteGym = async (req, res) => {
  try {
    const { id_gym } = req.params;

    const result = await sql`
      DELETE FROM gyms WHERE id = ${id_gym} RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Gym no encontrado" });
    }

    res.json({ message: "Gym eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};