import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../../components/ThemeToggle';
import logoAlmamod from '../../assets/almamod.webp';

const ROL_LABEL = {
  superadmin: 'Super Admin',
  dueno:      'Dueño',
  deposito:   'Depósito',
  fabricacion:'Fabricación',
  cliente:    'Cliente',
};

const ROL_COLOR = {
  superadmin:  { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
  dueno:       { bg: 'rgba(212,165,116,0.15)',  text: '#d4a574' },
  deposito:    { bg: 'rgba(102,126,234,0.15)',  text: '#667eea' },
  fabricacion: { bg: 'rgba(16,185,129,0.15)',   text: '#10b981' },
  cliente:     { bg: 'rgba(148,163,184,0.15)',  text: '#94a3b8' },
};

const NAV_ITEMS = [
  { to: '/app/obras',          icon: '🏗️', label: 'Obras',         end: true,  roles: null },
  { to: '/app/obras/nueva',    icon: '➕', label: 'Nueva Obra',    end: false, roles: ['superadmin','dueno','deposito'] },
  { to: '/app/partes',         icon: '🔩', label: 'Componentes',   end: false, roles: ['superadmin','dueno','deposito'] },
  { to: '/app/bom',            icon: '📋', label: 'BOM',           end: false, roles: ['superadmin','dueno','deposito','fabricacion'] },
  { to: '/app/cms/modelos',    icon: '🌐', label: 'Modelos Web',   end: false, roles: ['superadmin','dueno'] },
  { to: '/app/cms/obras',      icon: '📷', label: 'Galería Obras', end: false, roles: ['superadmin','dueno'] },
  { to: '/app/usuarios',       icon: '👥', label: 'Usuarios',      end: false, roles: ['superadmin','dueno'] },
];

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        borderLeft: isActive ? '3px solid #d4a574' : '3px solid transparent',
        background: isActive ? 'rgba(212,165,116,0.12)' : 'transparent',
        color: isActive ? '#d4a574' : '#94a3b8',
      })}
      onMouseEnter={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.color = '#e2e8f0';
        }
      }}
      onMouseLeave={(e) => {
        const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#94a3b8';
        }
      }}
    >
      <span style={{ fontSize: '1rem' }}>{icon}</span>
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

  const visibleItems = NAV_ITEMS.filter(
    item => !item.roles || item.roles.includes(rol)
  );

  return (
    <div style={{
      width: '240px',
      background: 'linear-gradient(to bottom, #1a1a2e 0%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRight: '1px solid rgba(212,165,116,0.15)',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(212,165,116,0.15)' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logoAlmamod} alt="AlmaMod" style={{ height: '32px', objectFit: 'contain' }} />
        </Link>
        <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: '6px', letterSpacing: '0.05em' }}>
          SISTEMA DE GESTIÓN
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }} onClick={onClose}>
        {visibleItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(212,165,116,0.15)' }}>
        <div style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.nombre}
        </div>
        <div style={{
          display: 'inline-block',
          background: rolColor.bg,
          color: rolColor.text,
          fontSize: '0.7rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '20px',
          letterSpacing: '0.04em',
          marginBottom: '12px',
        }}>
          {ROL_LABEL[rol] || rol}
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.85rem',
            padding: '8px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
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

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary, #0f172a)', overflow: 'hidden' }}>
      <ThemeToggle />

      {/* Desktop sidebar */}
      <div className="hidden md:flex" style={{ flexShrink: 0 }}>
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
          <SidebarContent onClose={() => setSidebarOpen(false)} />
          <div
            style={{ flex: 1, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Mobile topbar */}
        <div
          className="md:hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderBottom: '1px solid rgba(212,165,116,0.15)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'transparent', border: 'none', color: '#d4a574', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <img src={logoAlmamod} alt="AlmaMod" style={{ height: '26px', objectFit: 'contain' }} />
        </div>

        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary, #0f172a)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
