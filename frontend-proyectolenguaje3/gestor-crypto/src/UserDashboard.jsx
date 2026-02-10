import React, { useState, useEffect } from 'react';
import GestionModal from './components/GestionModal';
import { TrendingUp, History, Wallet, ArrowRight, ArrowDownLeft, ArrowUpRight, LogOut, Download } from 'lucide-react';

const UserDashboard = () => {
    const [criptos, setCriptos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [formData, setFormData] = useState({
        currency: '',
        type: 'buy', // 'buy' o 'sell'
        amount_crypto: '',
        amount_usd: ''
    });
    const [mensaje, setMensaje] = useState(null);
    const [modalError, setModalError] = useState({ isOpen: false, message: '' });

    // 1. Cargar datos iniciales (Monedas e Historial)
    useEffect(() => {
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
                // Recargar historial para ver la nueva pendiente
                const resHist = await fetch('http://127.0.0.1:8000/api/transacciones/historial/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setHistorial(await resHist.json());
            } else {
                let errorText = 'Error: Verifique los datos';

                // Intentamos extraer el mensaje de error del backend
                if (data) {
                    if (data.non_field_errors && data.non_field_errors.length > 0) {
                        errorText = data.non_field_errors[0];
                    }
                    else if (Array.isArray(data) && data.length > 0) {
                        errorText = data[0];
                    }
                    else if (typeof data === 'object') {
                        // Si es un objeto (ej: { amount_crypto: [...] }), tomamos el primer error
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

                // REQUERIMIENTO: Mensaje específico para falta de saldo
                if (typeof errorText === 'string') {
                    if (errorText.includes("Saldo insuficiente") || errorText.includes("No tienes saldo") || errorText.includes("No puedes vender")) {
                        errorText = "Usted no posee el saldo que desea vender";
                    }
                    // REQUERIMIENTO: Mensaje específico para monto mínimo
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
            // Agregamos un timestamp para que el nombre sea único
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
            </main>

            <GestionModal
                isOpen={modalError.isOpen}
                onClose={() => setModalError({ ...modalError, isOpen: false })}
                type="error"
                title="Error de Descarga"
                message={modalError.message}
            />
        </div>
    );
};

export default UserDashboard;