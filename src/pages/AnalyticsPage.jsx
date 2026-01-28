import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from "jspdf";
import Layout from '@/components/Layout';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Download,
  TrendingUp,
  FileText,
  Shield,
  AlertTriangle,
  Users,
  Activity,
  UserCheck,
  UserX,
  Calendar,
  Map as MapIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'];

const AnalyticsPage = () => {
  const { cases, users: allUsers = [] } = useData();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  // Initialize filter based on role
  const [selectedRegionFilter, setSelectedRegionFilter] = useState(user?.role === 'super-admin' ? 'all' : user?.region || 'all');

  // Update filter if user changes (e.g. re-login)
  React.useEffect(() => {
    if (user && user.role !== 'super-admin') {
      setSelectedRegionFilter(user.region);
    }
  }, [user]);

  const senegalRegions = useMemo(() => {
    const regions = new Set(cases.map(c => c.victimRegion).filter(Boolean));
    return ['all', ...Array.from(regions)];
  }, [cases]);

  // Filter Data
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Force region filter for non-super-admins just in case context has more data
      if (user?.role !== 'super-admin' && user?.region) {
        if (c.victimRegion !== user.region) return false;
      }

      if (selectedRegionFilter === 'all') return true;
      return c.victimRegion === selectedRegionFilter;
    });
  }, [cases, selectedRegionFilter, user]);

  // --- Metrics Calculation ---
  const totalCases = filteredCases.length;
  // ... (metrics calculation remains the same)
  const resolvedCases = filteredCases.filter(c => c.status === 'completed').length;
  const pendingCases = filteredCases.filter(c => c.status === 'pending').length;
  const resolutionRate = totalCases > 0 ? ((resolvedCases / totalCases) * 100).toFixed(0) : 0;

  // ... (Chart UseMemos remain the same) ...



  // --- Metrics Calculation ---


  // --- Chart Data Preparation ---

  // 1. Trends Over Time (Restored)
  const trendData = useMemo(() => {
    const data = filteredCases.reduce((acc, curr) => {
      const date = new Date(curr.createdAt || curr.incidentDate); // Use creation or incident date
      if (isNaN(date.getTime())) return acc;

      const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!acc[key]) acc[key] = { name: key, cases: 0, resolved: 0, dateObj: date };

      acc[key].cases++;
      if (curr.status === 'completed') acc[key].resolved++;
      return acc;
    }, {});

    return Object.values(data)
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(-12); // Last 12 points
  }, [filteredCases]);


  // 2. Geographic Distribution (Restored)
  const regionData = useMemo(() => {
    const counts = filteredCases.reduce((acc, curr) => {
      const region = curr.victimRegion || 'Inconnu';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});

    // Sort by count descending
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredCases]);


  // 3. Victim Sex Distribution
  const victimSexData = useMemo(() => {
    const counts = filteredCases.reduce((acc, c) => {
      const sex = c.victimGender || 'Non spécifié';
      acc[sex] = (acc[sex] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [filteredCases]);

  // 4. Victim Age Distribution
  const victimAgeData = useMemo(() => {
    const ranges = { '0-10': 0, '11-17': 0, '18-35': 0, '36-50': 0, '50+': 0 };
    filteredCases.forEach(c => {
      const age = parseInt(c.victimAge);
      if (!isNaN(age)) {
        if (age <= 10) ranges['0-10']++;
        else if (age <= 17) ranges['11-17']++;
        else if (age <= 35) ranges['18-35']++;
        else if (age <= 50) ranges['36-50']++;
        else ranges['50+']++;
      }
    });
    return Object.keys(ranges).map(key => ({ name: key, value: ranges[key] }));
  }, [filteredCases]);

  // 5. Violence Types (Ranked)
  const violenceTypeData = useMemo(() => {
    const counts = filteredCases.reduce((acc, c) => {
      const type = c.violenceType || 'Non spécifié';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [filteredCases]);

  // 6. Perpetrator Demographics (Sex)
  const perpetratorSexData = useMemo(() => {
    const counts = filteredCases.reduce((acc, c) => {
      const sex = c.perpetratorGender || 'Non spécifié';
      acc[sex] = (acc[sex] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [filteredCases]);

  // 7. Perpetrator Age Group
  const perpetratorAgeData = useMemo(() => {
    const ranges = { 'Mineur (<18)': 0, 'Adulte (18-35)': 0, 'Mûr (36-50)': 0, 'Senior (50+)': 0 };
    filteredCases.forEach(c => {
      const age = parseInt(c.perpetratorAge);
      if (!isNaN(age)) {
        if (age < 18) ranges['Mineur (<18)']++;
        else if (age <= 35) ranges['Adulte (18-35)']++;
        else if (age <= 50) ranges['Mûr (36-50)']++;
        else ranges['Senior (50+)']++;
      }
    });
    return Object.keys(ranges).map(key => ({ name: key, value: ranges[key] }));
  }, [filteredCases]);

  // 8. Agent Performance (Cases handled)
  // 8. Agent Performance (Cases handled)
  const agentPerformanceData = useMemo(() => {
    // If Admin, strict filter to only show agents from THEIR region
    let allowedAgentIds = null;
    if (user?.role !== 'super-admin' && user?.region) {
      allowedAgentIds = new Set([
        ...allUsers
          .filter(u => u.role === 'agent' && u.region === user.region)
          .map(u => String(u.id)),
        ...allUsers
          .filter(u => u.role === 'super-admin')
          .map(u => String(u.id))
      ]);
    }

    const counts = filteredCases.reduce((acc, c) => {
      // If we have a restrictive list, check it
      if (allowedAgentIds && c.agentId && !allowedAgentIds.has(String(c.agentId))) {
        return acc;
      }

      const agent = c.agentName || `Agent ${c.agentId}` || 'Inconnu';
      acc[agent] = (acc[agent] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredCases, allUsers, user]);


  const generatePDFReport = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

      let yCursor = 20;

      // Helper for page breaks
      const checkPageBreak = (heightNeeded) => {
        if (yCursor + heightNeeded > pageHeight - 20) {
          doc.addPage();
          yCursor = 20; // Reset cursor
        }
      };

      // -- Header Function --
      const drawHeader = (title) => {
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text(title || "Rapport d'Activité VBG", 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`Généré le ${today}`, 20, 30);

        // Filters context only on first page if desired, or small note
        if (!title) { // Main header
          doc.setFontSize(12);
          doc.setTextColor(255, 255, 255);
          doc.text(`Période: ${selectedPeriod === 'all' ? 'Tout l\'historique' : selectedPeriod === '1year' ? '12 derniers mois' : '6 derniers mois'}`, pageWidth - 20, 20, { align: 'right' });
          doc.text(`Filtre Région: ${selectedRegionFilter === 'all' ? 'National' : selectedRegionFilter}`, pageWidth - 20, 30, { align: 'right' });
        }

        yCursor = 55;
      };

      drawHeader();

      // -- Summary Metrics --
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text("KPIs Globaux", 20, yCursor);
      yCursor += 10;

      // Draw Summary Boxes
      const boxWidth = 40;
      const boxHeight = 25;
      const startX = 20;
      const gap = 10;

      // Total
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(startX, yCursor, boxWidth, boxHeight, 3, 3, 'FD');
      doc.setFontSize(10); doc.setTextColor(100); doc.text("Total Cas", startX + 5, yCursor + 8);
      doc.setFontSize(14); doc.setTextColor(0); doc.text(String(totalCases), startX + 5, yCursor + 18);

      // Resolved
      doc.roundedRect(startX + boxWidth + gap, yCursor, boxWidth, boxHeight, 3, 3, 'FD');
      doc.setFontSize(10); doc.setTextColor(100); doc.text("Résolus", startX + boxWidth + gap + 5, yCursor + 8);
      doc.setFontSize(14); doc.setTextColor(16, 185, 129); doc.text(String(resolvedCases), startX + boxWidth + gap + 5, yCursor + 18);

      // Pending
      doc.roundedRect(startX + (boxWidth + gap) * 2, yCursor, boxWidth, boxHeight, 3, 3, 'FD');
      doc.setFontSize(10); doc.setTextColor(100); doc.text("En Cours", startX + (boxWidth + gap) * 2 + 5, yCursor + 8);
      doc.setFontSize(14); doc.setTextColor(245, 158, 11); doc.text(String(pendingCases), startX + (boxWidth + gap) * 2 + 5, yCursor + 18);

      // Rate
      doc.roundedRect(startX + (boxWidth + gap) * 3, yCursor, boxWidth, boxHeight, 3, 3, 'FD');
      doc.setFontSize(10); doc.setTextColor(100); doc.text("Taux Résol.", startX + (boxWidth + gap) * 3 + 5, yCursor + 8);
      doc.setFontSize(14); doc.setTextColor(139, 92, 246); doc.text(`${resolutionRate}%`, startX + (boxWidth + gap) * 3 + 5, yCursor + 18);

      yCursor += 40;

      // -- helper to draw ranking list --
      const drawRanking = (title, data) => {
        checkPageBreak(60); // Check if we have space
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(title, 20, yCursor);
        yCursor += 10;

        data.slice(0, 5).forEach((item, index) => {
          checkPageBreak(15);
          doc.setFontSize(11);
          doc.setTextColor(50);
          const valStr = String(item.value);

          doc.text(`${index + 1}. ${item.name}`, 20, yCursor);
          doc.text(valStr, 180, yCursor, { align: 'right' });

          // Bar
          const maxVal = Math.max(...data.map(v => v.value)) || 1;
          const barW = (item.value / maxVal) * 100;
          doc.setFillColor(59, 130, 246); // blue
          doc.rect(20, yCursor + 2, barW, 2, 'F');
          yCursor += 12;
        });
        yCursor += 10;
      };

      // 1. Top Violence Types
      drawRanking("Top Types de Violence", violenceTypeData);

      // 2. Regional Distribution
      drawRanking("Répartition Régionale", regionData);

      // 3. New Analytics Page Break
      checkPageBreak(100);

      // 3. Relationship
      // Compute data locally for PDF if not available as state variable (re-using logic or assuming state available? 
      // Re-computing for safety/completeness inside the function)
      const relCounts = filteredCases.reduce((acc, c) => {
        const r = c.relationshipToVictim || 'Non spécifié';
        acc[r] = (acc[r] || 0) + 1; return acc;
      }, {});
      const relData = Object.entries(relCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
      drawRanking("Relation Auteur-Victime", relData);

      // 4. Incident Location
      const locCounts = filteredCases.reduce((acc, c) => {
        const l = c.incidentLocation || 'Non spécifié';
        acc[l] = (acc[l] || 0) + 1; return acc;
      }, {});
      const locData = Object.entries(locCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
      drawRanking("Lieu de l'Incident", locData);

      // 5. Marital Status
      const marCounts = filteredCases.reduce((acc, c) => {
        const s = c.victimMaritalStatus || 'Non spécifié';
        acc[s] = (acc[s] || 0) + 1; return acc;
      }, {});
      const marData = Object.entries(marCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
      drawRanking("Statut Matrimonial (Victime)", marData);

      // 6. Disability
      const disCounts = filteredCases.reduce((acc, c) => {
        const d = c.victimDisability || 'Non';
        acc[d] = (acc[d] || 0) + 1; return acc;
      }, {});
      const disData = Object.entries(disCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
      drawRanking("Victimes en situation de Handicap", disData);


      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Page ${i} / ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
        doc.text("Document généré par la Plateforme PFPC VBG - Confidentiel", pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      doc.save("Rapport_Activite_VBG_Complet.pdf");

    } catch (error) {
      console.error("PDF Gen Error", error);
    }
  };

  const exportData = () => {
    const dataToExport = { stats: { totalCases, resolvedCases }, cases: filteredCases, date: new Date() };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `analytics_vbg_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-white/20 p-3 rounded-lg shadow-xl">
          <p className="font-bold text-white mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto p-6 space-y-8">

        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 p-8 rounded-3xl overflow-hidden bg-[#0f172a] border border-white/5 shadow-2xl"
        >
          {/* Decorative Background Grid */}
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
          {/* Gradient Glow Orbs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full xl:w-auto">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
              Tableau de Bord
              <span className="text-blue-400">.</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg font-light">Analyse et indicateurs de performance</p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 bg-slate-800/50 p-3 rounded-2xl border border-white/10 backdrop-blur-md w-full xl:w-auto">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-[150px] h-10 border-white/10 bg-slate-900/50 text-slate-300 hover:text-white focus:ring-blue-500/30 rounded-xl">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="6months">6 Derniers mois</SelectItem>
                <SelectItem value="1year">Année écoulée</SelectItem>
                <SelectItem value="all">Tout l'historique</SelectItem>
              </SelectContent>
            </Select>
            {user?.role === 'super-admin' && (
              <>
                <div className="hidden sm:block w-px h-6 bg-white/10" />
                <Select value={selectedRegionFilter} onValueChange={setSelectedRegionFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10 border-white/10 bg-slate-900/50 text-slate-300 hover:text-white focus:ring-blue-500/30 rounded-xl">
                    <MapIcon className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Région" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="all">Sénégal (National)</SelectItem>
                    {senegalRegions.filter(r => r !== 'all').map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            <div className="flex gap-3">
              <Button onClick={exportData} size="sm" variant="outline" className="flex-1 sm:flex-none border-white/10 bg-slate-900/50 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl px-5 h-10 font-semibold">
                <Download className="mr-2 h-4 w-4" /> JSON
              </Button>
              <Button onClick={generatePDFReport} size="sm" className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20 rounded-xl px-5 h-10 font-semibold">
                <FileText className="mr-2 h-4 w-4" /> Rapport PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { title: 'Total Cas', value: totalCases, icon: FileText, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/5', glow: 'group-hover:shadow-blue-500/20' },
            { title: 'Cas Résolus', value: resolvedCases, icon: UserCheck, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/5', glow: 'group-hover:shadow-emerald-500/20' },
            { title: 'En Cours', value: pendingCases, icon: Activity, color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/5', glow: 'group-hover:shadow-amber-500/20' },
            { title: 'Taux Résolution', value: `${resolutionRate}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/5', glow: 'group-hover:shadow-purple-500/20' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="group"
            >
              <div className={`relative overflow-hidden p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5 bg-slate-900/60 backdrop-blur-sm flex items-center justify-between shadow-lg ${stat.glow} hover:shadow-xl transition-all duration-300`}>
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-50`} />
                <div className="relative z-10">
                  <p className="text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wide mb-1 truncate">{stat.title}</p>
                  <p className="text-2xl sm:text-4xl font-extrabold text-white">{stat.value}</p>
                </div>
                <div className={`relative z-10 p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.bg} border border-white/10 backdrop-blur-sm`}>
                  <stat.icon className={`h-5 w-5 sm:h-7 sm:w-7 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Section 1: Evolution (Restored) */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2">
            <Card className="glass-card border-white/5 bg-slate-900/40 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-blue-400" /> Évolution des signalements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="cases" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCases)" name="Signalés" />
                      <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" name="Résolus" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 2: Violence Types (Ranked) */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
            <Card className="glass-card border-white/5 bg-slate-900/40 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <AlertTriangle className="w-5 h-5 text-pink-500" /> Top Violences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {violenceTypeData.map((item, index) => (
                    <div key={item.name} className="group">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300 font-medium">{item.name}</span>
                        <span className="text-white font-bold">{item.value}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{
                            width: `${(item.value / Math.max(...violenceTypeData.map(v => v.value))) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        >
                          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 3: Geographic Distribution (Restored) */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
            <Card className="glass-card border-white/5 bg-slate-900/40 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MapIcon className="w-5 h-5 text-indigo-400" /> Répartition Régionale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                      <XAxis type="number" stroke="#64748b" tick={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} name="Cas">
                        {regionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 4: Demographics Grid (Victims & Perpetrators) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Victim Sex */}
            <Card className="glass-card border-white/5 bg-slate-900/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4" /> Victimes (Sexe)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={victimSexData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {victimSexData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Perpetrator Sex */}
            <Card className="glass-card border-white/5 bg-slate-900/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <UserX className="w-4 h-4" /> Auteurs (Sexe)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={perpetratorSexData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                        {perpetratorSexData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#64748b'} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Victim Age */}
            <Card className="glass-card border-white/5 bg-slate-900/40 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Répartition par Âge (Victimes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={victimAgeData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Cas" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* NEW: Relationship to Victim */}
            <Card className="glass-card border-white/5 bg-slate-900/40 md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4" /> Relation Auteur-Victime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full overflow-y-auto pr-2 custom-scrollbar">
                  {(() => {
                    const counts = filteredCases.reduce((acc, c) => {
                      const rel = c.relationshipToVictim || 'Non spécifié';
                      acc[rel] = (acc[rel] || 0) + 1;
                      return acc;
                    }, {});
                    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

                    return (
                      <div className="space-y-3">
                        {sorted.map(([name, count], idx) => (
                          <div key={name} className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-slate-300">
                              <span>{name}</span>
                              <span>{count}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full">
                              <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(count / Math.max(...Object.values(counts))) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* NEW: Marital Status */}
            <Card className="glass-card border-white/5 bg-slate-900/40 md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4" /> Statut Matrimonial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const counts = filteredCases.reduce((acc, c) => {
                            const status = c.victimMaritalStatus || 'Non spécifié';
                            acc[status] = (acc[status] || 0) + 1;
                            return acc;
                          }, {});
                          return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
                        })()}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value"
                      >
                        {filteredCases.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* NEW: Incident Location */}
            <Card className="glass-card border-white/5 bg-slate-900/40 md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapIcon className="w-4 h-4" /> Lieu de l'Incident
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full overflow-y-auto pr-2 custom-scrollbar">
                  {(() => {
                    const counts = filteredCases.reduce((acc, c) => {
                      const loc = c.incidentLocation || 'Non spécifié';
                      acc[loc] = (acc[loc] || 0) + 1;
                      return acc;
                    }, {});
                    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                    return (
                      <div className="space-y-3">
                        {sorted.map(([name, count], idx) => (
                          <div key={name} className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-slate-300">
                              <span>{name}</span>
                              <span>{count}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(count / Math.max(...Object.values(counts))) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* NEW: Reporting Lag (Délai de Signalement) */}
            <Card className="glass-card border-white/5 bg-slate-900/40 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Délai de Signalement (Incident vs Signalement)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(() => {
                        const buckets = { '0-24h': 0, '1-7 Jours': 0, '1-4 Semaines': 0, '1-6 Mois': 0, '> 6 Mois': 0 };
                        filteredCases.forEach(c => {
                          const incident = new Date(c.incidentDate);
                          const report = new Date(c.createdAt);
                          if (isNaN(incident.getTime()) || isNaN(report.getTime())) return;

                          const diffTime = report - incident;
                          const diffDays = diffTime / (1000 * 60 * 60 * 24);

                          if (diffDays <= 1) buckets['0-24h']++;
                          else if (diffDays <= 7) buckets['1-7 Jours']++;
                          else if (diffDays <= 30) buckets['1-4 Semaines']++;
                          else if (diffDays <= 180) buckets['1-6 Mois']++;
                          else buckets['> 6 Mois']++;
                        });
                        return Object.keys(buckets).map(key => ({ name: key, value: buckets[key] }));
                      })()}
                      margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Cas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* NEW: Agent Performance */}
            <Card className="glass-card border-white/5 bg-slate-900/40 md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> Performance des Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-3">
                    {agentPerformanceData.map((item, idx) => (
                      <div key={item.name} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span className="truncate max-w-[150px]">{item.name}</span>
                          <span className="font-mono">{item.value} cas</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${(item.value / (Math.max(...agentPerformanceData.map(v => v.value)) || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {agentPerformanceData.length === 0 && (
                      <p className="text-center text-slate-500 text-xs py-10">Aucun cas traité</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NEW: Victim Disability */}
            <Card className="glass-card border-white/5 bg-slate-900/40 md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4" /> Situation de Handicap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const counts = filteredCases.reduce((acc, c) => {
                            const val = c.victimDisability || 'Non'; // Assuming 'Non' if null
                            acc[val] = (acc[val] || 0) + 1;
                            return acc;
                          }, {});
                          // Normalize standard variations if needed, but for now raw strings
                          return Object.entries(counts).map(([name, value]) => ({ name, value }));
                        })()}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value"
                      >
                        {filteredCases.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#f43f5e' : '#eab308'} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* NEW: Victim Education */}
            <Card className="glass-card border-white/5 bg-slate-900/40 md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Niveau d'Éducation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full overflow-y-auto pr-2 custom-scrollbar">
                  {(() => {
                    const counts = filteredCases.reduce((acc, c) => {
                      const edu = c.victimEducation || 'Non spécifié';
                      acc[edu] = (acc[edu] || 0) + 1;
                      return acc;
                    }, {});
                    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                    return (
                      <div className="space-y-3">
                        {sorted.map(([name, count], idx) => (
                          <div key={name} className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-slate-300">
                              <span>{name}</span>
                              <span>{count}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / Math.max(...Object.values(counts))) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* NEW: Services Provided */}
            <Card className="glass-card border-white/5 bg-slate-900/40 md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Services Fournis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full overflow-y-auto pr-2 custom-scrollbar">
                  {(() => {
                    const serviceCounts = filteredCases.reduce((acc, c) => {
                      if (Array.isArray(c.servicesProvided)) {
                        c.servicesProvided.forEach(s => acc[s] = (acc[s] || 0) + 1);
                      }
                      return acc;
                    }, {});
                    const sortedServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]);

                    if (sortedServices.length === 0) return <p className="text-slate-500 text-sm italic">Aucune donnée disponible</p>;

                    return (
                      <div className="space-y-3">
                        {sortedServices.map(([name, count], idx) => (
                          <div key={name} className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-slate-300">
                              <span>{name}</span>
                              <span>{count}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(count / Math.max(...Object.values(serviceCounts))) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* NEW: Follow-up Required */}
            <Card className="glass-card border-white/5 bg-slate-900/40 md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Suivi Requis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const counts = filteredCases.reduce((acc, c) => {
                            const type = c.followUpRequired || 'Non spécifié';
                            acc[type] = (acc[type] || 0) + 1;
                            return acc;
                          }, {});
                          return Object.entries(counts).map(([name, value]) => ({ name, value }));
                        })()}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value"
                      >
                        {filteredCases.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;