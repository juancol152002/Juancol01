import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Loader2, BarChart3 } from 'lucide-react'; 
import { getMarketData } from '../Services/api';

// --- COMPONENTES ---
import CryptoChart from '../components/CryptoChart'; 
import GestionModal from '../components/GestionModal';

const Mercado = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para la moneda seleccionada
  const [selectedCoin, setSelectedCoin] = useState({
    symbol: 'btc',
    name: 'Bitcoin',
    price: 0
  });

  const fetchPrices = async () => {
    setLoading(true);
    const data = await getMarketData();
    
    if (data && data.length > 0) {
      // 1. Filtramos solo tus 5 monedas elegidas
      const allowed = ['btc', 'eth', 'doge', 'usdt', 'xpr'];
      
      const filtered = data.filter(coin => 
        allowed.includes(coin.symbol.toLowerCase())
      );

      setCryptos(filtered);

      // Actualizamos el precio de la moneda seleccionada en el panel lateral si está en la lista
      const currentSelected = filtered.find(c => c.symbol === selectedCoin.symbol);
      if (currentSelected) {
        setSelectedCoin(prev => ({ ...prev, price: currentSelected.current_price }));
      }
    } else {
      console.log("No se recibieron datos de la API");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#050a18', minHeight: '100vh', color: 'white' }}>
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-cyan-500 p-1.5 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white">CryptoManager</span>
          </Link>
          <div className="flex gap-6">
            <Link to="/mercado" className="text-cyan-400 text-sm font-medium">Mercado</Link>
            <Link to="/seguridad" className="text-slate-300 hover:text-cyan-400 text-sm font-medium">Seguridad</Link>
          </div>
        </div>
      </nav>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="pt-28 px-4 md:px-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-20">
        
        {/* COLUMNA IZQUIERDA: TABLA */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-cyan-400">Estado del Mercado</h1>
            {loading && <Loader2 className="animate-spin text-cyan-500" />}
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-2xl">
            <table className="w-full text-left bg-[#0b1120]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-5">Activo</th>
                  <th className="p-5 text-right">Precio (USD)</th>
                  <th className="p-5 text-right">Cambio 24h</th>
                  <th className="p-5 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                      {cryptos.map((coin) => (
                        <tr 
                          key={coin.id} 
                          onClick={() => setSelectedCoin({
                              symbol: coin.symbol,
                              name: coin.name,
                              price: coin.current_price
                          })}
                          className={`border-b border-slate-800/50 hover:bg-slate-800/40 cursor-pointer transition-all ${selectedCoin.symbol === coin.symbol ? 'bg-slate-800/60 border-l-4 border-l-cyan-500' : ''}`}
                        >
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                              <div>
                                <span className="font-bold block">{coin.name}</span>
                                <span className="text-slate-500 text-xs uppercase">{coin.symbol}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-right font-mono">
                            ${coin.current_price.toLocaleString('es-ES', { 
                                minimumFractionDigits: coin.current_price < 1 ? 4 : 2,
                                maximumFractionDigits: coin.current_price < 1 ? 4 : 2 
                            })}
                          </td>
                          <td className={`p-5 text-right font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                            {coin.price_change_percentage_24h?.toFixed(2)}%
                          </td>
                          <td className="p-5 text-center">
                            <button className="p-2 hover:text-cyan-400 transition-colors">
                              <BarChart3 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
            </table>
          </div>
        </div>

        {/* COLUMNA DERECHA: PANEL DE GESTIÓN */}
        <div className="lg:w-80">
          <div className="sticky top-28 bg-[#0b1120] p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white leading-tight">{selectedCoin.name}</h2>
              <p className="text-cyan-400 font-mono text-sm">
                ${selectedCoin.price < 1 ? selectedCoin.price.toFixed(4) : selectedCoin.price.toLocaleString()}
              </p>
            </div>
            
           <div className="rounded-xl overflow-hidden border border-slate-800 mb-6 bg-slate-900/50">
               <CryptoChart 
                symbol={
                  selectedCoin.symbol.toLowerCase() === 'xpr' 
                  ? "KUCOIN:XPRUSDT" 
                  : selectedCoin.symbol.toLowerCase() === 'usdt'
                  ? "BINANCE:USDTUSD" // Cambio clave: USDT contra USD real para que funcione
                  : `${selectedCoin.symbol.toUpperCase()}USDT`
                                } 
                      />
                    </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              Gestionar {selectedCoin.symbol.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL DE GESTIÓN --- */}
      <GestionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        coin={selectedCoin} 
      />
    </div>
  );
};

export default Mercado;