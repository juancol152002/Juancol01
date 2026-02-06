import React from 'react';
import { Instagram, Facebook, MessageCircle, LineChart, ShieldCheck, RefreshCcw, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; 

// Importación de imagen (Asegúrate de que la ruta sea correcta en tu proyecto)
import bitcoinBg from "./assets/components/bitcoin-bg.jpg";

const LandingPage = () => {
  // Configuración para el carrusel infinito
  const tickerAssets = [
    { icon: '₿', name: 'Bitcoin', color: 'bg-orange-500' },
    { icon: '♦', name: 'Ethereum', color: 'bg-indigo-500' },
    { icon: 'Ð', name: 'DOGE', color: 'bg-blue-800' },
    { icon: '$', name: 'USDT', color: 'bg-emerald-500' },
    { icon: 'X', name: 'XPR', color: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-cyan-500 selection:text-white">
      
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

      {/* --- HERO SECTION --- */}
      <header 
        className="relative min-h-screen w-full flex flex-col items-center overflow-visible" 
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 1)), url(${bitcoinBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="pt-48 pb-10 px-4 z-10 text-center w-full">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 backdrop-blur-sm rounded-full px-4 py-1.5 mb-10"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">Mercado en vivo</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 text-white"
          >
            Compra, Vende y Gestiona tus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              Criptomonedas
            </span>
            <br /> sin complicaciones
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto text-xl text-slate-300 mb-12"
          >
            Acceso profesional a los principales activos del mercado global con seguridad de grado bancario.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <Link to="/login">
              <button className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-12 py-4 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-transform hover:scale-105">
                Registrarse
              </button>
            </Link>
            <Link to="/mercado">
              <button className="w-full sm:w-auto bg-slate-800/60 hover:bg-slate-700 backdrop-blur-md border border-slate-700 text-white px-12 py-4 rounded-xl font-semibold transition-colors">
                Ver Mercados
              </button>
            </Link>
          </motion.div>
        </div>

        {/* --- SECCIÓN: QUIÉNES SOMOS + PANEL ANALÍTICO --- */}
        <div className="relative z-10 w-full max-w-7xl px-4 mt-60 mb-32 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* IZQUIERDA: TEXTO INFORMATIVO */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="bg-slate-800/40 backdrop-blur-md border border-slate-700 p-8 md:p-12 rounded-[2rem] shadow-2xl"
            >
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1 mb-6">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Sobre Nosotros</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight text-left">
                Tu puente hacia la <span className="text-cyan-400">economía del futuro</span>
              </h2>
              <div className="space-y-4 text-slate-300 leading-relaxed text-lg text-left">
                <p>
                  En <strong>CryptoManager</strong>, somos un aliado estratégico para la gestión de tus activos digitales, unificando simplicidad y potencia técnica.
                </p>
                <p>
                  Nacimos con la misión de democratizar el acceso a las criptomonedas, ofreciendo una interfaz intuitiva y segura para que cada usuario tome el control total de sus finanzas.
                </p>
              </div>
            </motion.div>

            {/* DERECHA: PANEL ANALÍTICO */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[2.5rem] blur-2xl group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="bg-white/5 px-8 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Análisis de Portafolio</span>
                  <div className="w-10"></div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start gap-6 mb-8">
                    <div className="text-left">
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Balance Consolidado</p>
                      <div className="flex items-center gap-3">
                        <h3 className="text-3xl font-black text-white">$42,580.00</h3>
                        <div className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg border border-emerald-500/20">
                          +12.5%
                        </div>
                      </div>
                    </div>

                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-indigo-500/20"/>
                        <motion.circle
                          cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" fill="transparent"
                          strokeDasharray="201.06"
                          initial={{ strokeDashoffset: 201.06 }}
                          whileInView={{ strokeDashoffset: 201.06 * (1 - 0.83) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="text-cyan-400"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[8px] text-slate-500 font-bold uppercase">Activos</span>
                        <span className="text-[10px] font-bold text-white">100%</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-28 flex items-end justify-between gap-1.5 mb-8">
                    {[45, 60, 35, 80, 55, 90, 75, 100, 65, 85].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 0.8 }}
                        className="flex-1 bg-gradient-to-t from-cyan-600/40 to-cyan-400 rounded-t-md hover:brightness-125 transition-all cursor-crosshair"
                      />
                    ))}
                  </div>

                  <div className="space-y-3">
                    <AssetRow icon="₿" name="Bitcoin" amount="0.8524 BTC" value="$35,341.40" percent="83%" color="bg-orange-500" />
                    <AssetRow icon="♦" name="Ethereum" amount="4.1205 ETH" value="$7,238.60" percent="17%" color="bg-indigo-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* --- CARRUSEL INFINITO --- */}
      <div className="border-y border-slate-800 bg-slate-950/80 backdrop-blur-md relative z-20 overflow-hidden py-10">
        <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">Mercado Global en Tiempo Real</p>
        <div className="flex overflow-hidden">
          <motion.div 
            className="flex items-center whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {[1, 2].map((group) => (
              <div key={group} className="flex items-center gap-12 px-6">
                {tickerAssets.map((coin, index) => (
                  <div key={index} className="flex items-center gap-4 group cursor-default">
                    <div className={`w-10 h-10 rounded-full ${coin.color} flex items-center justify-center font-bold text-white text-sm shadow-lg`}>
                      {coin.icon}
                    </div>
                    <span className="text-xl font-bold text-slate-300 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                      {coin.name}
                    </span>
                    <span className="text-slate-700 font-bold ml-4">/</span>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* --- FEATURES --- */}
      <section id="features" className="py-24 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              Icon={RefreshCcw} 
              title="Intercambio Instantáneo" 
              desc="Convierte tus USDT a Bitcoin o Ethereum en segundos con la mejor tasa del mercado."
              color="text-cyan-400"
              bgColor="bg-cyan-500/10"
            />
            <FeatureCard 
              Icon={ShieldCheck} 
              title="Custodia Institucional" 
              desc="Almacenamiento en frío (Cold Storage) para garantizar la máxima seguridad de tus fondos."
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
            />
            <FeatureCard 
              Icon={LineChart} 
              title="Gestión de Portafolio" 
              desc="Panel centralizado para ver tu balance en tiempo real e historial de rendimiento."
              color="text-purple-400"
              bgColor="bg-purple-500/10"
            />
          </div>
        </div>
      </section>

      {/* --- CÓMO EMPEZAR --- */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Empieza en minutos</h2>
            <p className="text-slate-400">Tres simples pasos para entrar al mundo cripto.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent -translate-y-12"></div>
            {[
              { step: "01", title: "Crea tu cuenta", desc: "Regístrate con tus datos básicos y activa tu billetera de seguridad." },
              { step: "02", title: "Deposita Fondos", desc: "Recibe USDT o conecta tu cuenta bancaria para cargar saldo instantáneamente." },
              { step: "03", title: "Opera y Gana", desc: "Intercambia activos y monitorea tu crecimiento en tiempo real desde el panel." }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-2xl mb-6 group-hover:border-cyan-500 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed px-4">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* --- BANNER DE CIERRE --- */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden border-y border-slate-800">
        <div 
          className="absolute inset-0 z-0 bg-fixed bg-cover bg-center"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url(${bitcoinBg})`,
            backgroundAttachment: 'fixed' 
          }}
        />
        <div className="relative z-10 text-center px-4">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-6xl font-extrabold text-white mb-6">
              El futuro de tus finanzas <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">comienza hoy mismo</span>
            </h2>
            <Link to="/login">
              <button className="bg-white text-slate-900 hover:bg-cyan-500 hover:text-white px-12 py-4 rounded-xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95">
                Empezar Ahora
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

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
                <li><Link to="/dashboard" className="hover:text-cyan-400 transition">Mi Inventario</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Ayuda</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/seguridad" className="hover:text-cyan-400 transition">Seguridad</Link></li>
                <li><Link to="/contacto" className="hover:text-cyan-400 transition">Contacto</Link></li>
              </ul>
            </div>
            <div className="flex flex-col">
              <h3 className="text-white font-bold mb-6">Mantente al día</h3>
              <div className="flex gap-4 mb-6">
                <SocialIcon href="https://instagram.com" Icon={Instagram} hover="hover:bg-gradient-to-tr hover:from-yellow-500 hover:to-purple-500" />
                <SocialIcon href="https://facebook.com" Icon={Facebook} hover="hover:bg-blue-600" />
                <SocialIcon href="https://wa.me/tu-numero" Icon={MessageCircle} hover="hover:bg-emerald-500" />
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

// --- COMPONENTES AUXILIARES ---

const FeatureCard = ({ Icon, title, desc, color, bgColor }) => (
  <div className="bg-slate-800/30 p-8 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-all group text-left hover:-translate-y-2">
    <div className={`${bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-6`}>
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
    <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
  </div>
);

const AssetRow = ({ icon, name, amount, value, percent, color }) => (
  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-white font-bold text-[10px] shadow-lg`}>
        {icon}
      </div>
      <div className="text-left">
        <p className="text-white text-xs font-bold">{name}</p>
        <p className="text-[9px] text-slate-500">{amount}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-white text-xs font-bold">{value}</p>
      <p className={`text-[9px] font-bold ${name === 'Bitcoin' ? 'text-emerald-400' : 'text-indigo-400'}`}>{percent}</p>
    </div>
  </div>
);

const SocialIcon = ({ href, Icon, hover }) => (
  <a 
    href={href} target="_blank" rel="noopener noreferrer"
    className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 border border-slate-700 ${hover}`}
  >
    <Icon size={20} />
  </a>
);

export default LandingPage;