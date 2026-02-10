import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Save, ShieldAlert, LogIn } from 'lucide-react';

const GestionModal = ({ isOpen, onClose, coin, title, message, type }) => {
  const navigate = useNavigate();
  // Nuevo estado para controlar si mostramos el aviso de login
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  if (!isOpen) return null;

  // --- MODO ERROR ---
  if (type === 'error') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
          <div className="text-center py-4">
            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <ShieldAlert className="text-red-500 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title || 'Error'}</h3>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              {message || 'Ha ocurrido un error inesperado.'}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleGuardarClick = () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      // En lugar de alert(), activamos la vista de aviso
      setShowLoginPrompt(true);
    } else {
      console.log("Usuario autenticado. Guardando activo...");
      // Aquí irá tu lógica de Django más adelante
    }
  };

  // Función para cerrar el modal y resetear el estado interno
  const handleClose = () => {
    setShowLoginPrompt(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden relative">

        {/* --- VISTA DE AVISO (SI NO ESTÁ LOGUEADO) --- */}
        {showLoginPrompt ? (
          <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-amber-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <ShieldAlert className="text-amber-500 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sesión requerida</h3>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              Para registrar <strong>{coin?.name}</strong> en tu inventario y realizar el seguimiento, necesitas tener una cuenta activa.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                <LogIn size={18} /> Iniciar Sesión ahora
              </button>
              <button
                onClick={handleClose}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Tal vez luego
              </button>
            </div>
          </div>
        ) : (
          /* --- VISTA NORMAL (FORMULARIO) --- */
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Gestionar {coin?.name}
              </h3>
              <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Cantidad comprada</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Precio de compra (USD)</label>
                <input
                  type="number"
                  defaultValue={coin?.price}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleGuardarClick}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-4 shadow-lg shadow-cyan-500/20"
              >
                <Save className="w-5 h-5" /> Guardar en Inventario
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default GestionModal;