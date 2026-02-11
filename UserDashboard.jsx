import React, { useState, useEffect } from 'react';
import GestionModal from './components/GestionModal';
import PortfolioChart from './components/PortfolioChart';
import RetiroModal from './components/RetiroModal';
import axios from 'axios';
import { 
    TrendingUp, 
    History, 
    Wallet, 
    ArrowRight, 
    ArrowDownLeft, 
    ArrowUpRight, 
    LogOut, 
    Download,
    DollarSign 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const UserDashboard = () => {
    // --- ESTADOS ---
    // ✅ CORREGIDO: Los estados deben estar DENTRO del componente
    const [isRetiroModalOpen, setIsRetiroModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(null);

    const [criptos, setCriptos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [billeteras, setBilleteras] = useState([]); 
    const [totalBalance, setTotalBalance] = useState(0); 
    
    const [formData, setFormData] = useState({
        currency: '',
        type: 'buy',
        amount_crypto: '',
        amount_usd: ''
    });
    const [mensaje, setMensaje] = useState(null);
    const [modalError, setModalError] = useState({ isOpen: false, message: '' });
    
    // --- FUNCIÓN DE RECARGA DE DATOS ---
    // (La sacamos del useEffect para poder reusarla al hacer un retiro)
    const fetchData = async () => {
        const token = localStorage.getItem('accessToken');
        // Si no hay token, no intentamos fetch (evita errores 401 innecesarios)
        if (!token) return; 

        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const promCriptos = fetch(`${API_URL}/api/criptos/`, { headers });
            const promHist = fetch(`${API_URL}/api/transacciones/historial/`, { headers });
            const promBalance = fetch(`${API_URL}/api/wallet/balance/`, { headers });

            const [resCriptos, resHist, resBalance] = await Promise.all([
                promCriptos, 
                promHist, 
                promBalance
            ]);

            // 1. Procesamos Criptos
            if (resCriptos.ok) {
                const dataCriptos = await resCriptos.json();
                setCriptos(dataCriptos);
                // Solo setear moneda por defecto si no se ha elegido una aún
                if (dataCriptos.length > 0 && formData.currency === '') {
                    setFormData(prev => ({ ...prev, currency: dataCriptos[0].id }));
                }
            }

            // 2. Procesamos Historial
            if (resHist.ok) {
                const dataHist = await resHist.json();
                setHistorial(Array.isArray(dataHist) ? dataHist : []);
            }

            // 3. Procesamos Balance
            if (resBalance.ok) {
                const dataBalance = await resBalance.json();
                setBilleteras(dataBalance);
                const total = dataBalance.reduce((acc, curr) => acc + parseFloat(curr.valor_en_usd), 0);
                setTotalBalance(total.toFixed(2));
            }

        } catch (error) {
            console.error("Error cargando datos", error);
            setMensaje({ type: 'error', text: 'Error de conexión con el servidor' });
        }
    };

    // --- CARGAR DATOS INICIALES ---
    useEffect(() => {
        fetchData();
    }, []);

    // --- MANEJO DE FORMULARIO DE COMPRA/VENTA ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch(`${API_URL}/api/transacciones/crear/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Bypass-Tunnel-Reminder': 'true',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje({ type: 'success', text: '¡Solicitud enviada con éxito!' });
                fetchData(); // Recargar todo (historial y balance)
            } else {
                let errorText = 'Error: Verifique los datos';
                if (data.non_field_errors) errorText = data.non_field_errors[0];
                else if (data.detail) errorText = data.detail;
                
                if (typeof errorText === 'string') {
                    if (errorText.includes("Saldo insuficiente")) errorText = "Usted no posee el saldo suficiente";
                    else if (errorText.includes("monto es muy bajo")) errorText = "El monto es muy bajo";
                }
                setMensaje({ type: 'error', text: errorText });
            }
        } catch (error) {
            setMensaje({ type: 'error', text: 'Error de conexión' });
        }
        setTimeout(() => setMensaje(null), 3000);
    };

    // --- DESCARGAR EXCEL ---
    const handleDownloadExcel = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/transactions/exportar_todo_excel/`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Error al descargar');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `historial_${new Date().getTime()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            setModalError({ isOpen: true, message: "Error al descargar reporte." });
        }
    };

    // --- FUNCIONES DE RETIRO ---
    const handleOpenRetiro = (wallet) => {
        setSelectedWallet(wallet);
        setIsRetiroModalOpen(true);
    };

    const handleProcesarRetiro = async (withdrawalData) => { // withdrawalData contiene lo del modal
    const token = localStorage.getItem('accessToken');
    
    try {
        const response = await axios.post(
            `${API_URL}/api/wallet/transacciones/retirar/`, 
            withdrawalData, // 👈 Verificamos que enviamos el objeto completo
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setMensaje({ type: 'success', text: 'Retiro solicitado.' });
        fetchData();
    } catch (error) {
        // 👇 Esto te dirá el error exacto de Django en el Dashboard
        const serverError = error.response?.data?.error || "Error en los datos";
        setMensaje({ type: 'error', text: serverError });
    }
};
    // --- RENDERIZADO VISUAL ---
    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-cyan-500 selection:text-white">

            {/* NAVBAR */}
            <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-cyan-500 p-1.5 rounded-lg"><TrendingUp className="h-5 w-5 text-white" /></div>
                            <span className="font-bold text-xl tracking-tight">Mi Portafolio</span>
                        </div>
                        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium">
                            <LogOut className="h-4 w-4" /> Salir
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {mensaje && (
                    <div className={`mb-6 p-4 rounded-lg text-center font-bold border shadow-lg transition-all transform duration-300 ${
                        mensaje.type === 'success' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                        {mensaje.text}
                    </div>
                )}

                {/* --- SECCIÓN SUPERIOR: GRÁFICA Y BALANCES --- */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                         <DollarSign className="text-cyan-400" /> Resumen Financiero
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Tarjeta 1: Saldo Total Grande */}
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-center items-center">
                            <div className="bg-cyan-500/20 p-4 rounded-full mb-4">
                                <DollarSign className="w-10 h-10 text-cyan-400" />
                            </div>
                            <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Balance Total Estimado</h2>
                            <p className="text-4xl font-bold text-white mt-2">${totalBalance}</p>
                            <span className="text-emerald-400 text-sm mt-2 flex items-center gap-1">
                                <TrendingUp size={16} /> Portafolio Actualizado
                            </span>
                        </div>

                        {/* Tarjeta 2: La Gráfica de Torta */}
                        <div className="md:col-span-2">
                            <PortfolioChart data={billeteras} />
                        </div>
                    </div>

                    {/* --- LISTA MINIMALISTA DE ACTIVOS --- */}
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Wallet className="text-cyan-400" /> Mis Activos
                    </h3>

                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-8 shadow-lg">
                        {billeteras.length > 0 ? (
                            <div className="divide-y divide-slate-700/50">
                                {billeteras.map((wallet) => {
                                    // Mapa de colores
                                    const COLORS_MAP = {
                                        BTC: '#F7931A', ETH: '#497493', DOGE: '#e1b303', XRP: '#1b95ca', 
                                        USDT: '#2ea07b', BNB: '#F3BA2F', SOL: '#00FFA3',
                                    };
                                    const colorMoneda = COLORS_MAP[wallet.simbolo] || '#CBD5E1';

                                    return (
                                        <div key={wallet.id} className="p-4 flex flex-col sm:flex-row justify-between items-center hover:bg-slate-700/30 transition-all cursor-default group">
                                            
                                            {/* IZQUIERDA: Identidad de la moneda */}
                                            <div className="flex items-center gap-4 w-full sm:w-auto mb-2 sm:mb-0">
                                                <div className="h-10 w-1.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]" style={{ backgroundColor: colorMoneda }}></div>
                                                
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-lg text-white tracking-wide">{wallet.simbolo}</h4>
                                                        <span className="bg-slate-900 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-700">
                                                            ${wallet.precio_actual}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-400 text-xs font-medium uppercase">{wallet.nombre_moneda}</p>
                                                </div>
                                            </div>

                                            {/* DERECHA: Saldos y Botones */}
                                            <div className="flex flex-col sm:flex-row items-center sm:gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                                                <div className="text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end">
                                                    <span className="text-sm text-slate-400 sm:hidden">Saldo:</span> 
                                                    <div>
                                                        <p className="text-white font-mono text-lg tracking-tight">
                                                            {parseFloat(wallet.balance).toFixed(6)}
                                                        </p>
                                                        <p className="text-emerald-400 text-sm font-bold flex items-center justify-end gap-1">
                                                            ≈ ${wallet.valor_en_usd}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* BOTÓN RETIRAR */}
                                                <div className="w-full sm:w-auto mt-2 sm:mt-0 flex justify-end">
                                                    <button 
                                                        onClick={() => handleOpenRetiro(wallet)}
                                                        className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-600 hover:border-slate-500"
                                                    >
                                                        <ArrowUpRight className="w-3 h-3" /> Retirar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                No tienes criptomonedas aún. ¡Haz tu primera compra!
                            </div>
                        )}
                    </div>
                </div>

                {/* --- SECCIÓN INFERIOR: OPERACIONES E HISTORIAL --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* COLUMNA IZQUIERDA: NUEVA OPERACIÓN */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-24">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Wallet className="text-cyan-400" /> Nueva Operación
                            </h2>

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
                                            
                                            // Recalcular montos
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

                    {/* COLUMNA DERECHA: HISTORIAL */}
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
            </main>

            <GestionModal
                isOpen={modalError.isOpen}
                onClose={() => setModalError({ ...modalError, isOpen: false })}
                type="error"
                title="Error de Descarga"
                message={modalError.message}
            />

            <RetiroModal 
                isOpen={isRetiroModalOpen}
                onClose={() => setIsRetiroModalOpen(false)}
                wallet={selectedWallet}
                onSubmit={handleProcesarRetiro}
            />
        </div>
    );
};

export default UserDashboard;