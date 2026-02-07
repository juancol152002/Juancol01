import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import AuthPage from './AuthPage';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import Mercado from './pages/Mercado'; 
import Seguridad from './pages/Seguridad';
import Faq from './pages/faq';
import Contacto from './pages/contacto';
import Terminos from './pages/terminos';

// --- 1. IMPORTA LOS NUEVOS COMPONENTES ---

const App = () => {
  return (
    <BrowserRouter>
     
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Ruta de login */}
        <Route path="/login" element={<AuthPage />} />

        {/* Aquí es donde Mercado mostrará la tabla que creamos. 
            Asegúrate de editar el archivo pages/Mercado.jsx e insertar <MarketTable /> ahí.
        */}
        <Route path="/mercado" element={<Mercado />} />

        <Route path="/seguridad" element={<Seguridad />} />

        <Route path="/faq" element={<Faq />} />

        <Route path="/contacto" element={<Contacto />} />

        <Route path="/terminos" element={<Terminos />} />

        {/* --- Dashboard para usuarios normales --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<UserDashboard />} />
        </Route>

        {/* --- Dashboard para Admins --- */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* --- ZONA PROTEGIDA --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard-general" element={<Dashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;