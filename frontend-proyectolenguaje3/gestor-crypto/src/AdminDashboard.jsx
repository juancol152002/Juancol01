import React, { useState, useEffect } from 'react';
import GestionModal from './components/GestionModal';
import logoImg from './assets/components/logo.jpg';
import {
    TrendingUp,
    LogOut,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    Download,
    User
} from 'lucide-react';
import ProfileModal from './components/ProfileModal';

const AdminDashboard = () => {
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: '', // 'error', 'confirmation', 'success'
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar'
    });
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [filterStatus, setFilterStatus] = useState('pending');
    const [filterType, setFilterType] = useState('all');

    // 1. Aca se cargan los datos reales de nuestro backend (Django)
    const cargarTransacciones = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            // Construimos la URL con filtros
            let url = `http://localhost:8000/api/admin/transacciones/?status=${filterStatus}`;
            if (filterType !== 'all') {
                url += `&type=${filterType}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                setModalState({
                    isOpen: true,
                    type: 'error',
                    title: 'Sesión Expirada',
                    message: "Tu sesión ha expirado. Por favor inicia sesión de nuevo."
                });
                localStorage.removeItem('accessToken'); // Borramos el token viejo
                localStorage.removeItem('usuario');
                setTimeout(() => window.location.href = '/', 3000); // Lo mandamos a la fuerza al Login
                return;
            }
            if (response.ok) {
                const data = await response.json();
                console.log("📦 DATOS RECIBIDOS:", data);

                // LÓGICA ANTI-PAGINACIÓN:
                // Si Django envía resultados paginados, sacamos la lista de 'results'.
                if (Array.isArray(data)) {
                    setTransacciones(data);
                } else if (data.results) {
                    setTransacciones(data.results);
                } else {
                    setTransacciones([]);
                }
            }

        } catch (error) {
            console.error("Error de red:", error);
        } finally {
            setLoading(false);
        }
    };

    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem('usuario') || '{}');
        setUsuario(localUser);
        cargarTransacciones();
    }, [filterStatus, filterType]); // Recargar cuando cambien los filtros

    // --- LÓGICA DE PAGINACIÓN ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Cantidad de items por página

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transacciones.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(transacciones.length / itemsPerPage);

    // Resetear a la página 1 cuando cambian los filtros o los datos
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterType, transacciones]);


    // 2. Funcion para iniciar el proceso de aprobación/rechazo (Abre Modal)
    const procesarTransaccion = (id, accion) => {
        const esAprobar = accion === 'aprobar';
        setModalState({
            isOpen: true,
            type: 'confirmation',
            title: esAprobar ? '¿Aprobar Transacción?' : '¿Rechazar Transacción?',
            message: esAprobar
                ? `Esta acción aprobará y completará la transacción #${id} de forma permanente.`
                : `Esta acción rechazará y cancelará la transacción #${id} de forma permanente.`,
            confirmText: esAprobar ? 'Aprobar' : 'Rechazar',
            cancelText: 'Cancelar',
            onConfirm: () => ejecutarAccion(id, accion)
        });
    };

    // 3. Función que realmente llama a la API (Se ejecuta al confirmar en el modal)
    const ejecutarAccion = async (id, accion) => {
        try {
            const token = localStorage.getItem('accessToken');
            // Llamamos al endpoint con el ID y la acción
            const response = await fetch(`http://localhost:8000/api/admin/transacciones/${id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ accion: accion }) // Enviamos 'aprobar' o 'rechazar'
            });

            const data = await response.json();

            if (response.ok) {
                // Éxito: Mostramos modal de éxito
                setModalState({
                    isOpen: true,
                    type: accion === 'aprobar' ? 'success' : 'success_reject',
                    title: 'Transacción Procesada',
                    // Eliminamos emojis y usamos iconos en el modal
                    message: data.message,
                    onConfirm: () => setModalState({ ...modalState, isOpen: false }) // Cerrar al aceptar
                });
                // Recargamos la lista
                cargarTransacciones();
            } else {
                // Error de API
                setModalState({
                    isOpen: true,
                    type: 'error',
                    title: 'Error al procesar',
                    message: data.error || 'No se pudo completar la acción.'
                });
            }

        } catch (error) {
            console.error("Error procesando:", error);
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Error de Conexión',
                message: 'Verifique su conexión a internet e inténtelo de nuevo.'
            });
        }
    };

    const handleDownloadGlobalExcel = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setModalState({ isOpen: true, type: 'error', title: 'Autenticación', message: "No se encontró token de autenticación. Por favor inicia sesión nuevamente." });
                return;
            }

            // Llamamos al nuevo endpoint de admin
            const response = await fetch('http://localhost:8000/api/transactions/exportar_todo_excel/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error al descargar el reporte global');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Timestamp para nombre único
            const date = new Date();
            const timestamp = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`;
            a.download = `reporte_global_transacciones_${timestamp}.xlsx`;

            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error descargando reporte global:", error);
            setModalState({ isOpen: true, type: 'error', title: 'Error de Descarga', message: "Hubo un error al descargar el reporte global. Inténtalo de nuevo más tarde." });
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-cyan-500 selection:text-white">

            {/* NAVBAR */}
            <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo y Título */}
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-800/80 p-2 pr-4 rounded-xl border border-slate-700/50 flex items-center gap-3">
                                <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm tracking-wide text-slate-200 leading-none">CryptoManager</span>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-500 leading-none mt-0.5">Admin</span>
                                </div>
                            </div>
                        </div>

                        {/* Menú de Usuario */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="group flex items-center gap-3 pl-4 pr-1.5 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-full border border-slate-700/50 hover:border-slate-600 transition-all"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{usuario?.first_name || usuario?.username || 'Usuario'}</p>
                                    <p className="text-[10px] text-cyan-400 font-medium">Administrador</p>
                                </div>
                                <div className="h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-slate-800 group-hover:ring-cyan-500/50 transition-all">
                                    <User className="h-4 w-4 text-slate-300" />
                                </div>
                            </button>

                            <button
                                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                                className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* HEADER DE SECCIÓN */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Panel de Aprobaciones
                        </h1>
                        <p className="text-slate-400">
                            Gestiona las solicitudes de compra y venta en tiempo real.
                        </p>
                        <button
                            onClick={handleDownloadGlobalExcel}
                            className="mt-4 flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm font-bold border border-emerald-500/20 transition-all"
                        >
                            <Download className="h-4 w-4" /> Exportar Reporte Global
                        </button>
                    </div>

                    {/* Pequeña estadística (Decorativo) */}
                    <div className="bg-slate-800/50 border border-slate-700/50 px-4 py-2 rounded-lg flex items-center gap-3">
                        <div className={`p-2 rounded-full ${filterStatus === 'all' ? 'bg-cyan-500/10' :
                            filterStatus === 'approved' ? 'bg-emerald-500/10' :
                                filterStatus === 'rejected' ? 'bg-red-500/10' : 'bg-orange-500/10'
                            }`}>
                            {filterStatus === 'all' ? <TrendingUp className="h-4 w-4 text-cyan-400" /> :
                                filterStatus === 'approved' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> :
                                    filterStatus === 'rejected' ? <XCircle className="h-4 w-4 text-red-400" /> :
                                        <Clock className="h-4 w-4 text-orange-400" />}
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 uppercase font-bold">
                                {filterStatus === 'all' ? 'Total' :
                                    filterStatus === 'approved' ? 'Aprobadas' :
                                        filterStatus === 'rejected' ? 'Rechazadas' : 'Pendientes'}
                            </div>
                            <div className="text-xl font-bold text-slate-100">{transacciones.length}</div>
                        </div>
                    </div>
                </div>

                {/* FILTROS */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Filtro Estado */}
                    <div className="bg-slate-800/50 border border-slate-700/50 p-1 rounded-lg flex">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterStatus === 'all' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterStatus === 'pending' ? 'bg-orange-500/20 text-orange-400 shadow ring-1 ring-orange-500/50' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Pendientes
                        </button>
                        <button
                            onClick={() => setFilterStatus('approved')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400 shadow ring-1 ring-emerald-500/50' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Aprobadas
                        </button>
                        <button
                            onClick={() => setFilterStatus('rejected')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterStatus === 'rejected' ? 'bg-red-500/20 text-red-400 shadow ring-1 ring-red-500/50' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Rechazadas
                        </button>
                    </div>

                    {/* Filtro Tipo */}
                    <div className="bg-slate-800/50 border border-slate-700/50 p-1 rounded-lg flex">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'all' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFilterType('buy')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'buy' ? 'bg-emerald-500/20 text-emerald-400 shadow ring-1 ring-emerald-500/50' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Compras
                        </button>
                        <button
                            onClick={() => setFilterType('sell')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filterType === 'sell' ? 'bg-cyan-500/20 text-cyan-400 shadow ring-1 ring-cyan-500/50' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Ventas
                        </button>
                    </div>
                </div>

                {/* NOTE: Eliminamos la alerta roja inline que estaba aquí */}

                {/* TABLA DE TRANSACCIONES */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">
                            Cargando transacciones...
                        </div>
                    ) : (
                        <>
                            {/* --- VISTA DE ESCRITORIO (TABLA) --- */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-950/50 border-b border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuario</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Monto Crypto</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total USD</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Acciones/Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {currentTransactions.length > 0 ? currentTransactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">#{tx.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-200">{tx.email_usuario}</div>
                                                    <div className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${tx.type === 'buy'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                                            }`}>
                                                            {tx.type === 'buy' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                                        </div>
                                                        <span className={`text-xs font-bold uppercase ${tx.type === 'buy' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                                                            {tx.type === 'buy' ? 'Compra' : 'Venta'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-slate-300">
                                                    {Number(tx.amount_crypto).toLocaleString('es-ES', { maximumFractionDigits: 8 })} <span className="text-slate-500 ml-1">{tx.simbolo_moneda}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-100">
                                                    ${Number(tx.amount_usd).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {tx.status === 'pending' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => procesarTransaccion(tx.id, 'aprobar')}
                                                                    title="Aprobar"
                                                                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition-all border border-emerald-500/20"
                                                                >
                                                                    <CheckCircle2 className="h-5 w-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => procesarTransaccion(tx.id, 'rechazar')}
                                                                    title="Rechazar"
                                                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all border border-red-500/20"
                                                                >
                                                                    <XCircle className="h-5 w-5" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${tx.status === 'approved'
                                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                                                                }`}>
                                                                {tx.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                                <span className="text-xs font-bold uppercase">
                                                                    {tx.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="py-16 text-center">
                                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                                                        <Search className="h-8 w-8 text-slate-600" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-slate-300">Sin resultados</h3>
                                                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                                        No hay transacciones que coincidan con los filtros actuales.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* --- VISTA DE MÓVIL (TARJETAS) --- */}
                            <div className="md:hidden flex flex-col divide-y divide-slate-800/50">
                                {currentTransactions.length > 0 ? currentTransactions.map((tx) => (
                                    <div key={tx.id} className="p-4 bg-slate-800/10 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className={`p-2 rounded-lg ${tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                                    {tx.type === 'buy' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-200 text-sm">
                                                        {tx.type === 'buy' ? 'Compra' : 'Venta'} de {tx.simbolo_moneda}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</div>
                                                    <div className="text-xs text-slate-400 mt-1">{tx.email_usuario}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-slate-100">${Number(tx.amount_usd).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                <div className="text-xs font-mono text-slate-500">{Number(tx.amount_crypto).toLocaleString('es-ES', { maximumFractionDigits: 8 })} {tx.simbolo_moneda}</div>
                                            </div>
                                        </div>

                                        {tx.status === 'pending' ? (
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => procesarTransaccion(tx.id, 'aprobar')}
                                                    className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" /> Aprobar
                                                </button>
                                                <button
                                                    onClick={() => procesarTransaccion(tx.id, 'rechazar')}
                                                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <XCircle className="h-4 w-4" /> Rechazar
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`mt-2 py-2 rounded-xl flex items-center justify-center gap-2 border ${tx.status === 'approved'
                                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
                                                : 'bg-red-500/5 border-red-500/20 text-red-500'
                                                }`}>
                                                {tx.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                <span className="font-bold text-sm uppercase">
                                                    {tx.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="py-12 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-3">
                                            <Search className="h-6 w-6 text-slate-600" />
                                        </div>
                                        <p className="text-slate-500">No hay transacciones.</p>
                                    </div>
                                )}
                            </div>

                            {/* --- PAGINACIÓN --- */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <span className="text-xs text-slate-500">
                                        Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, transacciones.length)} de {transacciones.length}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                                        >
                                            Anterior
                                        </button>
                                        <div className="flex items-center gap-1 px-2">
                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                // Lógica simple para mostrar 5 páginas (se puede mejorar)
                                                let pageNum = i + 1;
                                                // Si hay muchas páginas, mostramos un rango cercano
                                                if (totalPages > 5 && currentPage > 3) {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                // Ajuste final si se pasa
                                                if (pageNum > totalPages) return null;

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                                                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                                            : 'text-slate-500 hover:bg-slate-800'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer movido un poco más abajo con margen superior */}
                <div className="mt-16 text-center text-xs text-slate-600 pb-4">
                    <p>&copy; 2026 CryptoManager. Creado para Proyecto Lenguaje III. Todos los derechos reservados</p>
                    <div className="flex justify-center gap-4 mt-2">
                        <a href="/terminos#privacidad" className="hover:text-slate-400">Privacidad</a>
                        <a href="/terminos#terminos" className="hover:text-slate-400">Términos</a>
                    </div>
                </div>
            </main>

            <GestionModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                type={modalState.type || 'error'}
                title={modalState.title}
                message={modalState.message}
                onConfirm={modalState.onConfirm}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
            />

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
};

export default AdminDashboard;