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

    // 1. Aca se cargan los datos reales de nuestro backend (Django)
    const cargarTransacciones = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://127.0.0.1:8000/api/admin/transacciones/', {
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
    }, []);

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
            const response = await fetch(`http://127.0.0.1:8000/api/admin/transacciones/${id}/`, {
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
            const response = await fetch('http://127.0.0.1:8000/api/transactions/exportar_todo_excel/', {
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
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg object-cover shadow-sm" />
                            <span className="font-bold text-xl tracking-tight">
                                CryptoManager <span className="text-slate-500 text-sm font-normal ml-2">| Admin</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 group"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-white leading-none">{usuario?.name || 'Admin'}</p>
                                    <p className="text-[10px] text-slate-500 font-medium leading-tight">Administrador</p>
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
                            <button
                                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                                className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-800"
                            >
                                <LogOut className="h-4 w-4" />
                                Cerrar Sesión
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
                        <div className="bg-orange-500/10 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-orange-400" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 uppercase font-bold">Pendientes</div>
                            <div className="text-xl font-bold text-slate-100">{transacciones.length}</div>
                        </div>
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950/50 border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuario</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Monto Crypto</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total USD</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {transacciones.length > 0 ? transacciones.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">#{tx.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-200">{tx.email_usuario}</div>
                                                <div className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${tx.type === 'buy'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                                    }`}>
                                                    {tx.type === 'buy' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                                    {tx.type === 'buy' ? 'COMPRA' : 'VENTA'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-300">
                                                {tx.amount_crypto} <span className="text-slate-500 ml-1">{tx.simbolo_moneda}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-100">
                                                ${tx.amount_usd}
                                            </td>
                                            <td className="px-6 py-4">

                                                <div className="flex items-center justify-center gap-2">
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
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="py-16 text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                                                    <Search className="h-8 w-8 text-slate-600" />
                                                </div>
                                                <h3 className="text-lg font-medium text-slate-300">Todo al día</h3>
                                                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                                    No hay transacciones pendientes de revisión en este momento.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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