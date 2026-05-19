-- ============================================================
-- ALMAMOD - SCHEMA SUPABASE
-- Correr en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE user_role AS ENUM ('superadmin', 'dueno', 'deposito', 'fabricacion', 'cliente');
CREATE TYPE obra_estado AS ENUM ('activa', 'pausada', 'completada', 'cancelada');
CREATE TYPE etapa_estado AS ENUM ('pendiente', 'cargada', 'firmada');
CREATE TYPE remito_estado AS ENUM ('pendiente', 'firmado');
CREATE TYPE invitacion_rol AS ENUM ('dueno', 'deposito', 'fabricacion', 'cliente');

-- ============================================================
-- TABLA: users (extiende auth.users de Supabase)
-- ============================================================
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  rol         user_role NOT NULL DEFAULT 'cliente',
  nombre      TEXT NOT NULL,
  telefono    TEXT,
  dni         TEXT,
  direccion   TEXT,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: modelos (los 6 módulos)
-- ============================================================
CREATE TABLE modelos (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  nombre      TEXT NOT NULL,
  superficie  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed: los 6 modelos
INSERT INTO modelos (slug, nombre, superficie) VALUES
  ('micasita',       'MiCasita',        '12 m²'),
  ('alma-18',        'Alma 18',         '18 m²'),
  ('alma-27',        'Alma 27',         '27 m²'),
  ('alma-loft-28',   'Alma Loft 28',    '28 m²'),
  ('alma-36',        'Alma 36',         '36 m²'),
  ('alma-36-refugio','Alma 36 Refugio', '36 m²');

-- ============================================================
-- TABLA: etapas_template (5 etapas por modelo, define el Dueño)
-- ============================================================
CREATE TABLE etapas_template (
  id          SERIAL PRIMARY KEY,
  modelo_id   INTEGER NOT NULL REFERENCES modelos(id) ON DELETE CASCADE,
  numero      SMALLINT NOT NULL CHECK (numero BETWEEN 1 AND 5),
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (modelo_id, numero)
);

-- ============================================================
-- TABLA: obras
-- ============================================================
CREATE TABLE obras (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_obra  SERIAL UNIQUE,
  modelo_id    INTEGER NOT NULL REFERENCES modelos(id),
  cliente_id   UUID NOT NULL REFERENCES users(id),
  creado_por   UUID NOT NULL REFERENCES users(id),
  estado       obra_estado NOT NULL DEFAULT 'activa',
  fecha_inicio DATE,
  direccion    TEXT,
  notas        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: etapas_obra (instancias de etapas por obra)
-- ============================================================
CREATE TABLE etapas_obra (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id            UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  etapa_template_id  INTEGER REFERENCES etapas_template(id),
  numero             SMALLINT NOT NULL CHECK (numero BETWEEN 1 AND 5),
  nombre             TEXT NOT NULL,
  estado             etapa_estado NOT NULL DEFAULT 'pendiente',
  fecha_carga        TIMESTAMPTZ,
  fecha_firma        TIMESTAMPTZ,
  firmada_por        UUID REFERENCES users(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (obra_id, numero)
);

-- ============================================================
-- TABLA: etapa_registros (texto + fotos que carga Fabricación)
-- ============================================================
CREATE TABLE etapa_registros (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etapa_obra_id   UUID NOT NULL REFERENCES etapas_obra(id) ON DELETE CASCADE,
  cargada_por     UUID NOT NULL REFERENCES users(id),
  descripcion     TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: etapa_fotos (URLs Cloudinary por registro)
-- ============================================================
CREATE TABLE etapa_fotos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etapa_registro_id UUID NOT NULL REFERENCES etapa_registros(id) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: partes (listado maestro de unidades de fabricación)
-- ============================================================
CREATE TABLE partes (
  id          SERIAL PRIMARY KEY,
  codigo      TEXT NOT NULL UNIQUE,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  unidad      TEXT NOT NULL DEFAULT 'unidad',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: modelo_partes (cantidades y specs por modelo)
-- ============================================================
CREATE TABLE modelo_partes (
  id              SERIAL PRIMARY KEY,
  modelo_id       INTEGER NOT NULL REFERENCES modelos(id) ON DELETE CASCADE,
  parte_id        INTEGER NOT NULL REFERENCES partes(id) ON DELETE CASCADE,
  cantidad        NUMERIC NOT NULL DEFAULT 0,
  especificacion  TEXT,
  notas           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (modelo_id, parte_id)
);

-- ============================================================
-- TABLA: obra_checklist (checklist de partes por obra)
-- ============================================================
CREATE TABLE obra_checklist (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obra_id            UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  parte_id           INTEGER NOT NULL REFERENCES partes(id),
  cantidad_requerida NUMERIC NOT NULL DEFAULT 0,
  cantidad_entregada NUMERIC NOT NULL DEFAULT 0,
  completado         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (obra_id, parte_id)
);

-- ============================================================
-- TABLA: remitos (remitos de entrega Depósito → Fabricación)
-- ============================================================
CREATE TABLE remitos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero       SERIAL UNIQUE,
  obra_id      UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  creado_por   UUID NOT NULL REFERENCES users(id),
  firmado_por  UUID REFERENCES users(id),
  estado       remito_estado NOT NULL DEFAULT 'pendiente',
  fecha_firma  TIMESTAMPTZ,
  notas        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: remito_items (ítems de cada remito)
-- ============================================================
CREATE TABLE remito_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remito_id   UUID NOT NULL REFERENCES remitos(id) ON DELETE CASCADE,
  parte_id    INTEGER NOT NULL REFERENCES partes(id),
  cantidad    NUMERIC NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: invitaciones
-- ============================================================
CREATE TABLE invitaciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT NOT NULL,
  rol         invitacion_rol NOT NULL DEFAULT 'cliente',
  obra_id     UUID REFERENCES obras(id),
  token       TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  creado_por  UUID NOT NULL REFERENCES users(id),
  usado_en    TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: notificaciones (log de emails enviados)
-- ============================================================
CREATE TABLE notificaciones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo            TEXT NOT NULL,
  destinatario_id UUID NOT NULL REFERENCES users(id),
  obra_id         UUID REFERENCES obras(id),
  etapa_obra_id   UUID REFERENCES etapas_obra(id),
  remito_id       UUID REFERENCES remitos(id),
  leida           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_obras_updated_at
  BEFORE UPDATE ON obras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_etapas_template_updated_at
  BEFORE UPDATE ON etapas_template
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_obra_checklist_updated_at
  BEFORE UPDATE ON obra_checklist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCIÓN: actualizar checklist al firmar remito
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_checklist_remito()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'firmado' AND OLD.estado = 'pendiente' THEN
    UPDATE obra_checklist oc
    SET
      cantidad_entregada = oc.cantidad_entregada + ri.cantidad,
      completado = (oc.cantidad_entregada + ri.cantidad) >= oc.cantidad_requerida,
      updated_at = NOW()
    FROM remito_items ri
    WHERE ri.remito_id = NEW.id
      AND oc.obra_id = NEW.obra_id
      AND oc.parte_id = ri.parte_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_checklist
  AFTER UPDATE ON remitos
  FOR EACH ROW EXECUTE FUNCTION actualizar_checklist_remito();

-- ============================================================
-- FUNCIÓN: crear checklist al crear una obra
-- ============================================================
CREATE OR REPLACE FUNCTION crear_checklist_obra()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO obra_checklist (obra_id, parte_id, cantidad_requerida)
  SELECT NEW.id, mp.parte_id, mp.cantidad
  FROM modelo_partes mp
  WHERE mp.modelo_id = NEW.modelo_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_crear_checklist
  AFTER INSERT ON obras
  FOR EACH ROW EXECUTE FUNCTION crear_checklist_obra();

-- ============================================================
-- FUNCIÓN: crear etapas_obra al crear una obra
-- ============================================================
CREATE OR REPLACE FUNCTION crear_etapas_obra()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO etapas_obra (obra_id, etapa_template_id, numero, nombre)
  SELECT NEW.id, et.id, et.numero, et.nombre
  FROM etapas_template et
  WHERE et.modelo_id = NEW.modelo_id
  ORDER BY et.numero;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_crear_etapas
  AFTER INSERT ON obras
  FOR EACH ROW EXECUTE FUNCTION crear_etapas_obra();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE modelos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE etapas_template   ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras             ENABLE ROW LEVEL SECURITY;
ALTER TABLE etapas_obra       ENABLE ROW LEVEL SECURITY;
ALTER TABLE etapa_registros   ENABLE ROW LEVEL SECURITY;
ALTER TABLE etapa_fotos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE partes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE modelo_partes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE obra_checklist    ENABLE ROW LEVEL SECURITY;
ALTER TABLE remitos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE remito_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitaciones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones    ENABLE ROW LEVEL SECURITY;

-- Helper: obtener rol del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_rol()
RETURNS user_role AS $$
  SELECT rol FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- MODELOS: todos pueden leer
CREATE POLICY "modelos_read_all" ON modelos FOR SELECT USING (TRUE);

-- USERS: cada uno ve su perfil; superadmin/dueno ven todos
CREATE POLICY "users_read_own" ON users FOR SELECT
  USING (id = auth.uid() OR get_user_rol() IN ('superadmin', 'dueno', 'deposito'));

CREATE POLICY "users_update_own" ON users FOR UPDATE
  USING (id = auth.uid() OR get_user_rol() = 'superadmin');

-- ETAPAS TEMPLATE: todos leen; solo dueno/superadmin modifican
CREATE POLICY "etapas_template_read" ON etapas_template FOR SELECT USING (TRUE);
CREATE POLICY "etapas_template_write" ON etapas_template FOR ALL
  USING (get_user_rol() IN ('superadmin', 'dueno'));

-- OBRAS: dueno/deposito/superadmin ven todas; cliente solo las suyas
CREATE POLICY "obras_read_staff" ON obras FOR SELECT
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito', 'fabricacion'));

CREATE POLICY "obras_read_cliente" ON obras FOR SELECT
  USING (get_user_rol() = 'cliente' AND cliente_id = auth.uid());

CREATE POLICY "obras_write" ON obras FOR ALL
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito'));

-- ETAPAS OBRA: fabricacion puede actualizar; cliente solo ve firmadas
CREATE POLICY "etapas_obra_read_staff" ON etapas_obra FOR SELECT
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito', 'fabricacion'));

CREATE POLICY "etapas_obra_read_cliente" ON etapas_obra FOR SELECT
  USING (
    get_user_rol() = 'cliente' AND estado = 'firmada'
    AND EXISTS (SELECT 1 FROM obras o WHERE o.id = obra_id AND o.cliente_id = auth.uid())
  );

CREATE POLICY "etapas_obra_update_fabricacion" ON etapas_obra FOR UPDATE
  USING (get_user_rol() IN ('superadmin', 'dueno', 'fabricacion'));

-- ETAPA REGISTROS Y FOTOS
CREATE POLICY "registros_read_staff" ON etapa_registros FOR SELECT
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito', 'fabricacion'));

CREATE POLICY "registros_read_cliente" ON etapa_registros FOR SELECT
  USING (
    get_user_rol() = 'cliente'
    AND EXISTS (
      SELECT 1 FROM etapas_obra eo
      JOIN obras o ON o.id = eo.obra_id
      WHERE eo.id = etapa_obra_id AND o.cliente_id = auth.uid() AND eo.estado = 'firmada'
    )
  );

CREATE POLICY "registros_write_fabricacion" ON etapa_registros FOR INSERT
  WITH CHECK (get_user_rol() IN ('superadmin', 'fabricacion'));

CREATE POLICY "fotos_read_all_allowed" ON etapa_fotos FOR SELECT USING (TRUE);
CREATE POLICY "fotos_write_fabricacion" ON etapa_fotos FOR INSERT
  WITH CHECK (get_user_rol() IN ('superadmin', 'fabricacion'));

-- PARTES Y MODELO_PARTES: staff lee/escribe; cliente no accede
CREATE POLICY "partes_read_staff" ON partes FOR SELECT
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito', 'fabricacion'));
CREATE POLICY "partes_write" ON partes FOR ALL
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito'));

CREATE POLICY "modelo_partes_read_staff" ON modelo_partes FOR SELECT
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito', 'fabricacion'));
CREATE POLICY "modelo_partes_write" ON modelo_partes FOR ALL
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito'));

-- CHECKLIST: deposito/superadmin/dueno gestionan; fabricacion solo lee
CREATE POLICY "checklist_read_staff" ON obra_checklist FOR SELECT
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito', 'fabricacion'));
CREATE POLICY "checklist_write" ON obra_checklist FOR ALL
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito'));

-- REMITOS: deposito crea; fabricacion firma; ambos leen
CREATE POLICY "remitos_read" ON remitos FOR SELECT
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito', 'fabricacion'));
CREATE POLICY "remitos_insert" ON remitos FOR INSERT
  WITH CHECK (get_user_rol() IN ('superadmin', 'deposito'));
CREATE POLICY "remitos_update" ON remitos FOR UPDATE
  USING (get_user_rol() IN ('superadmin', 'deposito', 'fabricacion'));

CREATE POLICY "remito_items_read" ON remito_items FOR SELECT
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito', 'fabricacion'));
CREATE POLICY "remito_items_write" ON remito_items FOR ALL
  USING (get_user_rol() IN ('superadmin', 'deposito'));

-- INVITACIONES: dueno/deposito/superadmin gestionan
CREATE POLICY "invitaciones_manage" ON invitaciones FOR ALL
  USING (get_user_rol() IN ('superadmin', 'dueno', 'deposito'));

-- NOTIFICACIONES: cada usuario ve las suyas
CREATE POLICY "notificaciones_read_own" ON notificaciones FOR SELECT
  USING (destinatario_id = auth.uid() OR get_user_rol() IN ('superadmin', 'dueno'));
CREATE POLICY "notificaciones_write" ON notificaciones FOR INSERT
  WITH CHECK (get_user_rol() IN ('superadmin', 'dueno', 'deposito', 'fabricacion'));
