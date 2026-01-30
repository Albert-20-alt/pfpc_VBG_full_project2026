
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import {
  FileText,
  Users,
  AlertTriangle,
  MapPin,
  BarChart3,
  UserCheck,
  FileSpreadsheet,
  PieChart as PieChartIcon,
  TrendingUp,
  Eye,
  FileSearch,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  Clock
} from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import UpcomingTasksList from '@/components/calendar/UpcomingTasksList';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { cases = [], users: allUsers = [], loading } = useData();
  const navigate = useNavigate();

  // ... hooks continue ...

  const handleViewCriticalAlerts = () => {
    toast({ title: "🚧 Fonctionnalité en cours de développement", description: "La vue détaillée des alertes critiques sera bientôt disponible." });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-white">Chargement des données...</div>;
  }

  if (!user?.region) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-red-400">Erreur de Profil</h2>
        <p className="text-white/70">Votre profil administrateur n'a pas de région assignée.</p>
        <p className="text-sm mt-2">Veuillez contacter le Super Admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Premium Welcome Header */}
      {/* Premium Welcome Header */}
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
            Supervision de la région <span className="font-semibold text-white">{user.region}</span>. Gerez vos équipes et analysez les données en temps réel.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button onClick={() => navigate('/analytics')} className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-lg shadow-white/10 w-full sm:w-auto">
              <BarChart3 className="mr-2 h-5 w-5" />
              Analyses
            </Button>
            <Button onClick={() => navigate('/admin/agents')} variant="outline" className="border-white/20 hover:bg-white/10 text-white backdrop-blur-sm w-full sm:w-auto">
              <Users className="mr-2 h-5 w-5" />
              Équipe
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="group"
          >
            <Card className={`relative overflow-hidden bg-slate-900/60 backdrop-blur-sm border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg ${stat.glow} hover:shadow-xl`}>
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-50`} />
              <CardContent className="relative z-10 p-3 sm:p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wide truncate">{stat.title}</p>
                  <h3 className="text-2xl sm:text-4xl font-extrabold mt-1 sm:mt-2 text-white">{stat.value}</h3>
                  <div className="mt-2 flex items-center text-xs sm:text-sm">
                    {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400 mr-1" />}
                    {stat.trend === 'down' && <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 mr-1" />}
                    <span className={stat.trend === 'up' ? 'text-emerald-400' : stat.trend === 'down' ? 'text-red-400' : 'text-slate-400'}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.bg} border border-white/10 backdrop-blur-sm`}>
                  <stat.icon className={`h-5 w-5 sm:h-7 sm:w-7 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-white/10 h-full">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="flex items-center text-lg sm:text-xl font-bold text-slate-100">
                <MapPin className="mr-3 h-5 w-5 text-teal-400" />
                Cas par Commune (Top 5)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[250px] sm:h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={casesByCommune} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} interval={0} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#fff' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="cases" name="Nombre de cas" radius={[0, 4, 4, 0]} barSize={24}>
                      {casesByCommune.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2dd4bf' : '#06b6d4'} />
                      ))}
                    </Bar>
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect border-white/10 h-full">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="flex items-center text-lg sm:text-xl font-bold text-slate-100">
                <PieChartIcon className="mr-3 h-5 w-5 text-pink-400" />
                Répartition par Violence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex justify-center items-center">
              <div className="h-[250px] sm:h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={violenceTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {violenceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Agent Performance & Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Agent Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="glass-effect border-white/10 h-full">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="flex items-center text-lg sm:text-xl font-bold text-slate-100">
                <UserCheck className="mr-3 h-5 w-5 text-emerald-400" />
                Performance des Agents
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[250px] w-full overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  {agentPerformanceData.map((item, idx) => (
                    <div key={item.name} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs sm:text-sm text-slate-300">
                        <span className="font-medium truncate">{item.name}</span>
                        <span className="font-bold">{item.value} cas</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${(item.value / (Math.max(...agentPerformanceData.map(v => v.value)) || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {agentPerformanceData.length === 0 && (
                    <p className="text-center text-slate-500 py-8">Aucune données d'agents disponibles.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <UpcomingTasksList
            tasks={myTasks}
            onTaskClick={() => navigate('/calendar')}
            currentUser={user}
            allUsers={allUsers}
          />
        </motion.div>
      </div>

      {/* Quick Actions Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card border border-white/5 bg-slate-900/40">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <FileSearch className="mr-2 h-5 w-5 text-blue-400" /> Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {/* Quick Actions Buttons */}
            <div onClick={viewRegionalCases} className="group cursor-pointer p-6 bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 rounded-2xl flex flex-col items-start gap-3 transition-all">
              <div className="p-3 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <FileSearch className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-left w-full">
                <div className="flex justify-between items-center w-full">
                  <p className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">Voir Cas Régionaux</p>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <p className="text-sm text-slate-400">Accéder à la liste détaillée des cas.</p>
              </div>
            </div>

            <div onClick={handleExportReport} className="group cursor-pointer p-6 bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 rounded-2xl flex flex-col items-start gap-3 transition-all">
              <div className="p-3 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <FileSpreadsheet className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-left w-full">
                <div className="flex justify-between items-center w-full">
                  <p className="font-bold text-lg text-white group-hover:text-green-400 transition-colors">Exporter Rapport</p>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-green-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <p className="text-sm text-slate-400">Télécharger les données agrégées.</p>
              </div>
            </div>

            <div onClick={handleViewCriticalAlerts} className="group cursor-pointer p-6 bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 rounded-2xl flex flex-col items-start gap-3 transition-all">
              <div className="p-3 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                <ShieldAlert className="h-6 w-6 text-red-400" />
              </div>
              <div className="text-left w-full">
                <p className="font-bold text-lg text-white group-hover:text-red-400 transition-colors">Alertes Critiques</p>
                <p className="text-sm text-slate-400">Gérer les cas urgents.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
