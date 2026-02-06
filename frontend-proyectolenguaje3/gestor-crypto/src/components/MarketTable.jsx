import React, { useEffect, useState } from 'react';
import { getMarketData } from './services/api'; // Importamos la función del Paso 3

const MarketTable = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const data = await getMarketData();
    setCoins(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Actualización automática cada 60 segundos
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-slate-800/40 rounded-2xl border border-slate-700 shadow-xl">
      <table className="w-full text-left">
        <thead className="bg-slate-700/50 text-slate-400 text-xs uppercase font-semibold">
          <tr>
            <th className="px-6 py-4">Activo</th>
            <th className="px-6 py-4 text-right">Precio</th>
            <th className="px-6 py-4 text-right">Cambio 24h</th>
            <th className="px-6 py-4 text-right hidden md:table-cell">Capitalización</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {coins.map((coin) => (
            <tr key={coin.id} className="hover:bg-slate-700/30 transition-colors group">
              <td className="px-6 py-4 flex items-center gap-3">
                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                    {coin.name}
                  </div>
                  <div className="text-xs text-slate-500 uppercase">{coin.symbol}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-right font-mono font-medium text-white">
                ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className={`px-6 py-4 text-right font-semibold ${
                coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {coin.price_change_percentage_24h > 0 ? '+' : ''}
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </td>
              <td className="px-6 py-4 text-right text-slate-400 text-sm hidden md:table-cell">
                ${(coin.market_cap / 1e9).toFixed(2)}B
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarketTable;