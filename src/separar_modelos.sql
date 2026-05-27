-- PASO 1: Crear tabla de modelos de fabricacion
CREATE TABLE IF NOT EXISTS modelos_fabricacion (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activo      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- PASO 2: Insertar los 12 modulos de fabricacion
INSERT INTO modelos_fabricacion (nombre) VALUES
  ('Alma 18'),
  ('Alma 27'),
  ('Alma 36'),
  ('MiCasita'),
  ('Alma 45'),
  ('Alma 54'),
  ('Alma 72'),
  ('Ampliacion 6'),
  ('Ampliacion 12'),
  ('Modulo Calf 72'),
  ('Modulo Calf 72 B'),
  ('Oficinita 12')
ON CONFLICT (nombre) DO NOTHING;

-- PASO 3: Agregar columna nueva en modelo_partes
ALTER TABLE modelo_partes ADD COLUMN IF NOT EXISTS modelo_fab_id INTEGER;

-- PASO 4: Migrar datos existentes (mapea por nombre)
UPDATE modelo_partes mp
SET modelo_fab_id = mf.id
FROM modelos m
JOIN modelos_fabricacion mf ON mf.nombre = m.nombre
WHERE mp.modelo_id = m.id;

-- PASO 5: VERIFICAR antes de continuar
-- Corre esto solo y fijate que el resultado sea 0:
-- SELECT COUNT(*) FROM modelo_partes WHERE modelo_fab_id IS NULL;

-- PASO 6: Reemplazar la FK
ALTER TABLE modelo_partes DROP CONSTRAINT IF EXISTS modelo_partes_modelo_id_fkey;
ALTER TABLE modelo_partes DROP COLUMN modelo_id;
ALTER TABLE modelo_partes RENAME COLUMN modelo_fab_id TO modelo_id;
ALTER TABLE modelo_partes ADD CONSTRAINT modelo_partes_modelo_id_fkey
  FOREIGN KEY (modelo_id) REFERENCES modelos_fabricacion(id) ON DELETE CASCADE;

-- PASO 7: Borrar los modelos fantasma de la tabla publica
DELETE FROM modelos WHERE activo = false;

-- VERIFICACION FINAL:
-- SELECT m.nombre, COUNT(mp.id) AS componentes
-- FROM modelos_fabricacion m
-- LEFT JOIN modelo_partes mp ON mp.modelo_id = m.id
-- GROUP BY m.nombre ORDER BY m.nombre;
