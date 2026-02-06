import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
const Seguridad = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      
       {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
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
                <Link to="/mercado" className="hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  <span>Mercado</span>
                </Link>                
                <Link to="/seguridad" className="text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
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


      {/* --- HERO SECTION --- */}
      <div className="relative py-20 px-4 text-center border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <span className="text-cyan-400 font-semibold tracking-wider text-sm uppercase">Centro de Confianza</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
            Tu seguridad es nuestra <span className="text-cyan-400">prioridad absoluta</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Utilizamos estándares de encriptación bancaria y protocolos de seguridad de última generación para asegurar que tus activos simulados estén protegidos en todo momento.
          </p>
        </div>
      </div>

      {/* --- GRID DE CARACTERÍSTICAS --- */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Tarjeta 1: Encriptación */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition duration-300">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-6">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Encriptación AES-256</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Todos los datos sensibles se cifran utilizando el estándar de encriptación avanzada de 256 bits, el mismo que utilizan las instituciones militares y bancarias.
            </p>
          </div>

          {/* Tarjeta 2: Cold Storage */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition duration-300">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-6">
              <span className="text-2xl">❄️</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Billeteras Frías (Cold Storage)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Mantenemos el 95% de los activos de los usuarios en almacenamiento fuera de línea ("frío"), protegiéndolos contra accesos no autorizados a través de internet.
            </p>
          </div>

          {/* Tarjeta 3: Protección DDoS */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition duration-300">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-6">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Protección DDoS & CSRF</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Nuestros servidores cuentan con mitigación de ataques y protección CSRF (proporcionada por Django Framework) para evitar suplantaciones de identidad.
            </p>
          </div>

        </div>
      </div>

      {/* --- SECCIÓN DE AUDITORÍA (Visual) --- */}
      <div className="bg-slate-900 py-16 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">Monitoreo en Tiempo Real</h2>
            <p className="text-slate-400">Nuestros sistemas escanean transacciones anómalas 24/7.</p>
          </div>
          
          {/* Un "Badge" de seguridad simulado */}
          <div className="flex gap-4">
             <div className="bg-slate-950 border border-slate-700 px-6 py-3 rounded-lg flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-mono text-green-400">STATUS: ONLINE </span>
             </div>
          </div>
        </div>
      </div>

      {/* --- CTA FINAL --- */}
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold mb-6">¿Listo para operar seguro?</h2>
        <Link to="/login">
            <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-8 rounded-full transition duration-300">
            Crear Cuenta Segura
            </button>
        </Link>
      </div>

    </div>
  );
};

export default Seguridad;