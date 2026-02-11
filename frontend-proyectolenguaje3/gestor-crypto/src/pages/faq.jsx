import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importante para los links
import { ChevronDown, HelpCircle, TrendingUp, Instagram, Send, MessageCircle } from 'lucide-react';
import logoImg from '../assets/components/logo.jpg';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-800">
      <button
        className="w-full py-6 flex items-center justify-between text-left hover:text-cyan-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-slate-200">{question}</span>
        <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-64 pb-6' : 'max-h-0'}`}>
        <p className="text-slate-400 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const Faq = () => {
  const faqs = [
    {
      question: "¿Qué criptomonedas están disponibles para intercambiar?",
      answer: "Actualmente, puedes intercambiar las siguientes criptomonedas en nuestra plataforma: Bitcoin (BTC), Ethereum (ETH), DogeCoin (DOGE), Tether (USDT) y XPR Network (XPR)."
    },
    {
      question: "¿Existe un monto minimo o maximo para operar?",
      answer: "Sí, para garantizar la seguridad y fluidez, los límites actuales son: Monto mínimo de $1 USD y un monto máximo de $100 USD por operación."
    },
    {
      question: "¿Cuáles son las comisiones por intercambio?",
      answer: "Mantenemos una de las tasas más bajas del mercado, con un 0.1% fijo por operación, sin cargos ocultos ni costos de mantenimiento."
    },
    {
      question: "¿Cómo puedo contactar al soporte técnico en caso de error?",
      answer: (
        <span>
          Si presentas algún inconveniente, nuestro equipo de atención está disponible para ayudarte a través de nuestras redes oficiales:
          escríbenos por <a href="https://t.me/danieln1304" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-medium">Telegram</a>,
          vía <a href="https://wa.me/584122080281" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-medium">WhatsApp</a> o
          envíanos un mensaje directo por <a href="https://www.instagram.com/danieln0908/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-medium">Instagram</a>.
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* --- NAVBAR REUTILIZADO --- */}
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
                  Mercado
                </Link>
                <Link to="/seguridad" className="hover:text-cyan-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">
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

      {/* --- CONTENIDO DE FAQ --- */}
      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-4">
              <HelpCircle className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Soporte</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Preguntas Frecuentes</h2>
            <p className="mt-4 text-slate-400 text-lg">Todo lo que necesitas saber sobre CryptoManager.</p>
          </div>

          <div className="bg-slate-800/20 rounded-3xl p-8 border border-slate-800/50 backdrop-blur-sm">
            {faqs.map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </main>
      {/* --- FOOTER --- */}
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
    className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 border border-slate-700 ${hover}`}
  >
    <Icon size={20} />
  </a>
);
export default Faq;