import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import {
  Users, FileText, TrendingUp, ShieldCheck, Settings,
  MapPin, Calendar as CalendarIcon,
  Activity, ArrowUpRight, ArrowDownRight, Clock,
  ExternalLink, PlusCircle, LayoutDashboard,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart as ReBarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { cases, users: allUsers } = useData();
  const navigate = useNavigate();
  const [activityPage, setActivityPage] = useState(1);
  const itemsPerPage = 5;

  // Helper to safely parse dates
  const safelyGetDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d; // Fallback to now if invalid
  };

  // Real KPI Data with valid dates for the chart
  const kpiData = useMemo(() => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const now = new Date();
    const currentMonth = now.getMonth();
    const data = [];

    // Safety check
    const safeCases = (Array.isArray(cases) ? cases : []).filter(c => c && typeof c === 'object');

    // We don't have user history dates easily available in basic user objects usually, 
    // so we will just show flat line or current total for users to avoid fake data.
    // Ideally we would filter users by createdAt if available.
    const safeUsers = Array.isArray(allUsers) ? allUsers : [];

    for (let i = 5; i >= 0; i--) {
      // Calculate month index correctly handling year wrap logic if needed, 
      // but for visualization simple modulus is fine if we assume within last year.
      // Better: Create date objects for start/end of each month.
      const d = new Date(now.getFullYear(), currentMonth - i, 1);
      const monthIndex = d.getMonth();
      const year = d.getFullYear();

      const monthCases = safeCases.filter(c => {
        const caseDate = new Date(c.submittedAt || c.createdAt);
        return caseDate.getMonth() === monthIndex && caseDate.getFullYear() === year;
      }).length;

      // Try to filter users if they have createdAt, else just show total
      const monthUsers = safeUsers.filter(u => {
        if (!u.createdAt) return true; // If no date, assume existing
        const userDate = new Date(u.createdAt);
        return userDate < new Date(year, monthIndex + 1, 0);
      }).length;

      data.push({
        name: months[monthIndex],
        cases: monthCases,
        users: monthUsers
      });
    }
    return data;
  }, [cases, allUsers]);

  // Helper for trends
  const calculateTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const percent = ((current - previous) / previous) * 100;
    return `${percent > 0 ? '+' : ''}${percent.toFixed(0)}%`;
  };

  const stats = useMemo(() => {
    const safeCases = Array.isArray(cases) ? cases : [];
    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const thisYear = now.getFullYear();
    const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const currentMonthCases = safeCases.filter(c => {
      const d = new Date(c.submittedAt || c.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const lastMonthCases = safeCases.filter(c => {
      const d = new Date(c.submittedAt || c.createdAt);
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    }).length;

    // Resolution Rate
    const completed = safeCases.filter(c => c.status === 'completed').length;
    const total = safeCases.length;
    const resolutionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return [
      {
        title: 'Total Utilisateurs',
        value: allUsers.length,
        change: 'Total', // No history for now
        trend: 'neutral',
        icon: Users,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10'
      },
      {
        title: 'Cas Signalés',
        value: safeCases.length, // Total cases, or just this month? Usually Dashboard top cards show Total. Let's show Total.
        change: calculateTrend(currentMonthCases, lastMonthCases),
        trend: currentMonthCases >= lastMonthCases ? 'up' : 'down',
        icon: FileText,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10'
      },
      {
        title: 'Taux Résolution',
        value: `${resolutionRate}%`,
        change: 'Global',
        trend: 'neutral',
        icon: ShieldCheck,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10'
      },
      {
        title: 'Cas Urgents',
        value: safeCases.filter(c => c.status === 'pending').length,
        change: 'En attente',
        trend: 'neutral',
        icon: Activity,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10'
      }
    ];
  }, [cases, allUsers]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const quickActions = [
    { label: 'Gérer Utilisateurs', icon: Users, path: '/users', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Analyses Globales', icon: TrendingUp, path: '/analytics', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Cartographie', icon: MapPin, path: '/admin/map', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Paramètres', icon: Settings, path: '/superadmin/settings', color: 'bg-slate-700 hover:bg-slate-600' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-slate-900/40 border border-white/10 p-4 sm:p-6 lg:p-12"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <LayoutDashboard className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10">
          <h1 className="text-xl sm:text-3xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 tracking-tight">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 block sm:inline">{user?.name}</span>
          </h1>
          <p className="text-xs sm:text-base lg:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Bienvenue sur le tableau de bord principal. Vous avez le contrôle total sur la plateforme nationale de lutte contre les VBG.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button onClick={() => navigate('/form')} className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-lg shadow-white/10 w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" />
              Nouveau Cas
            </Button>
            <Button onClick={() => navigate('/calendar')} variant="outline" className="border-white/20 hover:bg-white/10 text-white backdrop-blur-sm w-full sm:w-auto">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Planning
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-effect border-white/10 hover:border-white/20 transition-all duration-300">
              <CardContent className="p-3 sm:p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] sm:text-sm font-medium text-slate-400 uppercase tracking-wide">{stat.title}</p>
                    <h3 className="text-xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">{stat.value}</h3>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                  {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400 mr-1" />}
                  {stat.trend === 'down' && <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 mr-1" />}
                  <span className={stat.trend === 'up' ? 'text-emerald-400' : stat.trend === 'down' ? 'text-red-400' : 'text-slate-400'}>
                    {stat.change}
                  </span>
                  <span className="text-slate-500 ml-1 hidden sm:inline"> {stat.trend !== 'neutral' ? 'vs mois dernier' : ''}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">

        {/* Chart Section */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Activity className="mr-3 h-5 w-5 text-blue-400" />
                Aperçu de l'Activité
              </CardTitle>
              <CardDescription>Comparaison des nouveaux cas et des utilisateurs actifs.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] sm:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpiData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="cases" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCases)" />
                    <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* NEW DASHBOARD CHARTS ROW */}
          <div className="grid grid-cols-3 gap-2 mt-4 sm:gap-6 sm:mt-8 relative z-10 pb-4">
            {/* Type of Violence - REPLACED Education */}
            <Card className="glass-effect border-white/10">
              <CardHeader className="p-2 sm:p-6 pb-1 sm:pb-2">
                <CardTitle className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-wide sm:tracking-widest flex items-center gap-1 sm:gap-2">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" /> <span className="hidden sm:inline">Type VBG</span><span className="sm:hidden">Type</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="h-[120px] sm:h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart
                      data={(() => {
                        const counts = cases.reduce((acc, c) => {
                          const type = c.violenceType || 'Non spécifié';
                          acc[type] = (acc[type] || 0) + 1;
                          return acc;
                        }, {});
                        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
                      })()}
                      margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 4, 4]} barSize={30} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Marital Status */}
            <Card className="glass-effect border-white/10">
              <CardHeader className="p-2 sm:p-6 pb-1 sm:pb-2">
                <CardTitle className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-wide sm:tracking-widest flex items-center gap-1 sm:gap-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" /> <span className="hidden sm:inline">Matrimonial</span><span className="sm:hidden">Matr.</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="h-[120px] sm:h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const counts = cases.reduce((acc, c) => {
                            const status = c.victimMaritalStatus || 'Non spécifié';
                            acc[status] = (acc[status] || 0) + 1;
                            return acc;
                          }, {});
                          return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
                        })()}
                        cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value"
                      >
                        {[0, 1, 2, 3, 4].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Disability */}
            <Card className="glass-effect border-white/10">
              <CardHeader className="p-2 sm:p-6 pb-1 sm:pb-2">
                <CardTitle className="text-[10px] sm:text-sm font-bold text-slate-400 uppercase tracking-wide sm:tracking-widest flex items-center gap-1 sm:gap-2">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" /> <span className="hidden sm:inline">Handicap</span><span className="sm:hidden">Hand.</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="h-[120px] sm:h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const counts = cases.reduce((acc, c) => {
                            const val = c.victimDisability || 'Non';
                            acc[val] = (acc[val] || 0) + 1;
                            return acc;
                          }, {});
                          return Object.entries(counts).map(([name, value]) => ({ name, value }));
                        })()}
                        cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value"
                      >
                        <Cell key="cell-0" fill="#10b981" />
                        <Cell key="cell-1" fill="#f43f5e" />
                        <Cell key="cell-2" fill="#eab308" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Quick Actions & Recent */}
        <motion.div
          className="space-y-4 sm:space-y-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Control Center */}
          <Card className="glass-effect border-white/10 bg-slate-900/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg">Centre de Contrôle</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {quickActions.map(action => (
                <div
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="group cursor-pointer p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center text-center gap-3"
                >
                  <div className={`p-3 rounded-full ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">{action.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity (Mock) */}
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Activités Récentes</span>
                <Clock className="h-4 w-4 text-slate-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                // 1. Filter cases from the last 24 hours
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

                const recentCases = (Array.isArray(cases) ? cases : [])
                  .filter(c => {
                    const d = new Date(c.submittedAt || c.createdAt);
                    return d >= oneDayAgo;
                  })
                  .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));

                // 2. Pagination Logic
                const totalPages = Math.ceil(recentCases.length / itemsPerPage);
                const paginatedCases = recentCases.slice(
                  (activityPage - 1) * itemsPerPage,
                  activityPage * itemsPerPage
                );

                if (recentCases.length === 0) {
                  return <p className="text-slate-400 text-sm text-center py-4">Aucune activité dans les dernières 24h.</p>;
                }

                return (
                  <>
                    <div className="space-y-4">
                      {paginatedCases.map((c) => {
                        const date = new Date(c.submittedAt || c.createdAt);
                        const timeAgo = () => {
                          const diff = Date.now() - date.getTime();
                          const hours = Math.floor(diff / (1000 * 60 * 60));
                          if (hours < 1) {
                            const minutes = Math.floor(diff / (1000 * 60));
                            return minutes < 1 ? "À l'instant" : `Il y a ${minutes} min`;
                          }
                          // Should be < 24h due to filter, but safely handle edge cases
                          if (hours < 24) return `Il y a ${hours} heures`;
                          return "Récemment";
                        };

                        return (
                          <div key={c.id} className="flex items-start gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                            <div className={`mt-1 h-2 w-2 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)] ${c.status === 'completed' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
                              c.status === 'pending' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' :
                                'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                              }`} />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {c.status === 'pending' ? 'Nouveau cas signalé' : 'Cas mis à jour'} <span className="text-slate-500 font-normal">#{c.id ? c.id.toString().slice(-4) : '???'}</span>
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {timeAgo()} • {c.victimRegion || 'Région inconnue'}
                              </p>
                            </div>
                            <Button onClick={() => navigate('/agent/cases')} variant="ghost" size="icon" className="ml-auto h-6 w-6 text-slate-500 hover:text-white" title="Voir les détails">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
                        <span className="text-xs text-slate-500">Page {activityPage} sur {totalPages}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={activityPage === 1}
                            onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={activityPage === totalPages}
                            onClick={() => setActivityPage(p => Math.min(totalPages, p + 1))}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
