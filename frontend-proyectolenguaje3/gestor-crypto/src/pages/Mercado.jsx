import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const Mercado = () => {
  const cryptos = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC', price: '42,150.00', change: '+2.4%' },
    { id: 2, name: 'Ethereum', symbol: 'ETH', price: '2,250.12', change: '-0.8%' },
    { id: 3, name: 'DogeCoin', symbol: 'DOGE', price: '0.085', change: '+12.5%' },
    { id: 4, name: 'Tether', symbol: 'USDT', price: '1.00', change: '0.0%' },
  ];

  return (
    <div style={{ backgroundColor: '#050a18', minHeight: '100vh', color: 'white' }}>
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
              <div className="bg-cyan-500 p-1.5 rounded-lg shadow-[0_0_10px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                CryptoManager
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/mercado" className="text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Mercado
                </Link>                
                <Link to="/seguridad" className="hover:text-cyan-400 text-slate-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  Seguridad
                </Link>
                <Link to="/login">
                  <button className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-full text-sm font-medium transition-all">
                    Iniciar Sesión
                  </button>
                </Link>
              </div>
            </div> 
          </div>
        </div>
      </nav>

      {/* --- CONTENIDO DE LA TABLA CON MARGEN --- */}
      <div className="pt-28 px-4 md:px-10 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-cyan-400">Estado del Mercado</h1>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#0b1120', borderRadius: '10px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b', textAlign: 'left' }}>
                <th style={{ padding: '20px' }}>Activo</th>
                <th style={{ padding: '20px' }}>Precio (USD)</th>
                <th style={{ padding: '20px' }}>Cambio 24h</th>
                <th style={{ padding: '20px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cryptos.map((coin) => (
                <tr key={coin.id} className="hover:bg-slate-800/50 transition-colors" style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '20px', fontWeight: 'bold' }}>
                     {coin.name} <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{coin.symbol}</span>
                  </td>
                  <td style={{ padding: '20px' }}>${coin.price}</td>
                  <td style={{ padding: '20px', color: coin.change.startsWith('+') ? '#10b981' : '#ef4444' }}>
                    {coin.change}
                  </td>
                  <td style={{ padding: '20px' }}>
                    <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg font-bold transition-all text-sm">
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Mercado;