import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/components/logo.jpg';
import { TrendingUp, Instagram, Send, MessageCircle, ArrowRight, ShieldCheck, Lock, Globe, Eye, AlertTriangle, Fingerprint, Key, ShieldAlert, ChevronRight } from 'lucide-react';

const Seguridad = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">

      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
              <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform" />
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                CryptoManager
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/mercado" className="hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                  <span>Mercado</span>
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
      <div className="relative pt-32 pb-20 px-4 text-center border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <span className="text-cyan-400 font-semibold tracking-wider text-sm uppercase px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
            Centro de Seguridad
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-6">
            Tu seguridad es nuestra <span className="text-cyan-400">prioridad absoluta</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Utilizamos estándares de encriptación bancaria y protocolos de seguridad de última generación para asegurar que tus activos simulados estén protegidos en todo momento.
          </p>
        </div>
      </div>

      {/* --- GRID DE CARACTERÍSTICAS CON TUS TEXTOS ORIGINALES --- */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Tarjeta 1: Encriptación */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transform hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 group">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lock className="text-cyan-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Encriptación AES-256</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Todos los datos sensibles se cifran utilizando el estándar de encriptación avanzada de 256 bits, el mismo que utilizan las instituciones militares y bancarias.
            </p>
          </div>

          {/* Tarjeta 2: Cold Storage */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transform hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 group">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="text-cyan-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Billeteras Frías (Cold Storage)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Mantenemos el 95% de los activos de los usuarios en almacenamiento fuera de línea ("frío"), protegiéndolos contra accesos no autorizados a través de internet.
            </p>
          </div>

          {/* Tarjeta 3: Protección DDoS */}
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transform hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 group">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Globe className="text-cyan-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Protección DDoS & CSRF</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Nuestros servidores cuentan con mitigación de ataques y protección CSRF (proporcionada por Django Framework) para evitar suplantaciones de identidad.
            </p>
          </div>

        </div>
      </div>

      {/* --- SECCIÓN DE AUDITORÍA --- */}
      <div className="bg-slate-900/50 py-16 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Monitoreo en Tiempo Real</h2>

            VE

            Saltar navegación
            Buscar



            Crear

            9+

            Imagen del avatar

            VE

            <p className="text-slate-400">Nuestros sistemas escanean transacciones anómalas 24/7.</p>
          </div>
          <div className="bg-slate-950 border border-slate-700 px-6 py-3 rounded-xl flex items-center gap-3 shadow-inner">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-sm font-mono text-green-400 tracking-widest uppercase">STATUS: ONLINE </span>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE TÉRMINOS Y CONDICIONES --- */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="p-1 rounded-2xl bg-gradient-to-r from-transparent via-slate-800 to-transparent">
          <div className="py-8 px-6">
            <h3 className="text-xl font-bold mb-4">Marco Legal y Transparencia</h3>
            <p className="text-slate-400 mb-6 text-sm italic">
              "La seguridad es un compromiso compartido entre la plataforma y el usuario."
            </p>
            <Link
              to="/terminos"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors group"
            >
              Consultar Términos y Condiciones
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* --- CTA FINAL --- */}
      <div className="pb-28 text-center px-4">
        <h2 className="text-3xl font-bold mb-8">¿Listo para operar seguro?</h2>
        <Link to="/login">
          <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-4 px-10 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            Crear Cuenta Segura
          </button>
        </Link>
      </div>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-800 py-16 bg-slate-950 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-white text-xl font-bold mb-4 flex items-center">
                <span className="text-cyan-400 mr-2">◈</span> CryptoManager
              </h3>
              <p className="text-sm leading-relaxed">
                Gestión avanzada de activos digitales con datos en tiempo real y seguridad Cold Storage.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-cyan-400 transition">Inicio</Link></li>
                <li><Link to="/mercado" className="hover:text-cyan-400 transition">Mercado</Link></li>
                <li><Link to="/login" className="hover:text-cyan-400 transition">Mi Inventario</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contacto" className="hover:text-cyan-400 transition">Contacto</Link></li>
                <li><a href="/faq" className="hover:text-cyan-400 transition">Preguntas Frecuentes</a></li>
                <li><Link to="/terminos#terminos" className="hover:text-cyan-400 transition">Términos y condiciones</Link></li>
                <li><Link to="/terminos#privacidad" className="hover:text-cyan-400 transition">Política de privacidad</Link></li>
              </ul>
            </div>
            <div className="flex flex-col">
              <h3 className="text-white font-bold mb-6">Mantente al día</h3>
              <div className="flex gap-4 mb-6">
                <SocialIcon href="https://www.instagram.com/danieln0908/" Icon={Instagram} hover="hover:bg-gradient-to-tr hover:from-yellow-500 hover:to-purple-500" />
                <SocialIcon href="https://t.me/danieln1304" Icon={Send} hover="hover:bg-[#0088cc] hover:border-[#0088cc] hover:shadow-[0_0_15px_rgba(0,136,204,0.5)]" />
                <SocialIcon href="https://wa.me/584122080281" Icon={MessageCircle} hover="hover:bg-emerald-500" />
              </div>
              <p className="text-slate-500 text-sm">Sigue nuestras actualizaciones.</p>
            </div>
          </div>
          <div className="border-t border-slate-900 pt-8 text-center text-xs">
            <p>&copy; 2026 CryptoManager. Creado para Proyecto Lenguaje III. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const SocialIcon = ({ href, Icon, hover }) => (
  <a
    href={href} target="_blank" rel="noopener noreferrer"
    className={`w - 10 h - 10 rounded - full bg - slate - 800 flex items - center justify - center text - slate - 400 hover: text - white transition - all duration - 300 border border - slate - 700 ${hover} `}
  >
    <Icon size={20} />
  </a>
);

export default Seguridad;