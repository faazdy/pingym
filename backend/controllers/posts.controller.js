import sql from "../config/db.js";

// Listar posts del gym (solo usuarios con gym: admin, trainer, cliente de gym)
export const getPostsByGym = async (req, res) => {
  try {
    const { gym_id } = req.params;
    if (req.user.gym_id !== gym_id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    const result = await sql`
      SELECT p.*, u.name as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.gym_id = ${gym_id}
      ORDER BY p.created_at DESC
    `;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Un post por id (mismo gym)
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`
      SELECT p.*, u.name as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = ${id}
    `;
    if (result.length === 0) {
      return res.status(404).json({ message: "Post no encontrado" });
    }
    if (result[0].gym_id !== req.user.gym_id) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear post
export const createPost = async (req, res) => {
  try {
    const gym_id = req.user.gym_id;
    const author_id = req.user.id;
    const { title, content, image } = req.body;
    if (!title) {
      return res.status(400).json({ message: "El título es requerido" });
    }
    const result = await sql`
      INSERT INTO posts (gym_id, title, content, image, author_id)
      VALUES (${gym_id}, ${title}, ${content || null}, ${image || null}, ${author_id})
      RETURNING *
    `;
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image } = req.body;

    const existing = await sql`SELECT id, gym_id FROM posts WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ message: "Post no encontrado" });
    }
    if (existing[0].gym_id !== req.user.gym_id) {
      return res.status(403).json({ message: "No puedes editar este post" });
    }

    const current = await sql`SELECT * FROM posts WHERE id = ${id}`;
    const newTitle = title !== undefined ? title : current[0].title;
    const newContent = content !== undefined ? content : current[0].content;
    const newImage = image !== undefined ? image : current[0].image;
    const result = await sql`
      UPDATE posts SET title = ${newTitle}, content = ${newContent}, image = ${newImage}
      WHERE id = ${id}
      RETURNING *
    `;
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await sql`SELECT id, gym_id FROM posts WHERE id = ${id}`;
    if (existing.length === 0) {
      return res.status(404).json({ message: "Post no encontrado" });
    }
    if (existing[0].gym_id !== req.user.gym_id) {
      return res.status(403).json({ message: "No puedes eliminar este post" });
    }
    await sql`DELETE FROM posts WHERE id = ${id}`;
    res.json({ message: "Post eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
