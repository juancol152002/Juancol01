import React, { useState } from 'react';
import GestionModal from './components/GestionModal';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from './assets/components/logo.jpg';
import { Mail, Lock, User, CheckCircle2, ArrowRight, TrendingUp, Eye, EyeOff, LogOut } from 'lucide-react';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: 'error', title: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // VALIDACIÓN COMPLETA
    const missingFields = [];

    // 1. Validar campos vacíos
    if (!formData.email.trim()) missingFields.push(isLogin ? "Usuario/Correo" : "Correo Electrónico");
    if (!isLogin && !formData.nombre.trim()) missingFields.unshift("Nombre Completo");

    const isPasswordEmpty = !formData.password.trim();
    const isPasswordShort = !isLogin && formData.password.length <= 9;

    // CASO 1: Si faltan otros campos, agregamos contraseña a la lista si falta
    if (missingFields.length > 0) {
      if (isPasswordEmpty) missingFields.push("Contraseña");

      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Datos Incompletos',
        message: `Por favor completa los siguientes campos: ${missingFields.join(', ')}.`
      });
      return;
    }

    // CASO 2: Si Solo falta la contraseña O es muy corta (y todo lo demás está bién)
    if (isPasswordEmpty || isPasswordShort) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: isPasswordEmpty ? 'Falta Contraseña' : 'Contraseña Insegura',
        message: 'La contraseña es obligatoria y debe tener más de 9 dígitos.'
      });
      return;
    }

    setLoading(true);

    const url = isLogin
      ? 'http://127.0.0.1:8000/api/token/'
      : 'http://127.0.0.1:8000/api/users/registro/';

    const payload = {
      email: formData.email,
      username: formData.email,
      password: formData.password,
      first_name: formData.nombre
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('accessToken', data.access);
          localStorage.setItem('refreshToken', data.refresh);

          const userData = {
            name: data.first_name || formData.email.split('@')[0],
            first_name: data.first_name,
            email: data.email,
            id: data.id,
            isAdmin: data.is_staff,
            avatar: data.image_url
          };

          localStorage.setItem('usuario', JSON.stringify(userData));

          if (userData.isAdmin === true) {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }

        } else {
          setIsRegistered(true); // Activa la vista de éxito
        }
      } else {
        const errorMsg = data.detail || 'Verifica tus datos'; // Simplificamos mensaje
        setError('Error: ' + errorMsg);
        // Tambien mostramos modal si es registro o error general
        setModalState({
          isOpen: true,
          type: 'error',
          title: 'Error de Autenticación',
          message: errorMsg
        });
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor Django.');
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Error de Conexión',
        message: 'No se pudo conectar con el servidor. Inténtalo más tarde.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex font-sans text-slate-50 selection:bg-cyan-500 selection:text-white">

      {/* --- LADO IZQUIERDO (DECORATIVO) --- */}
      <div className="hidden md:flex w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center justify-between mb-12 w-full">
            <Link to="/" className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-700 p-2 pr-4 rounded-xl backdrop-blur-sm hover:border-cyan-500 transition-colors">
              <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
              <span className="font-bold tracking-tight text-white">CryptoManager</span>
            </Link>
          </div>
          <h2 className="text-4xl font-extrabold mb-6 leading-tight">Gestiona tus activos con <span className="text-cyan-400">Seguridad Garantizada</span>.</h2>
        </div>
      </div>

      {/* --- LADO DERECHO (FORMULARIO) --- */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md my-auto">

          {isRegistered ? (
            /* --- VISTA DE ÉXITO --- */
            <div className="text-center animate-in zoom-in duration-300">
              <div className="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle2 className="text-emerald-400 w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">¡Cuenta creada!</h2>
              <p className="text-slate-400 mb-8">
                Tu registro en <strong>CryptoManager</strong> fue exitoso. Ya puedes iniciar sesión con tus credenciales.
              </p>
              <button
                onClick={() => { setIsRegistered(false); setIsLogin(true); }}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                Ir al Inicio de Sesión
              </button>
            </div>
          ) : (
            /* --- VISTA DE LOGIN / REGISTRO --- */
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Bienvenido' : 'Crear Cuenta'}</h2>
                <p className="text-slate-400">{isLogin ? 'Ingresa tus credenciales.' : 'Completa el formulario.'}</p>
              </div>

              {error && <div className="mb-4 p-3 bg-red-500/10 text-red-400 rounded-lg text-sm text-center border border-red-500/20">{error}</div>}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej. Juan Pérez"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Usuario o Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="text"  // 👈 Usamos text para que acepte 'luis.pv' o 'puebla123@gmail.com'
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nombre de usuario o email"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-12 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50">
                  {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                  {!loading && <ArrowRight className="h-5 w-5" />}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-slate-400">
                {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
                <button onClick={() => { setIsLogin(!isLogin); setError(''); setIsRegistered(false); }} className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                  {isLogin ? 'Regístrate gratis' : 'Inicia Sesión'}
                </button>
              </div>
            </>
          )}

          {/* Footer movido un poco más abajo con margen superior */}
          <div className="mt-16 text-center text-xs text-slate-600 pb-4">
            <p>&copy; 2026 CryptoManager. Creado para Proyecto Lenguaje III. Todos los derechos reservados</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="/terminos#privacidad" className="hover:text-slate-400">Privacidad</a>
              <a href="/terminos#terminos" className="hover:text-slate-400">Términos</a>
            </div>
          </div>

        </div>
      </div>
      <GestionModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
    </div>
  );
};

export default AuthPage;