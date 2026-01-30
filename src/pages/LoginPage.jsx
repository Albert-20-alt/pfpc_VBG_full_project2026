
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Home, Mail, Lock, Shield, UserCheck, User, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout';

import { useSettings } from '@/contexts/SettingsContext';

const DEFAULT_LOGO_URL = "https://storage.googleapis.com/hostinger-horizons-assets-prod/5e35826e-25c3-4875-8798-5c8c9f39c0c4/dfc81b5213d93d1d72a68fe20443a381.png";
const API_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

const LoginPage = () => {
  const { settings } = useSettings();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  // Compute Logo URL
  const logoUrl = settings?.logoUrl
    ? `${API_URL.replace('/api', '')}${settings.logoUrl}`
    : DEFAULT_LOGO_URL;

  const performLogin = async (username, password) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      localStorage.setItem('token', data.token);
      login(data.user);

      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${data.user.name}! Redirection...`,
        variant: "success",
      });
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur de connexion",
        description: err.message || "Impossible de se connecter au serveur.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performLogin(username, password);
  };



  return (
    <Layout hideNavbar={true}>
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f1a] relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-600/30 to-purple-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-pink-600/20 to-rose-600/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-600/10 to-blue-600/5 rounded-full blur-3xl"
          />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Card className="bg-slate-900/70 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
              {/* Decorative top gradient bar */}
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

              <CardHeader className="text-center pt-8 pb-4 px-6 md:px-8">
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  src={logoUrl}
                  alt="Logo Plateforme VBG"
                  className="h-16 md:h-20 w-auto mx-auto mb-4 drop-shadow-lg"
                />
                <CardTitle className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight">
                  Connexion
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm md:text-base mt-2">
                  Accédez à votre espace de travail sécurisé.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-8 md:px-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-300 font-medium">Identifiant</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Identifiant"
                        required
                        className="pl-11 h-12 bg-slate-800/50 border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300 font-medium">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="pl-11 pr-11 h-12 bg-slate-800/50 border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-white placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connexion en cours...
                      </span>
                    ) : 'Se connecter'}
                  </Button>
                </form>



                <div className="mt-8 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
                  >
                    <Home className="mr-2 h-4 w-4" /> Retour à l'accueil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
