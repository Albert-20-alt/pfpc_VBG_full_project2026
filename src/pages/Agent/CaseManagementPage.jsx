import React, { useState, useMemo } from 'react';
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  Search,
  Filter,
  Edit,
  Eye,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon,
  HeartHandshake,
  Trash2,
  Users
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';

const CaseManagementPage = () => {
  const { user } = useAuth();
  const { cases, deleteCase } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [caseToDelete, setCaseToDelete] = useState(null);

  const confirmDelete = async () => {
    if (caseToDelete) {
      await deleteCase(caseToDelete);
      setCaseToDelete(null);
    }
  };




  // Helper to safely parse dates
  const safelyGetDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // Date Filtering
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const agentCases = useMemo(() => {
    if (!user || !cases || !Array.isArray(cases)) return [];
    return cases.filter(c => String(c.agentId) === String(user.id));
  }, [cases, user]);

  // Calculate Stats
  const stats = useMemo(() => {
    return {
      total: agentCases.length,
      pending: agentCases.filter(c => c.status === 'pending').length,
      completed: agentCases.filter(c => c.status === 'completed').length,
      followUp: agentCases.filter(c => c.status === 'follow-up').length
    };
  }, [agentCases]);

  const filteredCases = useMemo(() => {
    return agentCases.filter(c => {
      const matchesSearch =
        (c.id && c.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.victimName && c.victimName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.violenceType && c.violenceType.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      // Date Filtering
      // Date Filtering
      let matchesDate = true;
      const dateToUse = c.submittedAt || c.createdAt;
      if (dateToUse) {
        const date = safelyGetDate(dateToUse);
        if (date) {
          const yearMatch = selectedYear === 'all' || date.getFullYear().toString() === selectedYear;
          const monthMatch = selectedMonth === 'all' || (date.getMonth() + 1).toString() === selectedMonth;
          const dayMatch = selectedDay === 'all' || date.getDate().toString() === selectedDay;
          matchesDate = yearMatch && monthMatch && dayMatch;
        }
      } else if (selectedYear !== 'all' || selectedMonth !== 'all' || selectedDay !== 'all') {
        matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [agentCases, searchTerm, statusFilter, selectedYear, selectedMonth, selectedDay]);




  // Pagination calculations
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCases = filteredCases.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedYear, selectedMonth, selectedDay]);

  // Metadata for dropdowns
  const years = ['2023', '2024', '2025', '2026'];
  const months = [
    { value: '1', label: 'Janvier' }, { value: '2', label: 'Février' }, { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' }, { value: '5', label: 'Mai' }, { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' }, { value: '8', label: 'Août' }, { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' }, { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' }
  ];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

  const handleEdit = (caseData) => {
    navigate('/form', { state: { caseData, isEditing: true } });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500"><Clock className="w-3 h-3 mr-1" /> En attente</span>;
      case 'open':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500"><Eye className="w-3 h-3 mr-1" /> En cours</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Traité</span>;
      case 'closed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400"><CheckCircle2 className="w-3 h-3 mr-1" /> Clos</span>;
      case 'archived':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400"><Trash2 className="w-3 h-3 mr-1" /> Archivé</span>;
      case 'follow-up':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500"><AlertCircle className="w-3 h-3 mr-1" /> Suivi requis</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400">Inconnu</span>;
    }
  };

  const handleExportSingleCase = (c) => {
    try {
      const doc = new jsPDF();
      const lineHeight = 10;
      let y = 20;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(41, 128, 185); // Blue color
      doc.text(`Détails du Cas #${(c.id || '').toString().slice(-6)}`, 20, y);
      y += lineHeight * 2;

      // Victim Info
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Informations Victime", 20, y);
      y += lineHeight;
      doc.setFontSize(10);
      doc.text(`Nom: ${c.victimName || 'N/A'}`, 20, y);
      doc.text(`Age: ${c.victimAge || 'N/A'}`, 100, y);
      y += lineHeight;
      doc.text(`Genre: ${c.victimGender || 'N/A'}`, 20, y);
      doc.text(`Region: ${c.victimRegion || 'N/A'}`, 100, y);
      y += lineHeight;
      doc.text(`Profession: ${c.victimProfession || 'N/A'}`, 20, y);
      doc.text(`Commune: ${c.victimCommune || 'N/A'}`, 100, y);
      y += lineHeight * 2;

      // Perpetrator Info
      doc.setFontSize(14);
      doc.text("Information Auteur", 20, y);
      y += lineHeight;
      doc.setFontSize(10);
      doc.text(`Nom: ${c.perpetratorName || 'Inconnu'}`, 20, y);
      doc.text(`Age: ${c.perpetratorAge || 'N/A'}`, 100, y);
      y += lineHeight;
      doc.text(`Genre: ${c.perpetratorGender || 'N/A'}`, 20, y);
      doc.text(`Relation: ${c.relationshipToVictim || 'N/A'}`, 100, y);
      y += lineHeight * 2;

      // Violence Info
      doc.setFontSize(14);
      doc.text("Détails Violence", 20, y);
      y += lineHeight;
      doc.setFontSize(10);
      doc.text(`Type: ${c.violenceType || 'N/A'}`, 20, y);
      doc.text(`Date: ${c.incidentDate ? new Date(c.incidentDate).toLocaleDateString() : 'N/A'}`, 100, y);
      y += lineHeight;
      doc.text(`Lieu: ${c.incidentLocation || 'N/A'}`, 20, y);
      y += lineHeight;

      // Prises en Charge
      y += lineHeight;
      doc.setFontSize(14);
      doc.text("Prises en Charge", 20, y);
      y += lineHeight;
      doc.setFontSize(10);

      const services = Array.isArray(c.servicesProvided) ? c.servicesProvided.join(', ') : (c.servicesProvided || 'Aucun');
      const splitServices = doc.splitTextToSize(`Services: ${services}`, 170);
      doc.text(splitServices, 20, y);
      y += lineHeight * (splitServices.length);

      if (c.supportNeeds) {
        const splitNeeds = doc.splitTextToSize(`Besoins: ${c.supportNeeds}`, 170);
        doc.text(splitNeeds, 20, y);
        y += lineHeight * (splitNeeds.length);
      }

      if (c.referrals) {
        const splitReferrals = doc.splitTextToSize(`Référencements: ${c.referrals}`, 170);
        doc.text(splitReferrals, 20, y);
        y += lineHeight * (splitReferrals.length);
      }

      y += lineHeight;

      // Description
      if (c.violenceDescription) {
        y += lineHeight;
        const splitDesc = doc.splitTextToSize(`Description: ${c.violenceDescription}`, 170);
        doc.text(splitDesc, 20, y);
      }

      doc.save(`cas_${(c.id || '').toString().slice(-6)}.pdf`);

      toast({
        title: "Exportation réussie",
        description: "Le PDF a été téléchargé.",
        className: "bg-green-500 text-white border-none"
      });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast({
        title: "Erreur d'exportation",
        description: "Impossible de créer le PDF.",
        variant: "destructive"
      });
    }
  };

  // Safety check for rendering
  if (!user || !Array.isArray(cases)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-400">Chargement des données...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col md:flex-row justify-between items-start md:items-center p-8 rounded-3xl overflow-hidden bg-[#0f172a] border border-white/5 shadow-2xl"
        >
          {/* Decorative Background Grid */}
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
          {/* Gradient Glow Orb */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-2xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
              Gestion de mes Cas
            </h1>
            <p className="text-slate-400 mt-1 text-sm sm:text-lg font-light">
              Recherchez, filtrez et gérez vos soumissions VBG.
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { title: "Total Soumissions", value: stats.total, icon: FileText, color: "text-blue-400", bg: "from-blue-500/20 to-blue-600/5", glow: "group-hover:shadow-blue-500/20" },
            { title: "En attente", value: stats.pending, icon: Clock, color: "text-amber-400", bg: "from-amber-500/20 to-amber-600/5", glow: "group-hover:shadow-amber-500/20" },
            { title: "Dossiers Clos", value: stats.completed, icon: CheckCircle2, color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/5", glow: "group-hover:shadow-emerald-500/20" },
            { title: "Suivi Requis", value: stats.followUp, icon: AlertCircle, color: "text-purple-400", bg: "from-purple-500/20 to-purple-600/5", glow: "group-hover:shadow-purple-500/20" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="group"
            >
              <Card className={`relative overflow-hidden bg-slate-900/60 backdrop-blur-sm border-white/5 hover:border-white/10 transition-all duration-300 shadow-lg ${stat.glow} hover:shadow-xl`}>
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-50`} />
                <CardContent className="relative z-10 p-3 sm:p-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wide truncate">{stat.title}</p>
                    <p className="text-2xl sm:text-4xl font-extrabold mt-1 sm:mt-2 text-white">{stat.value}</p>
                  </div>
                  <div className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.bg} border border-white/10 backdrop-blur-sm`}>
                    <stat.icon className={`h-5 w-5 sm:h-7 sm:w-7 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-xl"
        >
          {/* Filters Bar */}
          <div className="p-4 sm:p-6 border-b border-white/5 flex flex-col gap-4 bg-gradient-to-r from-slate-900/80 to-slate-800/50">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher (ID, Nom, Type)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-11 bg-slate-800/50 border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all rounded-xl text-white placeholder:text-slate-500 w-full"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 w-full">
              {/* Year Filter */}
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full sm:w-[100px] h-11 bg-slate-800/50 border-white/10 rounded-xl">
                  <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="all">Année</SelectItem>
                  {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>

              {/* Month Filter */}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-[130px] h-11 bg-slate-800/50 border-white/10 rounded-xl">
                  <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Mois" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="all">Mois</SelectItem>
                  {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>

              {/* Day Filter */}
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-full sm:w-[90px] h-11 bg-slate-800/50 border-white/10 rounded-xl">
                  <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Jour" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 h-[300px]">
                  <SelectItem value="all">Jour</SelectItem>
                  {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px] h-11 bg-slate-800/50 border-white/10 rounded-xl col-span-2 sm:col-span-1">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En cours</SelectItem>
                  <SelectItem value="completed">Complété</SelectItem>
                  <SelectItem value="follow-up">Nécessite suivi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              <AnimatePresence>
                {paginatedCases.length > 0 ? (
                  paginatedCases.map((c, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={c.id}
                    >
                      <Card className="bg-slate-900/60 backdrop-blur-md border border-white/5 overflow-hidden group hover:bg-slate-800/60 transition-colors">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Cas #{c.id}</span>
                              <h4 className="text-sm font-bold text-white leading-tight mt-0.5">
                                {c.violenceType}
                              </h4>
                            </div>
                            <div className="transform scale-90 origin-top-right">
                              {getStatusBadge(c.status)}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                            <div className="flex items-center">
                              <CalendarIcon className="w-3 h-3 mr-1.5 opacity-50 text-blue-400" />
                              {(() => {
                                const d = c.submittedAt ? safelyGetDate(c.submittedAt) : (c.createdAt ? safelyGetDate(c.createdAt) : null);
                                return d ? d.toLocaleDateString() : 'N/A';
                              })()}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1.5 opacity-50 text-purple-400" />
                              <span className="truncate max-w-[100px]">
                                {c.agentName || (c.agentId ? `Agent ${c.agentId.slice(0, 4)}` : 'N/A')}
                              </span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-white/5 flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 text-blue-400 hover:bg-blue-500/10">
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-900 border-white/10 text-white w-[95vw]">
                                <DialogHeader>
                                  <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Détails du Cas #{(c.id || '').toString().slice(-6)}</DialogTitle>
                                  <DialogDescription className="text-slate-400">
                                    Informations complètes sur le signalement.
                                  </DialogDescription>
                                </DialogHeader>

                                {/* Mobile Optimized Dialog Content */}
                                <div className="space-y-6 mt-4">
                                  <div className="space-y-4">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                      <h3 className="text-sm font-semibold text-blue-300 mb-2 flex items-center"><FileText className="w-4 h-4 mr-2" /> Victime</h3>
                                      <div className="grid grid-cols-1 gap-1 text-sm">
                                        <p><span className="text-slate-400">Nom:</span> <span className="text-white">{c.victimName || 'N/A'}</span></p>
                                        <p><span className="text-slate-400">Âge:</span> {c.victimAge || 'N/A'}</p>
                                        <p><span className="text-slate-400">Région:</span> {c.victimRegion || 'N/A'}</p>
                                      </div>
                                    </div>

                                    {/* Perpetrator Info Mobile */}
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                      <h3 className="text-sm font-semibold text-red-300 mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Information Auteur</h3>
                                      <div className="grid grid-cols-1 gap-1 text-sm">
                                        <p><span className="text-slate-400">Nom:</span> <span className="text-white">{c.perpetratorName || 'Inconnu'}</span></p>
                                        <p><span className="text-slate-400">Âge:</span> {c.perpetratorAge || 'N/A'}</p>
                                        <p><span className="text-slate-400">Genre:</span> {c.perpetratorGender || 'N/A'}</p>
                                        <p><span className="text-slate-400">Relation:</span> {c.relationshipToVictim || 'N/A'}</p>
                                      </div>
                                    </div>

                                    {/* Status Info Mobile */}
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                      <h3 className="text-sm font-semibold text-emerald-300 mb-2 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Statut & Suivi</h3>
                                      <div className="space-y-1 text-sm">
                                        <p className="flex items-center justify-between"><span className="text-slate-400">Statut:</span> {getStatusBadge(c.status)}</p>
                                        <p><span className="text-slate-400">Agent:</span> {c.agentName || (c.agentId ? `Agent ${c.agentId}` : 'Non assigné')}</p>
                                        <p><span className="text-slate-400">Lieu:</span> {c.victimRegion || 'N/A'}</p>
                                      </div>
                                    </div>

                                    {/* Services Info Mobile */}
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                      <h3 className="text-sm font-semibold text-pink-300 mb-2 flex items-center"><HeartHandshake className="w-4 h-4 mr-2" /> Prises en Charge</h3>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex flex-wrap gap-1">
                                          {Array.isArray(c.servicesProvided) && c.servicesProvided.length > 0 ? (
                                            c.servicesProvided.map((s, i) => (
                                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                                                {s}
                                              </span>
                                            ))
                                          ) : (
                                            <span className="text-slate-500 italic">Aucun service</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                      <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Violence</h3>
                                      <div className="space-y-1 text-sm">
                                        <p><span className="text-slate-400">Type:</span> {c.violenceType}</p>
                                        <p><span className="text-slate-400">Date:</span> {c.incidentDate ? new Date(c.incidentDate).toLocaleDateString() : 'N/A'}</p>
                                      </div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                      <h3 className="text-sm font-semibold text-slate-300 mb-2">Description</h3>
                                      <p className="text-sm text-slate-400 whitespace-pre-wrap">{c.violenceDescription || "Aucune description."}</p>
                                    </div>
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button onClick={() => handleExportSingleCase(c)} variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                                    <Download className="mr-2 h-4 w-4" /> Exporter PDF
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Button
                              onClick={() => handleEdit(c)}
                              variant="ghost"
                              size="sm"
                              className="h-8 text-emerald-400 hover:bg-emerald-500/10"
                              disabled={user.role !== 'super-admin' && new Date(c.submittedAt || c.createdAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>

                            {user?.role === 'super-admin' && (
                              <Button
                                onClick={() => setCaseToDelete(c.id)}
                                variant="ghost"
                                size="sm"
                                className="h-8 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center p-8 text-slate-500 bg-white/5 rounded-xl border border-white/5">
                    Aucun cas trouvé.
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop Table */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">ID Cas</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Victime</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type de Violence</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Région</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Commune</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {paginatedCases.length > 0 ? (
                    paginatedCases.map((c, index) => (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.03 }}
                        key={c.id}
                        className="group hover:bg-white/[0.04] transition-colors"
                      >
                        <td className="p-4 text-sm font-mono text-slate-300">#{(c.id || '').toString().slice(-6)}</td>
                        <td className="p-4 text-sm text-white font-medium">Anonyme #{c.id}</td>
                        <td className="p-4 text-sm text-slate-300">{c.violenceType}</td>
                        <td className="p-4 text-sm text-slate-300">{c.victimRegion || 'N/A'}</td>
                        <td className="p-4 text-sm text-slate-300">{c.victimCommune || 'N/A'}</td>
                        <td className="p-4 text-sm text-slate-300 flex items-center">
                          <CalendarIcon className="w-3 h-3 mr-2 opacity-50" />
                          {(() => {
                            const d = c.submittedAt ? safelyGetDate(c.submittedAt) : (c.createdAt ? safelyGetDate(c.createdAt) : null);
                            return d ? d.toLocaleDateString() : 'Date inconnue';
                          })()}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(c.status)}
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-900 border-white/10 text-white">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Détails du Cas #{(c.id || '').toString().slice(-6)}</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                  Informations complètes sur le signalement.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-4">
                                  {/* Victim Information */}
                                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center"><FileText className="w-4 h-4 mr-2" /> Informations Victime</h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                      <p className="col-span-2"><span className="text-slate-400">Nom:</span> <span className="text-white font-medium">{c.victimName || 'N/A'}</span></p>
                                      <p><span className="text-slate-400">Âge:</span> {c.victimAge || 'N/A'}</p>
                                      <p><span className="text-slate-400">Genre:</span> {c.victimGender || 'N/A'}</p>
                                      <p><span className="text-slate-400">Région:</span> {c.victimRegion || 'N/A'}</p>
                                      <p><span className="text-slate-400">Commune:</span> {c.victimCommune || 'N/A'}</p>
                                      <p><span className="text-slate-400">Handicap:</span> {c.victimDisability || 'Non'}</p>
                                      <p><span className="text-slate-400">Statut Marital:</span> {c.victimMaritalStatus || 'N/A'}</p>
                                      <p><span className="text-slate-400">Religion:</span> {c.victimReligion || 'N/A'}</p>
                                      <p><span className="text-slate-400">Ethnie:</span> {c.victimEthnicity || 'N/A'}</p>
                                      <p><span className="text-slate-400">Éducation:</span> {c.victimEducation || 'N/A'}</p>
                                      <p className="col-span-2"><span className="text-slate-400">Profession:</span> {c.victimProfession || 'N/A'}</p>
                                    </div>
                                  </div>

                                  {/* Perpetrator Information */}
                                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Information Auteur</h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                      <p className="col-span-2"><span className="text-slate-400">Nom:</span> <span className="text-white font-medium">{c.perpetratorName || 'Inconnu'}</span></p>
                                      <p><span className="text-slate-400">Âge:</span> {c.perpetratorAge || 'N/A'}</p>
                                      <p><span className="text-slate-400">Genre:</span> {c.perpetratorGender || 'N/A'}</p>
                                      <p><span className="text-slate-400">Profession:</span> {c.perpetratorProfession || 'N/A'}</p>
                                      <p><span className="text-slate-400">Classe Sociale:</span> {c.perpetratorSocialClass || 'N/A'}</p>
                                      <p><span className="text-slate-400">Relation:</span> {c.relationshipToVictim || 'N/A'}</p>
                                      <p><span className="text-slate-400">Région:</span> {c.perpetratorRegion || 'N/A'}</p>
                                      <p><span className="text-slate-400">Commune:</span> {c.perpetratorCommune || 'N/A'}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  {/* Status & Follow-up */}
                                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Statut & Suivi</h3>
                                    <div className="space-y-2 text-sm">
                                      <p><span className="text-slate-400">Statut:</span> {getStatusBadge(c.status)}</p>
                                      <p><span className="text-slate-400">Agent en charge:</span> {c.agentName || (c.agentId ? `Agent ${c.agentId}` : 'Non assigné')}</p>
                                      <p><span className="text-slate-400">Lieu de suivi:</span> {c.victimRegion || 'N/A'}{c.victimCommune ? ` - ${c.victimCommune}` : ''}</p>
                                      <p><span className="text-slate-400">Créé le:</span> {new Date(c.createdAt).toLocaleString()}</p>
                                    </div>
                                  </div>

                                  {/* Violence Details */}
                                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Détails Violence</h3>
                                    <div className="space-y-2 text-sm">
                                      <p><span className="text-slate-400">Type:</span> {c.violenceType || 'N/A'}</p>
                                      <p><span className="text-slate-400">Lieu Incident:</span> {c.incidentLocation || 'N/A'}</p>
                                      <p><span className="text-slate-400">Date Incident:</span> {c.incidentDate ? new Date(c.incidentDate).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                  </div>

                                  {/* Prises en charge */}
                                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <h3 className="text-lg font-semibold text-pink-300 mb-3 flex items-center"><HeartHandshake className="w-4 h-4 mr-2" /> Prises en Charge</h3>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="text-slate-400 block mb-1">Services Reçus:</span>
                                        <div className="flex flex-wrap gap-1">
                                          {Array.isArray(c.servicesProvided) && c.servicesProvided.length > 0 ? (
                                            c.servicesProvided.map((s, i) => (
                                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                                                {s}
                                              </span>
                                            ))
                                          ) : (
                                            <span className="text-slate-500 italic">Aucun service noté</span>
                                          )}
                                        </div>
                                      </div>
                                      {c.supportNeeds && (
                                        <p className="mt-2"><span className="text-slate-400">Besoins exprimés:</span> {c.supportNeeds}</p>
                                      )}
                                      {c.referrals && (
                                        <p><span className="text-slate-400">Référé vers:</span> {c.referrals}</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Description */}
                                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <h3 className="text-lg font-semibold text-slate-300 mb-3">Description</h3>
                                    <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                      <p className="text-sm text-slate-400 whitespace-pre-wrap">{c.violenceDescription || "Aucune description fournie."}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter className="mr-8">
                                <Button onClick={() => handleExportSingleCase(c)} variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                                  <Download className="mr-2 h-4 w-4" /> Exporter PDF
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button
                            onClick={() => handleEdit(c)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
                            disabled={user.role !== 'super-admin' && new Date(c.submittedAt || c.createdAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {user?.role === 'super-admin' && (
                            <Button
                              onClick={() => setCaseToDelete(c.id)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              title="Supprimer ce cas"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        Aucun cas trouvé correspondant à vos critères.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {
            filteredCases.length > 0 && (
              <div className="p-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm bg-gradient-to-r from-slate-900/80 to-slate-800/50">
                <span className="text-slate-400 text-center sm:text-left">
                  Affichage de <span className="text-white font-semibold">{startIndex + 1}</span> à <span className="text-white font-semibold">{Math.min(endIndex, filteredCases.length)}</span> sur <span className="text-white font-semibold">{filteredCases.length}</span> cas
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-9 px-4 border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white disabled:opacity-40 rounded-lg transition-all"
                  >
                    Précédent
                  </Button>
                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let p = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        p = currentPage - 2 + i;
                        if (p > totalPages) return null;
                      }
                      return (
                        <Button
                          key={p}
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(p)}
                          className={`h-9 w-9 p-0 rounded-lg font-semibold transition-all ${currentPage === p
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                        >
                          {p}
                        </Button>
                      )
                    }).filter(Boolean)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-9 px-4 border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white disabled:opacity-40 rounded-lg transition-all"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )
          }
        </motion.div>
      </div>

      <AlertDialog open={!!caseToDelete} onOpenChange={(open) => !open && setCaseToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Êtes-vous sûr de vouloir supprimer ce cas ? Cette action est irréversible et effacera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-slate-300 border-white/10 hover:bg-white/5 hover:text-white">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default CaseManagementPage;