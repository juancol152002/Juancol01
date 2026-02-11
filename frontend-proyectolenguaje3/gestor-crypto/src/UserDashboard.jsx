import React, { useState, useEffect } from 'react';
import GestionModal from './components/GestionModal';
import ProfileModal from './components/ProfileModal';
import CryptoChart from './components/CryptoChart';
import logoImg from './assets/components/logo.jpg';
import { TrendingUp, History, Wallet, ArrowRight, ArrowDownLeft, ArrowUpRight, LogOut, Download, User, DollarSign } from 'lucide-react';

const COLORS = ['#F7931A', '#F3BA2F', '#3C3C3D', '#26A17B', '#627EEA', '#000000', '#222222'];
const SYMBOL_COLORS = {
    'BTC': '#F7931A',
    'DOGE': '#F3BA2F',
    'ETH': '#627EEA',
    'USDT': '#26A17B',
};

const CRYPTO_LOGOS = {
    'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    'USDT': 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
    'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
};

// --- COMPONENTE DE GRÁFICO MANUAL (SVG) INTERACTIVO ---
const PortfolioPieChart = ({ data }) => {
    const [activeIndex, setActiveIndex] = React.useState(null);

    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.valor, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    const activeItem = activeIndex !== null ? data[activeIndex] : null;

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full p-6">
            <div className="relative w-64 h-64">
                <svg viewBox="-1.1 -1.1 2.2 2.2" className="transform -rotate-90 w-full h-full">
                    {data.map((slice, index) => {
                        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                        cumulativePercent += slice.valor / total;
                        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = slice.valor / total > 0.5 ? 1 : 0;
                        const isHovered = activeIndex === index;

                        const pathData = [
                            `M ${startX} ${startY}`,
                            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                            `L 0 0`,
                        ].join(' ');

                        return (
                            <path
                                key={index}
                                d={pathData}
                                fill={SYMBOL_COLORS[slice.simbolo] || COLORS[index % COLORS.length]}
                                className={`transition-all cursor-default ${isHovered ? 'scale-[1.05]' : 'opacity-80'}`}
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                                style={{ transformOrigin: '0 0' }}
                            />
                        );
                    })}

                    {/* Fondo del centro (Doughnut) */}
                    <circle cx="0" cy="0" r="0.75" fill="#0f172a" />

                    {/* Contenido en el centro (Logo e Info) */}
                    {activeItem ? (
                        <>
                            {/* Logo usando SVG image para máxima estabilidad y evitar 'barras' */}
                            {CRYPTO_LOGOS[activeItem.simbolo] && (
                                <image
                                    href={CRYPTO_LOGOS[activeItem.simbolo]}
                                    x="-0.15"
                                    y="-0.4"
                                    width="0.3"
                                    height="0.3"
                                    className="transform rotate-90"
                                    style={{ transformOrigin: '0 0' }}
                                />
                            )}

                            {/* Textos usando SVG puro */}
                            <text x="0" y="0.2" textAnchor="middle" fill="white" className="font-bold text-[0.15px] transform rotate-90" style={{ fontSize: '0.12px' }}>
                                {activeItem.simbolo}
                            </text>
                            <text x="0" y="0.35" textAnchor="middle" fill="#10b981" className="font-bold transform rotate-90" style={{ fontSize: '0.15px' }}>
                                ${activeItem.valor.toLocaleString()}
                            </text>
                            <text x="0" y="0.5" textAnchor="middle" fill="#94a3b8" className="transform rotate-90" style={{ fontSize: '0.08px' }}>
                                Venta: ${activeItem.precio_actual?.toLocaleString()}
                            </text>
                        </>
                    ) : (
                        <>
                            <text x="0" y="-0.05" textAnchor="middle" fill="#64748b" className="font-bold uppercase tracking-widest transform rotate-90" style={{ fontSize: '0.1px' }}>
                                Total
                            </text>
                            <text x="0" y="0.15" textAnchor="middle" fill="white" className="font-bold transform rotate-90" style={{ fontSize: '0.2px' }}>
                                ${total.toLocaleString()}
                            </text>
                        </>
                    )}
                </svg>
            </div>

            {/* Leyenda personalizada */}
            <div className="flex flex-col gap-3 min-w-[200px]">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded-lg transition-all ${activeIndex === index ? 'bg-slate-800 ring-1 ring-slate-700' : ''}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: SYMBOL_COLORS[item.simbolo] || COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-bold text-slate-200">{item.simbolo}</span>
                        </div>
                        <span className="text-sm text-slate-400 font-mono">${item.valor.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UserDashboard = () => {
    const [criptos, setCriptos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [dashboardData, setDashboardData] = useState({ activos: [], balance_total: 0 });
    const [formData, setFormData] = useState({
        currency: '',
        type: 'buy', // 'buy' o 'sell'
        amount_crypto: '',
        amount_usd: ''
    });
    const [mensaje, setMensaje] = useState(null);
    const [modalError, setModalError] = useState({ isOpen: false, message: '' });
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [usuario, setUsuario] = useState(null);

    // 1. Cargar datos iniciales
    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem('usuario') || '{}');
        setUsuario(localUser);

        const fetchData = async () => {
            const token = localStorage.getItem('accessToken');
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                // Cargar Monedas
                const resCriptos = await fetch('http://127.0.0.1:8000/api/criptos/', { headers });
                const dataCriptos = await resCriptos.json();
                setCriptos(dataCriptos);
                if (dataCriptos.length > 0) setFormData(prev => ({ ...prev, currency: dataCriptos[0].id }));

                // Cargar Historial
                const resHist = await fetch('http://127.0.0.1:8000/api/transacciones/historial/', { headers });
                const dataHist = await resHist.json();
                setHistorial(Array.isArray(dataHist) ? dataHist : []);

                // Cargar Dashboard Data
                const resDash = await fetch('http://127.0.0.1:8000/api/wallet/dashboard/', { headers });
                const dataDash = await resDash.json();
                setDashboardData(dataDash);

            } catch (error) {
                console.error("Error cargando datos", error);
            }
        };
        fetchData();
    }, []);

    // 2. Para crear las transacciones
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch('http://127.0.0.1:8000/api/transacciones/crear/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje({ type: 'success', text: '¡Solicitud enviada con éxito!' });
                // Recargar historial y dashboard
                const headers = { 'Authorization': `Bearer ${token}` };
                const resHist = await fetch('http://127.0.0.1:8000/api/transacciones/historial/', { headers });
                setHistorial(await resHist.json());

                const resDash = await fetch('http://127.0.0.1:8000/api/wallet/dashboard/', { headers });
                setDashboardData(await resDash.json());

            } else {
                let errorText = 'Error: Verifique los datos';

                if (data) {
                    if (data.non_field_errors && data.non_field_errors.length > 0) {
                        errorText = data.non_field_errors[0];
                    }
                    else if (Array.isArray(data) && data.length > 0) {
                        errorText = data[0];
                    }
                    else if (typeof data === 'object') {
                        const keys = Object.keys(data);
                        if (keys.length > 0) {
                            const firstError = data[keys[0]];
                            if (Array.isArray(firstError)) {
                                errorText = firstError[0];
                            } else {
                                errorText = String(firstError);
                            }
                        }
                    }
                }

                if (typeof errorText === 'string') {
                    if (errorText.includes("Saldo insuficiente") || errorText.includes("No tienes saldo") || errorText.includes("No puedes vender")) {
                        errorText = "Usted no posee el saldo que desea vender";
                    }
                    else if (errorText.includes("monto es muy bajo") || errorText.includes("minimo es de 1 USD") || errorText.includes("monto mínimo")) {
                        errorText = "El minimo de compra o venta es de 1 USD";
                    }
                }

                setMensaje({ type: 'error', text: errorText });
            }
        } catch (error) {
            setMensaje({ type: 'error', text: 'Error de conexión' });
        }
        setTimeout(() => setMensaje(null), 3000);
    };

    const handleDownloadExcel = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setModalError({ isOpen: true, message: "No se encontró token de autenticación. Por favor inicia sesión nuevamente." });
                return;
            }

            const response = await fetch('http://127.0.0.1:8000/api/transactions/exportar_excel/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error al descargar el reporte');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date();
            const timestamp = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
            a.download = `historial_transacciones_${timestamp}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error descargando excel:", error);
            setModalError({ isOpen: true, message: "Hubo un error al descargar el reporte. Inténtalo de nuevo más tarde." });
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-cyan-500 selection:text-white">

            {/* NAVBAR */}
            <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg object-cover shadow-sm" />
                            <span className="font-bold text-xl tracking-tight">Mi Portafolio</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 group"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-white leading-none">{usuario?.name || 'Usuario'}</p>
                                    <p className="text-[10px] text-slate-500 font-medium leading-tight">Mi Cuenta</p>
                                </div>
                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center group-hover:border-cyan-500 transition-colors">
                                    {usuario?.avatar ? (
                                        <img src={usuario.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="h-4 w-4 text-slate-400" />
                                    )}
                                </div>
                            </button>
                            <div className="h-6 w-px bg-slate-800" />
                            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium">
                                <LogOut className="h-4 w-4" /> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* --- SECCIÓN RESUMEN FINANCIERO (SVG SEGURO) --- */}
                <div className="mb-10 p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <DollarSign className="text-cyan-400" /> Resumen Financiero
                    </h2>
                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-bold mb-4">Distribución de Portafolio</h3>
                        {dashboardData.activos && dashboardData.activos.length > 0 ? (
                            <PortfolioPieChart data={dashboardData.activos} />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                                <Wallet className="h-12 w-12 mb-2 opacity-20" />
                                <p>No hay activos aún</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- SECCIÓN MIS ACTIVOS (SEGÚN REFERENCIA) --- */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Wallet className="text-cyan-400" /> Mis Activos
                    </h2>

                    <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                        <div className="divide-y divide-slate-800/50">
                            {dashboardData.activos && dashboardData.activos.length > 0 ? (
                                dashboardData.activos.map((activo, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-center justify-between p-6 hover:bg-slate-800/30 transition-colors group">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            {/* Borde lateral de color */}
                                            <div
                                                className="w-1.5 h-12 rounded-full"
                                                style={{ backgroundColor: SYMBOL_COLORS[activo.simbolo] || COLORS[index % COLORS.length] }}
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg text-slate-100">{activo.simbolo}</span>
                                                    <span className="text-[10px] bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded border border-slate-600 font-mono">
                                                        ${activo.precio_actual?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{activo.nombre}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="text-right">
                                                <p className="font-mono text-lg text-slate-200">{activo.cantidad.toFixed(activo.simbolo === 'USDT' ? 2 : 6)}</p>
                                                <p className="text-sm font-bold text-emerald-400">
                                                    <span className="opacity-50 text-xs mr-1">≈</span>
                                                    ${activo.valor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-500 italic">
                                    No tienes activos en tu billetera en este momento.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- COLUMNA IZQUIERDA: NUEVA OPERACIÓN --- */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-24">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Wallet className="text-cyan-400" /> Nueva Operación
                            </h2>

                            {mensaje && (
                                <div className={`mb-4 p-3 rounded-lg text-sm text-center font-medium ${mensaje.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {mensaje.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Criptomoneda</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                        value={formData.currency}
                                        onChange={(e) => {
                                            const newCurrency = e.target.value;
                                            const sel = criptos.find(c => String(c.id) === String(newCurrency));
                                            const price = sel && sel.preciousd ? Number(sel.preciousd) : 0;
                                            let amount_crypto = formData.amount_crypto;
                                            let amount_usd = formData.amount_usd;
                                            if (amount_usd && price > 0) {
                                                amount_crypto = (Number(amount_usd) / price).toString();
                                            } else if (amount_crypto && price > 0) {
                                                amount_usd = (Number(amount_crypto) * price).toFixed(2).toString();
                                            }
                                            setFormData({ ...formData, currency: newCurrency, amount_crypto, amount_usd });
                                        }}
                                    >
                                        {criptos.map(coin => (
                                            <option key={coin.id} value={coin.id}>{coin.nombrecripto} ({coin.simbolo})</option>
                                        ))}
                                    </select>
                                </div>

                                {formData.currency && (
                                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900/50">
                                        <CryptoChart
                                            symbol={(() => {
                                                const sel = criptos.find(c => String(c.id) === String(formData.currency));
                                                if (!sel) return "BTCUSDT";
                                                const symbol = sel.simbolo?.toUpperCase();
                                                if (symbol === 'XPR') return "KUCOIN:XPRUSDT";
                                                if (symbol === 'USDT') return "BINANCE:USDTUSD";
                                                return `${symbol}USDT`;
                                            })()}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Tipo de Operación</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'buy' })}
                                            className={`p-3 rounded-lg font-bold transition-all ${formData.type === 'buy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                        >
                                            COMPRAR
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'sell' })}
                                            className={`p-3 rounded-lg font-bold transition-all ${formData.type === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                                        >
                                            VENDER
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Cantidad</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Cantidad USD</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                                placeholder="USD 0.00"
                                                value={formData.amount_usd}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const sel = criptos.find(c => String(c.id) === String(formData.currency));
                                                    const price = sel && sel.preciousd ? Number(sel.preciousd) : 0;
                                                    let crypto = '';
                                                    if (price > 0 && val !== '') crypto = (Number(val) / price).toString();
                                                    setFormData({ ...formData, amount_usd: val, amount_crypto: crypto });
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Cantidad Cripto</label>
                                            <input
                                                type="number"
                                                step="0.00000001"
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                                placeholder="0.00000000"
                                                value={formData.amount_crypto}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const sel = criptos.find(c => String(c.id) === String(formData.currency));
                                                    const price = sel && sel.preciousd ? Number(sel.preciousd) : 0;
                                                    let usd = '';
                                                    if (price > 0 && val !== '') usd = (Number(val) * price).toFixed(2).toString();
                                                    setFormData({ ...formData, amount_crypto: val, amount_usd: usd });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex justify-center items-center gap-2">
                                    Procesar Solicitud <ArrowRight className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* --- COLUMNA DERECHA: HISTORIAL --- */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <History className="text-cyan-400" /> Historial de Transacciones
                            </h2>
                            <button
                                onClick={handleDownloadExcel}
                                className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-bold border border-emerald-500/20 transition-all"
                            >
                                <Download className="h-4 w-4" /> Exportar Excel
                            </button>
                        </div>

                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950/50 border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Estado</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Moneda</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Monto</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Total USD</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {historial.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-800/50">
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${tx.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    tx.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    {tx.status === 'pending' ? 'PENDIENTE' : tx.status === 'approved' ? 'APROBADO' : 'RECHAZADO'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                {tx.type === 'buy' ? <ArrowDownLeft className="h-4 w-4 text-emerald-500" /> : <ArrowUpRight className="h-4 w-4 text-red-500" />}
                                                <span className="font-bold text-slate-200">{tx.simbolo_moneda}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-300">{tx.amount_crypto}</td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-100">${tx.amount_usd}</td>
                                            <td className="px-6 py-4 text-right text-xs text-slate-500">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {historial.length === 0 && (
                                        <tr><td colSpan="5" className="p-8 text-center text-slate-500">No hay movimientos aún.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                <div className="mt-16 text-center text-xs text-slate-600 pb-4">
                    <p>&copy; 2026 CryptoManager. Creado para Proyecto Lenguaje III. Todos los derechos reservados</p>
                    <div className="flex justify-center gap-4 mt-2">
                        <a href="/terminos#privacidad" className="hover:text-slate-400">Privacidad</a>
                        <a href="/terminos#terminos" className="hover:text-slate-400">Términos</a>
                    </div>
                </div>
            </main>

            <GestionModal
                isOpen={modalError.isOpen}
                onClose={() => setModalError({ ...modalError, isOpen: false })}
                type="error"
                title="Error de Descarga"
                message={modalError.message}
            />

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
};

export default UserDashboard;
