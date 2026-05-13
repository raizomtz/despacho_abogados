'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Mail, Lock, User, Phone, LogIn, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { auth } from '@/lib/firebase';
import { createUserDocument } from '@/lib/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();
  const { user, setRememberMe, rememberMe } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  
  // Estados para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMeCheckbox, setRememberMeCheckbox] = useState(false);
  
  // Estados para registro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Manejar cambio en remember me
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMeCheckbox(checked);
    setRememberMe(checked);
    if (checked) {
      Cookies.set('remember-me', 'true', { expires: 30 });
    } else {
      Cookies.remove('remember-me');
    }
  };

  // Manejar login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      toast.success('¡Bienvenido de vuelta!');
      
    } catch (error: any) {
      console.error('Error en login:', error);
      
      if (error.code === 'auth/user-not-found') {
        toast.error('No encontramos una cuenta con este correo');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Contraseña incorrecta');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Correo electrónico no válido');
      } else {
        toast.error('Error al iniciar sesión. Intenta de nuevo');
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== registerConfirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (registerPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (registerName.length < 3) {
      toast.error('Ingresa tu nombre completo');
      return;
    }
    
    setLoading(true);
    const loadingToast = toast.loading('Creando tu cuenta...');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        registerEmail, 
        registerPassword
      );
      
      const user = userCredential.user;
      
      await createUserDocument(user.uid, {
        nombre: registerName,
        email: registerEmail,
        rol: 'abogado'
      });
      
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPhone('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      
      toast.dismiss(loadingToast);
      toast.success('¡Cuenta creada exitosamente!');
      
      setTimeout(() => {
        setActiveTab('login');
      }, 1500);
      
    } catch (error: any) {
      toast.dismiss(loadingToast);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Este correo electrónico ya está registrado');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Correo electrónico no válido');
      } else if (error.code === 'auth/weak-password') {
        toast.error('La contraseña es muy débil. Usa al menos 6 caracteres');
      } else {
        toast.error('Error al crear la cuenta. Intenta de nuevo');
      }
    } finally {
      setLoading(false);
    }
  };

  // Si está cargando o autenticado, no mostrar login
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Lado izquierdo - Negro con logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A0A0A] text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Scale className="w-10 h-10 text-[#C6A43F]" />
            <span className="text-2xl font-light tracking-wide">GMG</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Estrategia Jurídica</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Excelencia y compromiso en defensa legal. <br />
            Más de 20 años protegiendo tus derechos.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="border-t border-gray-800 pt-6">
            <p className="text-sm text-gray-500">
              © 2024 GMG Estrategia Jurídica. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Lado derecho - Blanco con formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo para móvil */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
            <Scale className="w-12 h-12 text-[#C6A43F]" />
            <span className="text-xl font-light">GMG Estrategia Jurídica</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 mb-8 border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('login');
              }}
              className={`pb-3 text-lg font-medium transition-colors relative ${
                activeTab === 'login' 
                  ? 'text-black' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <LogIn className="inline w-4 h-4 mr-2" />
              Iniciar Sesión
              {activeTab === 'login' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C6A43F]"
                />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
              }}
              className={`pb-3 text-lg font-medium transition-colors relative ${
                activeTab === 'register' 
                  ? 'text-black' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <UserPlus className="inline w-4 h-4 mr-2" />
              Registrarse
              {activeTab === 'register' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C6A43F]"
                />
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleLogin} className="space-y-6">
                  <Input
                    label="Correo electrónico"
                    type="email"
                    placeholder="abogado@gmg.com"
                    icon={<Mail className="w-4 h-4" />}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  
                  <Input
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 cursor-pointer"
                        checked={rememberMeCheckbox}
                        onChange={(e) => handleRememberMeChange(e.target.checked)}
                      />
                      Recordarme
                    </label>
                    <button
                      type="button"
                      className="text-sm text-[#C6A43F] hover:text-[#B3922F] transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Ingresando...' : 'Ingresar'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleRegister} className="space-y-4">
                  <Input
                    label="Nombre completo"
                    type="text"
                    placeholder="Juan Pérez"
                    icon={<User className="w-4 h-4" />}
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    disabled={loading}
                  />
                  
                  <Input
                    label="Correo electrónico"
                    type="email"
                    placeholder="juan@gmg.com"
                    icon={<Mail className="w-4 h-4" />}
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  
                  <Input
                    label="Teléfono (opcional)"
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    icon={<Phone className="w-4 h-4" />}
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    disabled={loading}
                  />
                  
                  <Input
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  
                  <Input
                    label="Confirmar contraseña"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#C6A43F] hover:bg-[#B3922F] text-black font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}