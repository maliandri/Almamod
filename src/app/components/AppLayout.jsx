import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../../components/ThemeToggle';
import logoAlmamod from '../../assets/almamod.webp';

const ROL_LABEL = {
  superadmin: 'Super Admin', dueno: 'Dueño', deposito: 'Depósito',
  fabricacion: 'Fabricación', marketing: 'Marketing', arquitectura: 'Arquitectura', cliente: 'Cliente',
};

const ROL_COLOR = {
  superadmin:   { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
  dueno:        { bg: 'rgba(212,165,116,0.15)',  text: '#d4a574' },
  deposito:     { bg: 'rgba(102,126,234,0.15)',  text: '#667eea' },
  fabricacion:  { bg: 'rgba(16,185,129,0.15)',   text: '#10b981' },
  marketing:    { bg: 'rgba(249,115,22,0.15)',   text: '#f97316' },
  arquitectura: { bg: 'rgba(139,92,246,0.15)',   text: '#8b5cf6' },
  cliente:      { bg: 'rgba(148,163,184,0.15)',  text: '#94a3b8' },
};

const NAV_SECTIONS = [
  {
    label: 'Marketing',
    items: [
      { to: '/app/marketing/reels',         module: 'marketing', icon: '🎬', label: 'Reels',             roles: ['superadmin','dueno','marketing'] },
      { to: '/app/marketing/publicaciones', module: 'marketing', icon: '📱', label: 'Publicaciones',     roles: ['superadmin','dueno','marketing'] },
      { to: '/app/marketing/libre',         module: 'marketing', icon: '✍️', label: 'Publicación libre', roles: ['superadmin','dueno','marketing'] },
      { to: '/app/marketing/make',          module: 'marketing', icon: '⚙️', label: 'Configurar Make',   roles: ['superadmin','dueno','marketing'] },
      { to: '/app/marketing/imagenes',      module: 'marketing', icon: '🖼️', label: 'Imágenes del sitio', roles: ['superadmin','dueno','marketing','arquitectura'] },
      { to: '/app/marketing/sitio',         module: 'marketing', icon: '✏️', label: 'Contenido del sitio', roles: ['superadmin','dueno','marketing','arquitectura'] },
    ],
  },
  {
    label: 'Obra',
    items: [
      { to: '/app/obras',       module: 'obras', icon: '🏗️', label: 'Gestión de Obra', end: true,  roles: null },
      { to: '/app/obras/nueva', module: 'obras', icon: '➕', label: 'Nueva Obra',       end: false, roles: ['superadmin','dueno','deposito'], mode: 'write' },
    ],
  },
  {
    label: 'Productos',
    items: [
      { to: '/app/cms/modelos', module: 'cms', icon: '🌐', label: 'Gestión de Modelos', roles: ['superadmin','dueno','arquitectura'] },
      { to: '/app/cms/obras',   module: 'cms', icon: '📷', label: 'Galería Obras',      roles: ['superadmin','dueno','arquitectura'] },
    ],
  },
  {
    label: 'Producción',
    items: [
      { to: '/app/partes',      module: 'partes',      icon: '🔩', label: 'Componentes',     roles: ['superadmin','dueno','deposito'] },
      { to: '/app/familias',    module: 'familias',    icon: '🏷️', label: 'Familias',        roles: ['superadmin','dueno','deposito'] },
      { to: '/app/bom',         module: 'bom',         icon: '📋', label: 'BOM',             roles: ['superadmin','dueno','deposito','fabricacion'] },
      { to: '/app/remito-scan', module: 'remito_scan', icon: '📷', label: 'Escanear Remito', roles: ['superadmin','dueno','deposito'] },
      { to: '/app/pic',        module: 'pic',         icon: '🛒', label: 'PIC',              roles: ['superadmin','dueno','deposito'] },
      { to: '/app/ot',         module: 'ot',          icon: '🔧', label: 'OT',               roles: ['superadmin','dueno','deposito','fabricacion'] },
      { to: '/app/rei',        module: 'rei',         icon: '📦', label: 'REI',              roles: ['superadmin','dueno','deposito'] },
    ],
  },
  {
    label: 'Administración',
    items: [
      { to: '/app/presupuestador', module: 'presupuestador', icon: '🧮', label: 'Presupuestador', roles: ['superadmin','dueno'] },
      { to: '/app/usuarios',    module: 'usuarios', icon: '👥', label: 'Usuarios',     roles: ['superadmin','dueno'] },
      { to: '/app/crm-almita',                      icon: '🤖', label: 'CRM Almita',   roles: ['superadmin','dueno'] },
    ],
  },
];

function NavItem({ to, icon, label, end, onClose }) {
  return (
    <NavLink to={to} end={end} onClick={onClose}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 12px', borderRadius: '7px',
        fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
        transition: 'all 0.15s ease',
        borderLeft: isActive ? '3px solid #d4a574' : '3px solid transparent',
        background: isActive ? 'rgba(212,165,116,0.12)' : 'transparent',
        color: isActive ? '#d4a574' : '#94a3b8',
      })}
      onMouseEnter={e => {
        if (e.currentTarget.getAttribute('aria-current') !== 'page') {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.color = '#e2e8f0';
        }
      }}
      onMouseLeave={e => {
        if (e.currentTarget.getAttribute('aria-current') !== 'page') {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#94a3b8';
        }
      }}
    >
      <span style={{ fontSize: '0.95rem', width: '18px', textAlign: 'center' }}>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const rol = user?.rol;
  const rolColor = ROL_COLOR[rol] || ROL_COLOR.cliente;

  const handleLogout = () => {
    logout();
    navigate('/app/login');
    if (onClose) onClose();
  };

  return (
    <div style={{
      width: '224px', background: 'linear-gradient(to bottom, #1a1a2e 0%, #0f172a 100%)',
      display: 'flex', flexDirection: 'column', height: '100%',
      borderRight: '1px solid rgba(212,165,116,0.15)', flexShrink: 0,
    }}>
      <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid rgba(212,165,116,0.15)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoAlmamod} alt="AlmaMod" style={{ height: '30px', objectFit: 'contain' }} />
        </Link>
        <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '5px', letterSpacing: '0.06em' }}>
          SISTEMA DE GESTIÓN
        </div>
      </div>

      <nav style={{ flex: 1, padding: '10px 6px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_SECTIONS.map(section => {
          const visibles = section.items.filter(item => {
            const perm = user?.permisos?.[item.module];
            if (perm !== undefined) {
              if (perm === 'none') return false;
              if (item.mode === 'write' && perm !== 'write') return false;
              return true;
            }
            return !item.roles || item.roles.includes(rol);
          });
          if (visibles.length === 0) return null;
          return (
            <div key={section.label} style={{ marginBottom: '4px' }}>
              <div style={{ color: 'rgba(148,163,184,0.5)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', padding: '8px 12px 4px', textTransform: 'uppercase' }}>
                {section.label}
              </div>
              {visibles.map(item => <NavItem key={item.to} {...item} onClose={onClose} />)}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(212,165,116,0.15)' }}>
        <div style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.nombre}
        </div>
        <div style={{ display: 'inline-block', background: rolColor.bg, color: rolColor.text, fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', letterSpacing: '0.04em', marginBottom: '10px' }}>
          {ROL_LABEL[rol] || rol}
        </div>
        <button onClick={handleLogout}
          style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.82rem', padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          Cerrar sesión →
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Cierra sidebar al navegar en móvil
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary, #0f172a)', overflow: 'hidden' }}>
      <ThemeToggle />

      {/* Sidebar desktop — siempre visible */}
      {!isMobile && <SidebarContent />}

      {/* Sidebar móvil — overlay */}
      {isMobile && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
          <SidebarContent onClose={closeSidebar} />
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={closeSidebar} />
        </div>
      )}

      {/* Contenido principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Header móvil */}
        {isMobile && (
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderBottom: '1px solid rgba(212,165,116,0.15)',
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
          }}>
            <button onClick={() => setSidebarOpen(true)}
              style={{ background: 'transparent', border: 'none', color: '#d4a574', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>
              ☰
            </button>
            <img src={logoAlmamod} alt="AlmaMod" style={{ height: '26px', objectFit: 'contain' }} />
          </div>
        )}

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: 'var(--bg-primary, #0f172a)' }}>
          <style>{`
            @media (max-width: 767px) {
              .admin-page { padding: 16px 14px !important; }
              .admin-page > * { max-width: 100% !important; }
            }
          `}</style>
          {children}
        </main>
      </div>
    </div>
  );
}
