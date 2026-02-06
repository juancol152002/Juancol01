import React from 'react';
import { X, Save } from 'lucide-react';

const GestionModal = ({ isOpen, onClose, coin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Gestionar {coin.name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Cantidad comprada</label>
            <input 
              type="number" 
              placeholder="0.00"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Precio de compra (USD)</label>
            <input 
              type="number" 
              defaultValue={coin.price}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button 
            type="button"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-4"
          >
            <Save className="w-5 h-5" /> Guardar en Inventario
          </button>
        </form>
      </div>
    </div>
  );
};

export default GestionModal;