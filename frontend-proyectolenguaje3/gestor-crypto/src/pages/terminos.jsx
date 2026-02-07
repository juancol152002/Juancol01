import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, Scale, ShieldCheck, AlertTriangle, Instagram, Send, MessageCircle, FileText, EyeOff, Ban, UserCheck } from 'lucide-react';

const Terminos = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans pb-20">
      
      {/* --- HEADER DINÁMICO --- */}
      <div className="bg-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <Link to="/" className="text-cyan-400 flex items-center gap-2 mb-6 hover:text-cyan-300 transition-colors">
            <ChevronLeft size={20} /> Volver al Inicio
          </Link>
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Centro <span className="text-cyan-500">Legal</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Términos de Servicio y Políticas de Privacidad • Actualizado Feb 2026
          </p>
          
          <div className="flex gap-4 mt-8">
            {/* Botón Términos: Se pone Cian si el hash es #terminos o si no hay hash (por defecto) */}
            <a 
              href="#terminos" 
              className={`text-xs px-4 py-2 rounded-full border transition-all ${
                hash === '#terminos' || hash === '' 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Términos de Uso
            </a>

            {/* Botón Privacidad: Se pone Cian solo si el hash es #privacidad */}
            <a 
              href="#privacidad" 
              className={`text-xs px-4 py-2 rounded-full border transition-all ${
                hash === '#privacidad' 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Política de Privacidad
            </a>
          </div>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="max-w-4xl mx-auto px-6 py-12 leading-relaxed">
        
        {/* ================= SECTION 1: TÉRMINOS Y CONDICIONES ================= */}
        <div id="terminos" className="space-y-12 mb-24">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 border-b border-slate-800 pb-4">
            <Scale className="text-cyan-500" /> Términos y Condiciones
          </h2>
          
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="text-cyan-500" size={20} /> 1. Aceptación de los Términos
            </h3>
            <p className="pl-1">
              Al acceder y utilizar <strong>CryptoManager</strong>, usted acepta cumplir y estar sujeto a los siguientes términos. Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar nuestros servicios.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="text-cyan-500" size={20} /> 2. Descripción del Servicio
            </h3>
            <p className="pl-1">
              CryptoManager es una plataforma de visualización y gestión de inventario de activos digitales. No somos un exchange, no custodiamos fondos reales y no procesamos transacciones fiduciarias. Los datos de mercado son proporcionados por APIs externas y pueden tener retrasos.
            </p>
          </section>

          {/* --- SECCIÓN CORREGIDA: ADVERTENCIA DE RIESGO --- */}
          <section className="relative -mx-4 md:-mx-6"> 
            {/* El margen negativo compensa el padding para que el contenido interno se alinee con el resto */}
            <div className="bg-amber-500/5 p-6 md:p-8 rounded-2xl border border-amber-500/20 shadow-lg">
              <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> 3. Advertencia de Riesgo
              </h3>
              <p className="text-slate-400 leading-relaxed pl-1">
                La inversión en criptoactivos conlleva un riesgo significativo. <strong>CryptoManager</strong> no proporciona asesoramiento financiero, gestión de carteras reales ni recomendaciones de inversión. Cualquier decisión de compra o venta de activos reales basada en la información de esta plataforma es responsabilidad exclusiva del usuario.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
               <UserCheck size={20} className="text-cyan-500"/> 4. Cuentas de Usuario
            </h3>
            <p className="pl-1">
              Usted es responsable de mantener la confidencialidad de sus credenciales de acceso. Cualquier actividad realizada bajo su cuenta será su responsabilidad.
            </p>
          </section>
        </div>

        {/* ================= SECTION 2: POLÍTICA DE PRIVACIDAD ================= */}
        <div id="privacidad" className="space-y-12 pt-12 border-t-2 border-cyan-500/20">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 border-b border-slate-800 pb-4">
            <UserCheck className="text-cyan-500" /> Política de Privacidad
          </h2>

          <section>
            <h3 className="text-xl font-bold text-white mb-4">Nuestro Compromiso</h3>
            <p className="pl-1">
              En CryptoManager, la privacidad no es una opción, es un estándar. Esta sección explica detalladamente cómo manejamos la información que recolectamos.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
              <EyeOff className="text-red-400 mb-4" size={24} />
              <h4 className="text-white font-bold mb-2">No Vendemos Datos</h4>
              <p className="text-sm">Nunca venderemos, alquilaremos o compartiremos su información personal con anunciantes o terceros comerciales.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
              <Ban className="text-red-400 mb-4" size={24} />
              <h4 className="text-white font-bold mb-2">No Acceso a Fondos</h4>
              <p className="text-sm">No tenemos acceso a sus billeteras reales ni claves privadas. Nuestra gestión es puramente informativa y simulada.</p>
            </div>
          </div>

          <section>
            <h3 className="text-xl font-bold text-white mb-4">Uso de la Información</h3>
            <p className="pl-1">
              Los datos recolectados (correo electrónico y configuración de inventario) se utilizan exclusivamente para garantizar el acceso seguro y la sincronización de su cuenta.
            </p>
          </section>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-800 text-center text-sm">
          <p>¿Tiene dudas sobre nuestra legalidad o privacidad? <Link to="/contacto" className="text-cyan-400 hover:underline">Contáctenos directamente</Link></p>
        </div>
      </main>

      {/* --- FOOTER COMPLETO --- */}
      <footer className="border-t border-slate-800 py-16 bg-slate-950 text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-left">
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
                <li><Link to="/seguridad" className="hover:text-cyan-400 transition">Centro de seguridad</Link></li>
                <li><a href="/faq" className="hover:text-cyan-400 transition">Preguntas Frecuentes</a></li>
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
    className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 border border-slate-700 ${hover}`}
  >
    <Icon size={20} />
  </a>
);

export default Terminos;