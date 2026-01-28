
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Bell,
  BarChart2,
  Users,
  Eye,
  PlusCircle,
  Activity
} from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';

const AgentDashboard = () => {
  const { user } = useAuth();
  const { cases = [] } = useData();
  const navigate = useNavigate();

  // Safeguard against non-array cases
  const safeCases = Array.isArray(cases) ? cases : [];
  const agentCases = safeCases.filter(c => String(c.agentId) === String(user.id));

  // Helper to safely parse dates
  const safelyGetDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d; // Fallback to now if invalid
  };

  const casesToday = agentCases.filter(c => {
    const dateToUse = c.submittedAt || c.createdAt; // Fallback to createdAt
    if (!dateToUse) return false;
    const caseDate = safelyGetDate(dateToUse).toDateString();
    const todayDate = new Date().toDateString();
    return caseDate === todayDate;
  }).length;

  const casesThisWeek = agentCases.filter(c => {
    const dateToUse = c.submittedAt || c.createdAt;
    if (!dateToUse) return false;
    const today = new Date();
    const caseDate = safelyGetDate(dateToUse);
    const dayOfWeek = today.getDay();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);

    return caseDate >= firstDayOfWeek && caseDate <= lastDayOfWeek;
  }).length;

  const casesThisMonth = agentCases.filter(c => {
    const dateToUse = c.submittedAt || c.createdAt;
    if (!dateToUse) return false;
    const caseDate = safelyGetDate(dateToUse);
    const today = new Date();
    return caseDate.getMonth() === today.getMonth() && caseDate.getFullYear() === today.getFullYear();
  }).length;

  const submissionTrendData = useMemo(() => {
    const data = Array(7).fill(null).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return { date: d.toISOString().split('T')[0], name: d.toLocaleDateString('fr-FR', { weekday: 'short' }), submissions: 0 };
    }).reverse();

    agentCases.forEach(c => {
      const dateToUse = c.submittedAt || c.createdAt;
      if (!dateToUse) return;

      const caseDate = safelyGetDate(dateToUse);
      const caseDateStr = caseDate.toISOString().split('T')[0];
      const entry = data.find(d => d.date === caseDateStr);
      if (entry) entry.submissions++;
    });
    return data;
  }, [agentCases]);

  const casesByGender = useMemo(() => {
    const counts = { homme: 0, femme: 0, autre: 0 };
    agentCases.forEach(c => {
      const g = (c.victimGender || '').toLowerCase();
      if (g === 'homme') counts.homme++;
      else if (g === 'femme') counts.femme++;
      else counts.autre++;
    });
    return [
      { name: 'Femmes', value: counts.femme, fill: '#ec4899' },
      { name: 'Hommes', value: counts.homme, fill: '#3b82f6' },
      { name: 'Autres', value: counts.autre, fill: '#a855f7' },
    ].filter(item => item.value > 0);
  }, [agentCases]);

  const stats = [
    {
      title: 'Soumis Aujourd\'hui',
      value: casesToday,
      icon: Activity,
      color: 'text-blue-400',
      bg: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/30'
    },
    {
      title: 'Cette Semaine',
      value: casesThisWeek,
      icon: Clock,
      color: 'text-purple-400',
      bg: 'from-purple-500/20 to-purple-600/5',
      border: 'border-purple-500/30'
    },
    {
      title: 'Ce Mois',
      value: casesThisMonth,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/30'
    },
    {
      title: 'Total Historique',
      value: agentCases.length,
      icon: TrendingUp,
      color: 'text-pink-400',
      bg: 'from-pink-500/20 to-pink-600/5',
      border: 'border-pink-500/30'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-slate-900/40 border border-white/10 p-6 md:p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Activity size={200} className="text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
                {getGreeting()}, {user?.name}
              </span>
            </h1>
            <p className="text-sm md:text-lg text-slate-300 max-w-xl">
              Bienvenue sur votre espace agent. Voici un aperçu de vos activités récentes et de vos performances.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Button
              onClick={() => navigate('/agent/cases')}
              variant="outline"
              className="h-12 px-6 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all rounded-xl w-full sm:w-auto"
            >
              <Eye className="mr-2 h-4 w-4" />
              Mes Dossiers
            </Button>
            <Button
              onClick={() => navigate('/form')}
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25 transition-all rounded-xl border-none w-full sm:w-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau Signalement
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <div className={`relative group overflow-hidden rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.bg} p-4 md:p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
              <div className="absolute top-0 right-0 p-2 md:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon size={48} className="text-white md:hidden" />
                <stat.icon size={64} className="text-white hidden md:block" />
              </div>
              <div className="relative z-10">
                <div className={`p-3 rounded-xl bg-white/10 w-fit mb-4 backdrop-blur-md`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.title}</p>
                <div className="flex items-baseline gap-1 md:gap-2 mt-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-white">{stat.value}</h3>
                  <span className="text-xs text-slate-500">cas</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

        {/* Charts Section */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Weekly Trend Chart */}
          <Card className="glass-card border-white/10 bg-slate-900/60 overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-white flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-blue-400" />
                    Activité Hebdomadaire
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Nombre de signalements soumis les 7 derniers jours
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                {submissionTrendData.every(d => d.submissions === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="p-4 rounded-full bg-slate-800 mb-4">
                      <TrendingUp className="h-8 w-8 text-slate-500" />
                    </div>
                    <p className="text-slate-400 font-medium">Aucune activité cette semaine</p>
                    <p className="text-sm text-slate-500 mt-1 max-w-xs">
                      Créez votre premier signalement pour voir vos statistiques ici.
                    </p>
                    <Button
                      onClick={() => navigate('/form')}
                      variant="outline"
                      className="mt-4 border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Nouveau Signalement
                    </Button>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={submissionTrendData}>
                      <defs>
                        <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        dx={-10}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="submissions"
                        name="Cas soumis"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSubmissions)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Demographics Row (can add more charts here if needed) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-white/10 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center">
                  <Users className="mr-2 h-4 w-4 text-pink-400" />
                  Genre des Victimes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  {casesByGender.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={casesByGender} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={60} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} animationDuration={1000}>
                          {
                            casesByGender.map((entry, index) => (
                              <cell key={`cell-${index}`} fill={entry.fill} />
                            ))
                          }
                        </Bar>
                      </ReBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                      Pas assez de données
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* NEW: Marital Status Chart */}
            <Card className="glass-card border-white/10 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center">
                  <Users className="mr-2 h-4 w-4 text-purple-400" />
                  Statut Matrimonial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const counts = agentCases.reduce((acc, c) => {
                            const status = c.victimMaritalStatus || 'Non spécifié';
                            acc[status] = (acc[status] || 0) + 1;
                            return acc;
                          }, {});
                          return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
                        })()}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value"
                      >
                        {agentCases.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />

                      <Legend
                        wrapperStyle={{ paddingTop: 10 }}
                        formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* NEW: Education Level */}
            <Card className="glass-card border-white/10 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-indigo-400" />
                  Niveau d'Éducation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart
                      data={(() => {
                        const counts = agentCases.reduce((acc, c) => {
                          const edu = c.victimEducation || 'Non spécifié';
                          acc[edu] = (acc[edu] || 0) + 1;
                          return acc;
                        }, {});
                        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
                      })()}
                      layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#94a3b8"
                        width={70}
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={15} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* NEW: Disability Status */}
            <Card className="glass-card border-white/10 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center">
                  <Activity className="mr-2 h-4 w-4 text-emerald-400" />
                  Situation de Handicap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const counts = agentCases.reduce((acc, c) => {
                            const val = c.victimDisability || 'Non';
                            acc[val] = (acc[val] || 0) + 1;
                            return acc;
                          }, {});
                          return Object.entries(counts).map(([name, value]) => ({ name, value }));
                        })()}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value"
                      >
                        <Cell key="cell-0" fill="#3b82f6" />
                        <Cell key="cell-1" fill="#f43f5e" />
                        <Cell key="cell-2" fill="#eab308" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                      <Legend
                        wrapperStyle={{ paddingTop: 10 }}
                        formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions / Tips Card placeholder */}
            <Card className="glass-card border-white/10 bg-gradient-to-br from-indigo-900/20 to-slate-900/60">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-emerald-400" />
                  Accès Rapide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5 h-10">
                  <PlusCircle className="mr-2 h-4 w-4 text-slate-500" />
                  Créer un brouillon
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5 h-10">
                  <FileText className="mr-2 h-4 w-4 text-slate-500" />
                  Consulter les procédures
                </Button>
                <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5 h-10">
                  <Bell className="mr-2 h-4 w-4 text-slate-500" />
                  Voir toutes les notifs
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Sidebar / Notifications */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <Card className="glass-card border-white/10 bg-slate-900/60 h-full">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-yellow-400" />
                  Notifications
                </CardTitle>
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative border-l border-white/10 ml-3 space-y-8">
                {[
                  { id: 1, text: "Nouveau protocole VBG mis à jour.", type: "info", date: "À l'instant", icon: FileText, color: "bg-blue-500" },
                  { id: 2, text: "Réunion d'équipe prévue demain à 10h.", type: "warning", date: "Il y a 2h", icon: Users, color: "bg-orange-500" },
                  { id: 3, text: "Maintenance système ce weekend.", type: "alert", date: "Hier", icon: Activity, color: "bg-purple-500" },
                  { id: 4, text: "Validation du cas #88291 confirmée.", type: "success", date: "20 Jan", icon: CheckCircle, color: "bg-green-500" }
                ].map((notif, i) => (
                  <div key={notif.id} className="relative pl-8">
                    <div className={`absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full ${notif.color} ring-4 ring-slate-900`} />
                    <div className="group cursor-pointer">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                        {notif.text}
                      </p>
                      <span className="text-xs text-slate-500 block mt-1">{notif.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {agentCases.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/5">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Activité Récente</h4>
                  <div className="space-y-4">
                    {agentCases.slice(0, 3).map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                          #{c.id ? c.id.toString().slice(-2) : '..'}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">Nouveau cas soumis</p>
                          <p className="text-xs text-slate-400">{new Date(c.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AgentDashboard;
