-- ============================================================
-- ALMAMOD - Migración: Presupuestador + Incidencias de fabricación
-- Correr en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- TABLA: ot_incidencias
-- Registro de avances/incidencias por etapa de fabricación,
-- vinculado a una OT (Orden de Trabajo) de tipo "fabricacion"
-- ============================================================
CREATE TABLE IF NOT EXISTS ot_incidencias (
  id                  SERIAL PRIMARY KEY,
  ot_id               UUID NOT NULL REFERENCES ot(id) ON DELETE CASCADE,
  etapa_produccion_id INTEGER REFERENCES etapas_produccion(id) ON DELETE SET NULL,
  tipo                TEXT NOT NULL DEFAULT 'avance', -- 'avance' | 'incidencia'
  descripcion         TEXT NOT NULL,
  fotos               JSONB NOT NULL DEFAULT '[]'::jsonb,
  creado_por          UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ot_incidencias_ot ON ot_incidencias(ot_id);

-- ============================================================
-- TABLA: presupuestos
-- Cabecera de un presupuesto (modelo del catálogo o personalizado)
-- ============================================================
CREATE TABLE IF NOT EXISTS presupuestos (
  id                  SERIAL PRIMARY KEY,
  numero              SERIAL,
  modelo_id           INTEGER REFERENCES modelos(id),
  modelo_nombre       TEXT NOT NULL,
  modelo_descripcion  TEXT,
  cliente_nombre      TEXT,
  cliente_contacto    TEXT,
  cliente_direccion   TEXT,
  margen_pct          NUMERIC NOT NULL DEFAULT 30,
  costo_total         NUMERIC NOT NULL DEFAULT 0,
  precio_total        NUMERIC NOT NULL DEFAULT 0,
  notas               TEXT,
  estado              TEXT NOT NULL DEFAULT 'borrador', -- borrador | enviado | aprobado | rechazado
  creado_por          UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: presupuesto_items
-- Detalle de ítems del presupuesto (BOM cargado + ítems libres)
-- ============================================================
CREATE TABLE IF NOT EXISTS presupuesto_items (
  id              SERIAL PRIMARY KEY,
  presupuesto_id  INTEGER NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
  parte_id        INTEGER REFERENCES partes(id),
  descripcion     TEXT NOT NULL,
  unidad          TEXT,
  cantidad        NUMERIC NOT NULL DEFAULT 1,
  costo_unitario  NUMERIC NOT NULL DEFAULT 0,
  orden           INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_presupuesto_items_presupuesto ON presupuesto_items(presupuesto_id);
