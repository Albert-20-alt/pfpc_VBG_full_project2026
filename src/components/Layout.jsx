
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Calendar,
  LogOut,
  Menu,
  X,
  FolderKanban,
  UploadCloud,
  Settings,
  UserCheck,
  Map,
  BookOpen,
  Home,
  User,
  Eye,
  Mail,
  Shield,
  ScrollText,
  Phone
} from 'lucide-react';

import { useState } from 'react';

const LOGO_URL = "https://storage.googleapis.com/hostinger-horizons-assets-prod/5e35826e-25c3-4875-8798-5c8c9f39c0c4/dfc81b5213d93d1d72a68fe20443a381.png";

const Layout = ({ children, hideNavbar = false }) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard', roles: ['agent', 'admin', 'super-admin'] },
    { icon: FileText, label: 'Nouveau cas', path: '/form', roles: ['agent', 'admin', 'super-admin'] },
    { icon: Eye, label: 'Voir mes cas', path: '/agent/cases', roles: ['agent', 'admin', 'super-admin'] },
    { icon: FolderKanban, label: 'Gestion Cas Région', path: '/admin/cases', roles: ['admin'] },
    { icon: FolderKanban, label: 'Tous les Cas', path: '/superadmin/all-cases', roles: ['super-admin'] },
    { icon: UploadCloud, label: 'Téléverser Docs', path: '/form/upload', roles: ['agent', 'admin'] },
    { icon: BarChart3, label: 'Analyses', path: '/analytics', roles: ['admin', 'super-admin'] },
    { icon: UserCheck, label: 'Performance Agents', path: '/admin/agents', roles: ['admin'] },
    { icon: Map, label: 'Carte Interactive', path: '/admin/map', roles: ['admin', 'super-admin'] },
    { icon: Users, label: 'Utilisateurs', path: '/users', roles: ['super-admin', 'admin'] },

    { icon: Settings, label: 'Paramètres Système', path: '/superadmin/settings', roles: ['super-admin'] },
    { icon: FolderKanban, label: 'Gestion Contenu', path: '/superadmin/content', roles: ['super-admin'] },
    { icon: Mail, label: 'Messages', path: '/superadmin/messages', roles: ['super-admin'] },
    { icon: FileText, label: 'Gestion des Tâches', path: '/superadmin/tasks', roles: ['super-admin'] },

    { icon: Calendar, label: 'Calendrier & Tâches', path: '/calendar', roles: ['agent', 'admin', 'super-admin'] },
    { icon: BookOpen, label: 'Centre de Ressources', path: '/resources', roles: ['agent', 'admin', 'super-admin'] },
    { icon: User, label: 'Mon Profil', path: '/profile', roles: ['agent', 'admin', 'super-admin'] }
  ];

  const filteredMenuItems = menuItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (hideNavbar) {
    return <main className="flex-1">{children}</main>;
  }

  const SidebarContent = ({ isMobile }) => (
    <div className="flex flex-col h-full p-4">
      <div className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'justify-between'} mb-6`}>
        {!collapsed || isMobile ? (
          <div onClick={() => navigate(user ? '/dashboard' : '/')} className="cursor-pointer flex items-center space-x-2 overflow-hidden">
            <img src={settings.logoUrl ? `${(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')}${settings.logoUrl}` : LOGO_URL} alt="Logo Plateforme VBG" className="h-10 w-auto" />
            <span className="text-xl font-bold gradient-text whitespace-nowrap">PFPC VBG</span>
          </div>
        ) : (
          <div onClick={() => navigate(user ? '/dashboard' : '/')} className="cursor-pointer">
            <img src={settings.logoUrl ? `${(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')}${settings.logoUrl}` : LOGO_URL} alt="Logo Plateforme VBG" className="h-8 w-auto" />
          </div>
        )}

        {/* Mobile Close Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}

        {/* Desktop Collapse Toggle */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex"
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        )}
      </div>

      {user && (
        <>
          <nav className="flex-1 space-y-1.5 overflow-y-auto scrollbar-hide">
            {filteredMenuItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                className={`w-full justify-start text-sm ${collapsed && !isMobile ? 'px-2 justify-center' : ''}`}
                onClick={() => {
                  const navOptions = item.path === '/form' ? { state: { reset: true } } : {};
                  navigate(item.path, navOptions);
                  if (isMobile) setSidebarOpen(false);
                }}
                title={collapsed && !isMobile ? item.label : undefined}
              >
                <item.icon className={`${collapsed && !isMobile ? 'mr-0' : 'mr-3'} h-4 w-4 shrink-0`} />
                {(!collapsed || isMobile) && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>

          <div className="border-t border-white/10 pt-4 mt-4 shrink-0 overflow-hidden">
            {(!collapsed || isMobile) ? (
              <div className="mb-3">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize truncate">{user?.role?.replace('-', ' ')}</p>
              </div>
            ) : null}
            <Button
              variant="outline"
              className={`w-full ${collapsed && !isMobile ? 'px-2' : ''}`}
              onClick={handleLogout}
              title="Déconnexion"
            >
              <LogOut className={`${collapsed && !isMobile ? 'mr-0' : 'mr-2'} h-4 w-4`} />
              {(!collapsed || isMobile) && "Déconnexion"}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-900 text-white">
      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {sidebarOpen && user && (
          <>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 w-64 glass-effect lg:hidden"
            >
              <SidebarContent isMobile={true} />
            </motion.div>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Static) */}
      <div className={`hidden lg:block h-screen sticky top-0 ${user ? '' : 'hidden'}`}>
        <motion.div
          className="glass-effect h-full"
          animate={{ width: collapsed ? 80 : 256 }}
          transition={{ duration: 0.3 }}
        >
          <SidebarContent isMobile={false} />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header (Mobile Only) */}
        {user && (
          <header className="glass-effect p-4 lg:hidden sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <div onClick={() => navigate(user ? '/dashboard' : '/')} className="cursor-pointer flex items-center space-x-2">
                <img src={settings.logoUrl ? `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}${settings.logoUrl}` : LOGO_URL} alt="Logo Plateforme VBG" className="h-8 w-auto" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </header>
        )}

        {/* Content */}
        <main className={`flex-1 p-6 overflow-y-auto ${!user && (location.pathname === '/' || location.pathname === '/login') ? 'p-0' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
