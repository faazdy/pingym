import dotenv from "dotenv";
import app from "../app.js";
import sql from "../config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

sql`SELECT NOW()`
  .then(res => console.log("DB conectada:", res))
  .catch(err => console.error("Error DB:", err));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});