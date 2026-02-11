import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PortfolioChart = ({ data }) => {
  // Mapa de colores personalizados
  const COLORS_MAP = {
    BTC: '#F7931A',   // Bitcoin Orange
    ETH: '#497493',   // Ethereum Blue (Solid)
    DOGE: '#e1b303',  // Doge Yellow
    XRP: '#1b95ca',   // Ripple Blue
    USDT: '#2ea07b',  // Tether Green
  };

  const DEFAULT_COLOR = '#CBD5E1'; 

  const chartData = data.filter(item => parseFloat(item.valor_en_usd) > 0.01);

  return (    
    // Ajustamos la altura a 300px, suficiente para este layout horizontal
      <div className="h-[300px] w-full min-w-0 bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg flex flex-col">
          <h3 className="text-white font-semibold mb-2 text-center">Distribución de Portafolio</h3>
      
      <div className="flex-1 min-h-0 w-full"></div>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="99%" height="99%">
          <PieChart>
            <Pie
              data={chartData}
              cx="30%" 
              cy="50%" 
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="valor_en_usd"
              nameKey="simbolo"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS_MAP[entry.simbolo] || DEFAULT_COLOR} 
                  stroke="rgba(0,0,0,0)"
                />
              ))}
            </Pie>
            
            <Tooltip 
              formatter={(value, name) => [`$${value}`, name]}
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            
            {/* CAMBIO 2: Configuración para lista vertical a la derecha */}
            <Legend 
                layout="vertical"         // Lista vertical
                verticalAlign="middle"    // Centrado verticalmente
                align="right"             // Pegado a la derecha
                iconType="circle"
                wrapperStyle={{
                    right: "10%",
                    paddingLeft: "20px",  // Un poco de aire entre el gráfico y el texto
                    fontSize: "16px"      // Tamaño de letra legible
                }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-slate-500">
          No hay activos para mostrar
        </div>
      )}
    </div>
);
}
export default PortfolioChart;