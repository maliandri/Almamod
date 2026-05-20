import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Registro from './pages/Registro';
import ObrasLista from './pages/ObrasLista';
import ObraDetalle from './pages/ObraDetalle';
import ObraNueva from './pages/ObraNueva';
import RemitoCrear from './pages/RemitoCrear';
import Usuarios from './pages/Usuarios';
import Partes from './pages/Partes';
import BOM from './pages/BOM';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="registro" element={<Registro />} />

      <Route
        path="obras"
        element={
          <ProtectedRoute>
            <ObrasLista />
          </ProtectedRoute>
        }
      />
      <Route
        path="obras/nueva"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'deposito']}>
            <ObraNueva />
          </ProtectedRoute>
        }
      />
      <Route
        path="obras/:id"
        element={
          <ProtectedRoute>
            <ObraDetalle />
          </ProtectedRoute>
        }
      />
      <Route
        path="obras/:id/remito/nuevo"
        element={
          <ProtectedRoute roles={['superadmin', 'deposito']}>
            <RemitoCrear />
          </ProtectedRoute>
        }
      />
      <Route
        path="partes"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'deposito']}>
            <Partes />
          </ProtectedRoute>
        }
      />
      <Route
        path="bom"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'deposito', 'fabricacion']}>
            <BOM />
          </ProtectedRoute>
        }
      />
      <Route
        path="usuarios"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno']}>
            <Usuarios />
          </ProtectedRoute>
        }
      />

      {/* Alias para clientes que llegan desde el email */}
      <Route
        path="mis-obras"
        element={
          <ProtectedRoute>
            <ObrasLista />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="obras" replace />} />
    </Routes>
  );
}
