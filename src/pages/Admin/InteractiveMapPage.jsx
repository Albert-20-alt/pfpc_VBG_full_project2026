import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Layers, ZoomIn, ZoomOut, Activity, AlertTriangle, Shield } from 'lucide-react';

// Enhanced Mock Map Component
const MockMapDisplay = ({ highlightedRegion, allowedRegions, onRegionClick }) => {
  const senegalRegions = ['Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 'Fatick', 'Kaolack', 'Kolda', 'Ziguinchor', 'Tambacounda', 'Kaffrine', 'Kédougou', 'Matam', 'Sédhiou'];

  const displayRegions = allowedRegions && allowedRegions.length > 0
    ? senegalRegions.filter(r => allowedRegions.includes(r))
    : senegalRegions;

  return (
    <div className="h-full w-full bg-slate-900/50 rounded-2xl p-4 relative overflow-hidden border border-white/10 shadow-inner group">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 pointer-events-none"></div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 h-full overflow-y-auto relative z-10 p-2 sm:p-4 pb-20 custom-scrollbar">
        {displayRegions.map((region, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={region}
            onClick={() => onRegionClick(region)}
            className={`
                border border-white/5 backdrop-blur-sm rounded-xl text-[10px] sm:text-xs font-medium text-center flex flex-col items-center justify-center p-2 sm:p-4 cursor-pointer
                hover:border-blue-400/50 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300
              ${highlightedRegion === region ? 'bg-blue-500/20 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-105 z-20' : 'bg-black/20 text-slate-400'}
            `}
          >
            <MapPin className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mb-1.5 sm:mb-2 ${highlightedRegion === region ? 'text-blue-400' : 'text-slate-600'}`} />
            <span className="truncate w-full">{region}</span>
          </motion.div>
        ))}
        {displayRegions.length === 0 && (
          <div className="col-span-3 sm:col-span-4 flex items-center justify-center text-slate-500">
            Aucune région à afficher.
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2 z-20">
        <button className="p-3 bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-full hover:bg-slate-700 hover:border-white/20 transition-colors shadow-lg"><ZoomIn className="h-5 w-5 text-white" /></button>
        <button className="p-3 bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-full hover:bg-slate-700 hover:border-white/20 transition-colors shadow-lg"><ZoomOut className="h-5 w-5 text-white" /></button>
      </div>

      {/* Live Indicator */}
      <div className="absolute top-6 left-6 z-20 flex items-center bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full backdrop-blur-md">
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-red-400 text-xs font-bold tracking-wider">LIVE DATA</span>
      </div>
    </div>
  );
};

// Region Details Modal
const RegionDetailsModal = ({ region, cases, onClose }) => {
  if (!region) return null;

  const regionCases = cases.filter(c => c.victimRegion === region);
  const total = regionCases.length;

  // Top 3 Types
  const topTypes = Object.entries(regionCases.reduce((acc, c) => {
    acc[c.violenceType || 'Autre'] = (acc[c.violenceType || 'Autre'] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>

        <h2 className="text-2xl font-bold text-white mb-1">{region}</h2>
        <p className="text-slate-400 text-sm mb-6">Détails Statistiques</p>

        <div className="space-y-6">
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
            <span className="text-slate-300 font-medium">Total Signalements</span>
            <span className="text-3xl font-bold text-blue-400">{total}</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Top Violences</h3>
            <div className="space-y-2">
              {topTypes.length > 0 ? topTypes.map(([type, count], i) => (
                <div key={type} className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">{i + 1}. {type}</span>
                  <span className="text-white font-bold">{count}</span>
                </div>
              )) : <p className="text-slate-500 italic text-sm">Aucune donnée</p>}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


const InteractiveMapPage = () => {
  const { user } = useAuth();
  const { cases } = useData();
  const [selectedLayer, setSelectedLayer] = useState('case_density');
  const [highlightedRegion, setHighlightedRegion] = useState(null);
  const [selectedRegionDetails, setSelectedRegionDetails] = useState(null);

  // Filters
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [violenceFilter, setViolenceFilter] = useState('all');

  // Filter cases logic
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Role Filter
      if (user.role !== 'super-admin' && c.victimRegion !== user.region) return false;

      // Date Filter
      if (dateRange.start && new Date(c.createdAt) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(c.createdAt) > new Date(dateRange.end)) return false;

      // Violence Type Filter
      if (violenceFilter !== 'all' && c.violenceType !== violenceFilter) return false;

      return true;
    });
  }, [cases, user, dateRange, violenceFilter]);

  const regionCaseCounts = useMemo(() => {
    const counts = {};
    filteredCases.forEach(c => {
      counts[c.victimRegion] = (counts[c.victimRegion] || 0) + 1;
    });
    return counts;
  }, [filteredCases]);

  const visibleRegions = useMemo(() => {
    if (user.role === 'super-admin') {
      return [...new Set(filteredCases.map(c => c.victimRegion).filter(Boolean))];
    }
    return [user.region].filter(Boolean);
  }, [filteredCases, user]);

  const mapDisplayRegions = useMemo(() => {
    if (user.role === 'super-admin') return [];
    return [user.region];
  }, [user]);

  // Unique Violence Types for Filter
  const violenceTypes = useMemo(() => {
    const types = new Set(cases.map(c => c.violenceType).filter(Boolean));
    return ['all', ...Array.from(types)];
  }, [cases]);


  const handleRegionHover = (regionName) => {
    setHighlightedRegion(regionName);
  };

  const handleRegionLeave = () => {
    setHighlightedRegion(null);
  };

  const getRegionStyle = (regionName) => {
    const count = regionCaseCounts[regionName] || 0;
    if (count > 10) return 'text-red-400 border-l-2 border-red-500 bg-red-500/5';
    if (count > 5) return 'text-yellow-400 border-l-2 border-yellow-500 bg-yellow-500/5';
    return 'text-emerald-400 border-l-2 border-emerald-500 bg-emerald-500/5';
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Detail Modal */}
        {selectedRegionDetails && (
          <RegionDetailsModal
            region={selectedRegionDetails}
            cases={filteredCases}
            onClose={() => setSelectedRegionDetails(null)}
          />
        )}

        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-4 sm:p-8 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/5 shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
          <div className="relative z-10 w-full lg:w-auto">
            <h1 className="text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
              Cartographie Interactive
            </h1>
            <p className="text-slate-300 mt-2 sm:mt-3 text-sm sm:text-lg font-light max-w-2xl">
              Visualisation géospatiale des alertes et signalements VBG au Sénégal <span className="font-semibold text-white">{user.region && user.role !== 'super-admin' ? `(${user.region})` : ''}</span>.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:flex-none flex flex-col items-center justify-center min-w-[100px] sm:min-w-[120px] p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 shadow-lg group hover:border-emerald-500/30 transition-all duration-300">
              <div className="mb-1.5 sm:mb-2 p-1.5 sm:p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Régions</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{visibleRegions.length} <span className="text-slate-500 text-xs sm:text-sm font-normal">/ {user.role === 'super-admin' ? '14' : '1'}</span></p>
            </div>

            <div className="flex-1 lg:flex-none flex flex-col items-center justify-center min-w-[100px] sm:min-w-[120px] p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 shadow-lg group hover:border-blue-500/30 transition-all duration-300">
              <div className="mb-1.5 sm:mb-2 p-1.5 sm:p-2 bg-blue-500/10 rounded-full border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Alertes</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{filteredCases.length}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Map Area */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="glass-effect rounded-2xl p-1 border border-white/10 shadow-2xl overflow-hidden">
              <div className="h-[350px] sm:h-[600px]"> {/* Responsive Map Height */}
                <MockMapDisplay
                  highlightedRegion={highlightedRegion}
                  allowedRegions={mapDisplayRegions}
                  onRegionClick={(r) => setSelectedRegionDetails(r)}
                />
              </div>
            </div>
          </motion.div>

          {/* Command Center Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card h-full flex flex-col border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-900/40">
              <CardHeader className="pb-4 border-b border-white/5 bg-white/5 backdrop-blur-sm">
                <CardTitle className="flex items-center text-lg sm:text-xl font-bold text-white">
                  <div className="p-1.5 sm:p-2 mr-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                  Centre de Contrôle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 flex-grow">

                {/* Advanced Filters */}
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest pl-1">FILTRES TEMPORELS & TYPES</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className="bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs px-2 py-3 focus:outline-none focus:border-blue-500 w-full"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                    <input
                      type="date"
                      className="bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs px-2 py-3 focus:outline-none focus:border-blue-500 w-full"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </div>
                  <Select value={violenceFilter} onValueChange={setViolenceFilter}>
                    <SelectTrigger className="w-full bg-slate-800/50 border-white/10 text-white h-11 sm:h-12 rounded-xl focus:ring-blue-500/20 focus:border-blue-500/50 text-xs sm:text-sm">
                      <SelectValue placeholder="Type de Violence" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white backdrop-blur-xl">
                      <SelectItem value="all">Tous les Types</SelectItem>
                      {violenceTypes.filter(t => t !== 'all').map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                {/* Layer Selection */}
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-widest pl-1">CALQUES DE DONNÉES</label>
                  <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                    <SelectTrigger className="w-full bg-slate-800/50 border-white/10 text-white h-11 sm:h-12 rounded-xl focus:ring-blue-500/20 focus:border-blue-500/50 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white backdrop-blur-xl">
                      <SelectItem value="case_density">Densité des Signalements</SelectItem>
                      <SelectItem value="violence_type">Types de Violence (Heatmap)</SelectItem>
                      <SelectItem value="support_centers">Centres de Prise en Charge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Legend */}
                <div className="space-y-3 sm:space-y-4">
                  <label className="text-[10px] sm:text-xs font-bold text-purple-400 uppercase tracking-widest pl-1">LÉGENDE (INTENSITÉ)</label>
                  <div className="space-y-3 bg-slate-950/30 p-4 sm:p-5 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex items-center justify-between group">
                      <span className="text-xs sm:text-sm text-slate-400 font-medium group-hover:text-emerald-400 transition-colors">Faible</span>
                      <div className="h-2.5 w-24 sm:w-32 bg-gradient-to-r from-emerald-500/10 to-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]"></div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <span className="text-xs sm:text-sm text-slate-400 font-medium group-hover:text-yellow-400 transition-colors">Moyenne</span>
                      <div className="h-2.5 w-24 sm:w-32 bg-gradient-to-r from-yellow-500/10 to-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.2)]"></div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <span className="text-xs sm:text-sm text-slate-400 font-medium group-hover:text-red-400 transition-colors">Élevée</span>
                      <div className="h-2.5 w-24 sm:w-32 bg-gradient-to-r from-red-500/10 to-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.2)]"></div>
                    </div>
                  </div>
                </div>

                {/* Regional Stats List */}
                <div className="space-y-3 sm:space-y-4 flex-grow flex flex-col min-h-0">
                  <label className="text-[10px] sm:text-xs font-bold text-pink-400 uppercase tracking-widest pl-1 flex items-center justify-between">
                    <span>DONNÉES PAR RÉGION</span>
                    <span className="text-slate-500 bg-white/5 px-2 py-0.5 rounded text-[10px]">{visibleRegions.length} ACTIVES</span>
                  </label>
                  <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar flex-grow" style={{ maxHeight: '350px' }}>
                    {visibleRegions.map(region => (
                      <div
                        key={region}
                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:scale-[1.02] ${getRegionStyle(region)}`}
                        onClick={() => setSelectedRegionDetails(region)}
                        onMouseEnter={() => handleRegionHover(region)}
                        onMouseLeave={handleRegionLeave}
                      >
                        <span className="font-semibold text-xs sm:text-sm">{region}</span>
                        <div className="h-5 sm:h-6 min-w-[24px] sm:min-w-[30px] px-1.5 sm:px-2 flex items-center justify-center rounded-md bg-black/20 text-[10px] sm:text-xs font-bold shadow-sm">
                          {regionCaseCounts[region] || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default InteractiveMapPage;