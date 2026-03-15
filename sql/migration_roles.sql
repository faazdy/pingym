-- Permite usuario independiente (sin gym): profile y rutinas personales
-- Ejecutar sobre DB existente SOLO SI HAY PROBLEMAS CON ESTAS TABLAS.

ALTER TABLE clients_profile
  ALTER COLUMN gym_id DROP NOT NULL;

ALTER TABLE routines
  ALTER COLUMN gym_id DROP NOT NULL;

