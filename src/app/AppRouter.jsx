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
import CmsModelos from './pages/CmsModelos';
import CmsObras from './pages/CmsObras';
import MarketingReels from './pages/MarketingReels';
import MarketingPublicaciones from './pages/MarketingPublicaciones';
import MarketingLibre from './pages/MarketingLibre';
import MakeConfig from './pages/MakeConfig';
import FirmarRemito from './pages/FirmarRemito';
import RemitoScan from './pages/RemitoScan';
import Familias from './pages/Familias';
import CrmAlmita from './pages/CrmAlmita';
import MarketingImagenes from './pages/MarketingImagenes';
import SitioContenido from './pages/SitioContenido';
import PIC from './pages/PIC';
import OT from './pages/OT';
import REI from './pages/REI';
import ResetPassword from './pages/ResetPassword';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="registro" element={<Registro />} />

      <Route
        path="obras"
        element={
          <ProtectedRoute module="obras" mode="read">
            <ObrasLista />
          </ProtectedRoute>
        }
      />
      <Route
        path="obras/nueva"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'deposito']} module="obras" mode="write">
            <ObraNueva />
          </ProtectedRoute>
        }
      />
      <Route
        path="obras/:id"
        element={
          <ProtectedRoute module="obras" mode="read">
            <ObraDetalle />
          </ProtectedRoute>
        }
      />
      <Route
        path="obras/:id/remito/nuevo"
        element={
          <ProtectedRoute roles={['superadmin', 'deposito']} module="obras" mode="write">
            <RemitoCrear />
          </ProtectedRoute>
        }
      />
      <Route
        path="partes"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'deposito']} module="partes" mode="read">
            <Partes />
          </ProtectedRoute>
        }
      />
      <Route
        path="bom"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'deposito', 'fabricacion']} module="bom" mode="read">
            <BOM />
          </ProtectedRoute>
        }
      />
      <Route
        path="cms/modelos"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'arquitectura']} module="cms" mode="read">
            <CmsModelos />
          </ProtectedRoute>
        }
      />
      <Route
        path="cms/obras"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'arquitectura']} module="cms" mode="read">
            <CmsObras />
          </ProtectedRoute>
        }
      />
      <Route
        path="marketing/reels"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'marketing']} module="marketing" mode="read">
            <MarketingReels />
          </ProtectedRoute>
        }
      />
      <Route
        path="marketing/publicaciones"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'marketing']} module="marketing" mode="read">
            <MarketingPublicaciones />
          </ProtectedRoute>
        }
      />
      <Route
        path="marketing/libre"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'marketing']} module="marketing" mode="read">
            <MarketingLibre />
          </ProtectedRoute>
        }
      />
      <Route
        path="marketing/make"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'marketing']} module="marketing" mode="read">
            <MakeConfig />
          </ProtectedRoute>
        }
      />
      <Route
        path="marketing/imagenes"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'marketing', 'arquitectura']} module="marketing" mode="read">
            <MarketingImagenes />
          </ProtectedRoute>
        }
      />
      <Route
        path="marketing/sitio"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'marketing', 'arquitectura']} module="marketing" mode="read">
            <SitioContenido />
          </ProtectedRoute>
        }
      />
      <Route
        path="usuarios"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno']} module="usuarios" mode="read">
            <Usuarios />
          </ProtectedRoute>
        }
      />

      <Route
        path="mis-obras"
        element={
          <ProtectedRoute module="obras" mode="read">
            <ObrasLista />
          </ProtectedRoute>
        }
      />

      <Route
        path="remito-scan"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'deposito']} module="remito_scan" mode="read">
            <RemitoScan />
          </ProtectedRoute>
        }
      />
      <Route
        path="familias"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'deposito']} module="familias" mode="read">
            <Familias />
          </ProtectedRoute>
        }
      />

      {/* Rutas públicas — sin auth */}
      <Route path="firmar/:token" element={<FirmarRemito />} />
      <Route path="reset-password" element={<ResetPassword />} />

      <Route
        path="pic"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'deposito']} module="pic" mode="read">
            <PIC />
          </ProtectedRoute>
        }
      />
      <Route
        path="ot"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'deposito', 'fabricacion']} module="ot" mode="read">
            <OT />
          </ProtectedRoute>
        }
      />
      <Route
        path="rei"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno', 'deposito']} module="rei" mode="read">
            <REI />
          </ProtectedRoute>
        }
      />
      <Route
        path="crm-almita"
        element={
          <ProtectedRoute roles={['superadmin', 'dueno']}>
            <CrmAlmita />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="obras" replace />} />
    </Routes>
  );
}
