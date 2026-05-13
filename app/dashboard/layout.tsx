'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  FolderOpen, 
  Users, 
  LogOut,
  Scale,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C6A43F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Sesión cerrada correctamente');
      router.push('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const menuItems = [
    { id: 'inicio', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/inicio' },
    { id: 'expedientes', label: 'Expedientes', icon: FolderOpen, path: '/dashboard/expedientes' },
    { id: 'clientes', label: 'Clientes', icon: Users, path: '/dashboard/clientes' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay para móvil */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 lg:hidden z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menú lateral */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full bg-[#0A0A0A] text-white shadow-xl z-30 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Logo y botón de colapsar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Scale className="w-6 h-6 text-[#C6A43F]" />
                  <span className="font-light tracking-wide">GMG</span>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 py-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors relative group ${
                    isActive
                      ? 'text-[#C6A43F] bg-gray-900'
                      : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  <AnimatePresence mode="wait">
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeMenu"
                      className="absolute left-0 w-1 h-full bg-[#C6A43F]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Botón de cerrar sesión */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-gray-900 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium"
                  >
                    Cerrar Sesión
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Contenido principal */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 280 : 80 }}
      >
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email}
                </p>
                <p className="text-xs text-gray-500">Abogado</p>
              </div>
              <div className="w-8 h-8 bg-[#C6A43F] rounded-full flex items-center justify-center text-black font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Contenido de cada página */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}