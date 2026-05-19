import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ROL_LABEL = {
  superadmin: 'Super Admin',
  dueno: 'Dueño',
  deposito: 'Depósito',
  fabricacion: 'Fabricación',
  cliente: 'Cliente',
};

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`
      }
    >
      <span className="text-base">{icon}</span>
      {label}
    </NavLink>
  );
}

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const rol = user?.rol;

  const canCreateObra = ['superadmin', 'dueno', 'deposito'].includes(rol);
  const canManageUsers = ['superadmin', 'dueno'].includes(rol);

  const handleLogout = () => {
    logout();
    navigate('/app/login');
  };

  return (
    <div className="w-60 bg-gray-900 flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <div className="font-bold text-white text-lg leading-tight">AlmaMod</div>
        <div className="text-gray-400 text-xs mt-0.5">Sistema de Gestión</div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" onClick={onClose}>
        <NavItem to="/app/obras" icon="🏗️" label="Obras" end />
        {canCreateObra && <NavItem to="/app/obras/nueva" icon="➕" label="Nueva Obra" />}
        {canManageUsers && <NavItem to="/app/usuarios" icon="👥" label="Usuarios" />}
      </nav>

      <div className="p-3 border-t border-gray-700">
        <div className="text-gray-200 text-sm font-medium truncate">{user?.nombre}</div>
        <div className="text-gray-500 text-xs mb-3">{ROL_LABEL[rol] || rol}</div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-gray-400 hover:text-white text-sm py-1.5 px-2 rounded hover:bg-gray-700 transition-colors"
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <SidebarContent onClose={() => setSidebarOpen(false)} />
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden bg-gray-900 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-300 hover:text-white text-xl leading-none"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <span className="font-semibold text-sm">AlmaMod</span>
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
