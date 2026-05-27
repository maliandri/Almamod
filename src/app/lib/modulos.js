export const MODULOS = [
  {
    key: 'obras',
    label: 'Gestión de Obra',
    icon: '🏗️',
    desc: 'Ver obras, etapas y remitos',
    defaultReadRoles: null,
    defaultWriteRoles: ['superadmin', 'dueno', 'deposito'],
  },
  {
    key: 'partes',
    label: 'Componentes',
    icon: '🔩',
    desc: 'Catálogo de partes y stock',
    defaultReadRoles: ['superadmin', 'dueno', 'deposito'],
    defaultWriteRoles: ['superadmin', 'dueno', 'deposito'],
  },
  {
    key: 'familias',
    label: 'Familias',
    icon: '🏷️',
    desc: 'Familias de productos',
    defaultReadRoles: ['superadmin', 'dueno', 'deposito'],
    defaultWriteRoles: ['superadmin', 'dueno', 'deposito'],
  },
  {
    key: 'bom',
    label: 'Lista de Materiales (BOM)',
    icon: '📋',
    desc: 'Estructura de materiales por modelo',
    defaultReadRoles: ['superadmin', 'dueno', 'deposito', 'fabricacion'],
    defaultWriteRoles: ['superadmin', 'dueno', 'deposito'],
  },
  {
    key: 'remito_scan',
    label: 'Escanear Remito',
    icon: '📷',
    desc: 'Escáner y vinculación de remitos',
    defaultReadRoles: ['superadmin', 'dueno', 'deposito'],
    defaultWriteRoles: ['superadmin', 'dueno', 'deposito'],
  },
  {
    key: 'cms',
    label: 'CMS Web',
    icon: '🌐',
    desc: 'Modelos y galería del sitio',
    defaultReadRoles: ['superadmin', 'dueno', 'arquitectura'],
    defaultWriteRoles: ['superadmin', 'dueno', 'arquitectura'],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: '📢',
    desc: 'Reels, publicaciones y configuración',
    defaultReadRoles: ['superadmin', 'dueno', 'marketing'],
    defaultWriteRoles: ['superadmin', 'dueno', 'marketing'],
  },
  {
    key: 'usuarios',
    label: 'Usuarios',
    icon: '👥',
    desc: 'Administración de usuarios e invitaciones',
    defaultReadRoles: ['superadmin', 'dueno'],
    defaultWriteRoles: ['superadmin', 'dueno'],
  },
];

const PERM_LABEL = { none: 'Sin acceso', read: 'Solo lectura', write: 'Escritura' };

// Returns 'none' | 'read' | 'write' based on role alone
export function rolDefaultPerm(rol, moduleKey) {
  const mod = MODULOS.find(m => m.key === moduleKey);
  if (!mod) return 'none';
  const canRead = !mod.defaultReadRoles || mod.defaultReadRoles.includes(rol);
  if (!canRead) return 'none';
  const canWrite = !mod.defaultWriteRoles || mod.defaultWriteRoles.includes(rol);
  return canWrite ? 'write' : 'read';
}

export function rolDefaultLabel(rol, moduleKey) {
  return PERM_LABEL[rolDefaultPerm(rol, moduleKey)] ?? 'Sin acceso';
}

// Returns 'none' | 'read' | 'write' — explicit override OR role default
export function effectivePerm(user, moduleKey) {
  const perm = user?.permisos?.[moduleKey];
  if (perm === 'none' || perm === 'read' || perm === 'write') return perm;
  return rolDefaultPerm(user?.rol, moduleKey);
}

// Whether the given user can access (read) a module
export function canAccessModule(user, moduleKey) {
  return effectivePerm(user, moduleKey) !== 'none';
}

// Whether the given user can write to a module
export function canWriteModule(user, moduleKey) {
  return effectivePerm(user, moduleKey) === 'write';
}
