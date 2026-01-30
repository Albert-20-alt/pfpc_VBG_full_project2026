import React, { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Save, Shield, Lock, Bell, Database, Server, Smartphone, Globe, Mail } from 'lucide-react';


import { api } from '@/api';

// Safe base URL for images
const BASE_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');

const SystemSettingsPage = () => {
  const { refreshSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    twoFactorAuth: true,
    passwordPolicyStrength: 'medium', // 'low', 'medium', 'high'
    sessionTimeout: 30, // minutes
    autoLockAttempts: 5,
    auditLogRetention: 90, // days
    enableEmailNotifications: true,
    emailDigestFrequency: 'daily',
    dbBackupFrequency: 'daily', // 'hourly', 'daily', 'weekly'
    maintenanceMode: false
  });

  // Fetch settings on load
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        // Remove metadata fields if necessary, or just merge
        const { createdAt, updatedAt, key, ...userSettings } = data;
        setSettings(prev => ({ ...prev, ...userSettings }));
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les paramètres système.",
          variant: "destructive"
        });
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSwitchChange = (field, checked) => {
    setSettings(prev => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.updateSettings(settings);

      toast({
        title: "Paramètres sauvegardés",
        description: "Les modifications ont été appliquées avec succès au système.",
        className: "bg-green-500 text-white border-none"
      });
      // Refresh global settings to update favicon etc.
      refreshSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await api.uploadFile(formData);
      setSettings(prev => ({ ...prev, [field]: data.url }));
      toast({
        title: "Fichier téléchargé",
        description: "Le fichier a été téléchargé avec succès. N'oubliez pas de sauvegarder.",
      });
    } catch (error) {
      console.error("Upload error details:", error);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le fichier. " + error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-5xl mx-auto">

        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-3xl overflow-hidden bg-[#0f172a] border border-white/5 shadow-2xl"
        >
          {/* Decorative Background Grid */}
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
          {/* Gradient Glow Orbs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full md:w-auto">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
              Configuration Système
            </h1>
            <p className="text-slate-400 mt-2 text-lg font-light max-w-2xl">
              Gérez les paramètres globaux, la sécurité et les préférences de la plateforme.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="relative z-10 w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20 transition-all min-w-[150px] h-12 rounded-xl font-semibold text-base"
          >
            {isLoading ? (
              <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> Enregistrement...</div>
            ) : (
              <><Save className="mr-2 h-5 w-5" /> Sauvegarder</>
            )}
          </Button>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Security Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-8"
            >
              {/* Branding Settings */}
              <Card className="relative overflow-hidden bg-slate-900/60 backdrop-blur-sm border-white/5 shadow-xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-white">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 mr-3">
                      <Smartphone className="h-5 w-5 text-amber-400" />
                    </div>
                    Identité Visuelle
                  </CardTitle>
                  <CardDescription className="text-slate-400">Logo et icônes de la plateforme.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="logoUrl">Logo de la Plateforme</Label>
                    <div className="flex items-center gap-4">
                      {settings.logoUrl ? (
                        <div className="h-16 w-16 bg-slate-800 rounded-lg flex items-center justify-center p-2 border border-white/10">
                          <img src={`${BASE_URL}${settings.logoUrl}`} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 bg-slate-800 rounded-lg flex items-center justify-center border border-white/10 border-dashed">
                          <span className="text-xs text-slate-500">Aucun</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          id="logoUrl"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'logoUrl')}
                          className="bg-slate-900/50 border-white/10"
                        />
                        <p className="text-xs text-slate-500 mt-1">Recommandé: PNG transparent, 200x200px</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="faviconUrl">Favicon</Label>
                    <div className="flex items-center gap-4">
                      {settings.faviconUrl ? (
                        <div className="h-12 w-12 bg-slate-800 rounded-lg flex items-center justify-center p-2 border border-white/10">
                          <img src={`${BASE_URL}${settings.faviconUrl}`} alt="Favicon" className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-slate-800 rounded-lg flex items-center justify-center border border-white/10 border-dashed">
                          <span className="text-xs text-slate-500">Aucun</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          id="faviconUrl"
                          type="file"
                          accept="image/png, image/x-icon, image/svg+xml"
                          onChange={(e) => handleFileUpload(e, 'faviconUrl')}
                          className="bg-slate-900/50 border-white/10"
                        />
                        <p className="text-xs text-slate-500 mt-1">ICO, PNG ou SVG, 32x32px</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings (moved inside this column) */}
              <Card className="relative overflow-hidden bg-slate-900/60 backdrop-blur-sm border-white/5 shadow-xl">
                {/* Gradient accent */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600" />
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-white">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 mr-3">
                      <Shield className="h-5 w-5 text-blue-400" />
                    </div>
                    Sécurité & Accès
                  </CardTitle>
                  <CardDescription className="text-slate-400">Politiques de sécurité et contrôle d'accès.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="space-y-0.5">
                      <Label className="text-base text-white">Double Authentification (2FA)</Label>
                      <p className="text-xs text-slate-400">Requiert un code supplémentaire à la connexion.</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSwitchChange('twoFactorAuth', checked)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Force des Mots de Passe</Label>
                    <Select
                      value={settings.passwordPolicyStrength}
                      onValueChange={(value) => handleInputChange('passwordPolicyStrength', value)}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="low">Faible (6+ caractères)</SelectItem>
                        <SelectItem value="medium">Moyenne (8+ alphanumérique)</SelectItem>
                        <SelectItem value="high">Élevée (12+ complexe)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label>Timeout Session (min)</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          type="number"
                          min="5"
                          value={settings.sessionTimeout}
                          onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                          className="pl-10 bg-slate-900/50 border-white/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Max Tentatives Login</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          type="number"
                          min="3"
                          max="10"
                          value={settings.autoLockAttempts}
                          onChange={(e) => handleInputChange('autoLockAttempts', parseInt(e.target.value))}
                          className="pl-10 bg-slate-900/50 border-white/10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* System & Notifications */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="relative overflow-hidden bg-slate-900/60 backdrop-blur-sm border-white/5 shadow-xl">
                  {/* Gradient accent */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600" />
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl text-white">
                      <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 mr-3">
                        <Bell className="h-5 w-5 text-purple-400" />
                      </div>
                      Notifications
                    </CardTitle>
                    <CardDescription className="text-slate-400">Configuration des alias et alertes email.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                      <div className="space-y-0.5">
                        <Label className="text-base text-white">Notifications Email</Label>
                        <p className="text-xs text-slate-400">Alertes critiques et rapports système.</p>
                      </div>
                      <Switch
                        checked={settings.enableEmailNotifications}
                        onCheckedChange={(checked) => handleSwitchChange('enableEmailNotifications', checked)}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Fréquence du Digest</Label>
                      <Select
                        value={settings.emailDigestFrequency}
                        onValueChange={(value) => handleInputChange('emailDigestFrequency', value)}
                        disabled={!settings.enableEmailNotifications}
                      >
                        <SelectTrigger className="bg-slate-900/50 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          <SelectItem value="daily">Quotidien (Résumé 8h00)</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire (Lundi)</SelectItem>
                          <SelectItem value="realtime">Temps Réel (Immédiat)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="relative overflow-hidden bg-slate-900/60 backdrop-blur-sm border-white/5 shadow-xl">
                  {/* Gradient accent */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl text-white">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mr-3">
                        <Database className="h-5 w-5 text-emerald-400" />
                      </div>
                      Maintenance & Données
                    </CardTitle>
                    <CardDescription className="text-slate-400">Gestion de la base de données et maintenance.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label>Bckp Fréquence</Label>
                        <Select
                          value={settings.dbBackupFrequency}
                          onValueChange={(value) => handleInputChange('dbBackupFrequency', value)}
                        >
                          <SelectTrigger className="bg-slate-900/50 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="hourly">Horaire</SelectItem>
                            <SelectItem value="daily">Quotidien</SelectItem>
                            <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label>Rétention Logs (Jours)</Label>
                        <Input
                          type="number"
                          min="30"
                          value={settings.auditLogRetention}
                          onChange={(e) => handleInputChange('auditLogRetention', parseInt(e.target.value))}
                          className="bg-slate-900/50 border-white/10"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="space-y-0.5">
                        <Label className="text-base text-red-400">Mode Maintenance</Label>
                        <p className="text-xs text-red-300/70">Rend le site inaccessible aux utilisateurs standards.</p>
                      </div>
                      <Switch
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => handleSwitchChange('maintenanceMode', checked)}
                        className="data-[state=checked]:bg-red-500"
                      />
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            </div>

          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SystemSettingsPage;