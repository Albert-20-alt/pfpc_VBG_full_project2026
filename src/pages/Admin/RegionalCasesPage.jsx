import React, { useState, useMemo } from 'react';
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
    Search,
    Filter,
    Eye,
    Download,
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    Trash2,
    Calendar as CalendarIcon,
    MapPin,
    User,
    HeartHandshake
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

const RegionalCasesPage = () => {
    const { cases, deleteCase } = useData();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Date Filters
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedDay, setSelectedDay] = useState('all');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [caseToDelete, setCaseToDelete] = useState(null);

    // Filter Cases by Region
    const regionalCases = useMemo(() => {
        if (!user?.region) return [];
        return cases.filter(c =>
            String(c.agentId) === String(user.id) ||
            c.victimRegion === user.region ||
            c.perpetratorRegion === user.region
        );
    }, [cases, user]);

    // Calculate Stats for Region
    const stats = useMemo(() => {
        return {
            total: regionalCases.length,
            pending: regionalCases.filter(c => c.status === 'pending').length,
            completed: regionalCases.filter(c => c.status === 'completed').length,
            followUp: regionalCases.filter(c => c.status === 'follow-up').length
        };
    }, [regionalCases]);

    const filteredCases = useMemo(() => {
        return regionalCases.filter(c => {
            const matchesSearch =
                (c.id && c.id.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.victimName && c.victimName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.violenceType && c.violenceType.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

            // Date Filtering
            let matchesDate = true;
            if (c.createdAt) {
                const date = new Date(c.createdAt);
                const yearMatch = selectedYear === 'all' || date.getFullYear().toString() === selectedYear;
                const monthMatch = selectedMonth === 'all' || (date.getMonth() + 1).toString() === selectedMonth;
                const dayMatch = selectedDay === 'all' || date.getDate().toString() === selectedDay;
                matchesDate = yearMatch && monthMatch && dayMatch;
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [regionalCases, searchTerm, statusFilter, selectedYear, selectedMonth, selectedDay]);

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

    const handleDeleteClick = (id) => {
        setCaseToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!caseToDelete) return;

        try {
            await deleteCase(caseToDelete);
            toast({
                title: "Cas supprimé",
                description: "Le cas a été supprimé avec succès.",
                className: "bg-green-500 text-white border-none"
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de supprimer le cas.",
                variant: "destructive"
            });
        } finally {
            setIsDeleteModalOpen(false);
            setCaseToDelete(null);
        }
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

    const handleExport = () => {
        toast({
            title: "Exportation lancée",
            description: "Le rapport CSV est en cours de téléchargement.",
        });
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

    return (
        <Layout>
            <div className="space-y-8 max-w-7xl mx-auto">
                {/* Premium Floating Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 md:p-8 rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/5 shadow-2xl"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
                    <div className="relative z-10 w-full md:w-auto">
                        <h1 className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg leading-tight mb-2">
                            Gestion des Cas <span className="text-white text-lg md:text-2xl font-light block md:inline opacity-80 md:opacity-100 md:ml-2">- {user?.region || 'Région'}</span>
                        </h1>
                        <p className="text-slate-300 text-sm md:text-lg font-light">
                            Supervisez et gérez les signalements VBG en temps réel.
                        </p>
                    </div>
                    <div className="relative z-10 w-full md:w-auto">
                        <Button onClick={handleExport} className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/30 border border-white/10 transition-all hover:scale-105 px-6 py-2.5 h-auto">
                            <Download className="mr-2 h-4 w-4" /> Exporter par région
                        </Button>
                    </div>
                </motion.div>

                {/* Refined Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {[
                        { title: "TOTAL SIGNALEMENTS", value: stats.total, icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/10", trend: "+12%" },
                        { title: "EN ATTENTE", value: stats.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/10", trend: "+5%" },
                        { title: "DOSSIERS CLOS", value: stats.completed, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/10", trend: "+8%" },
                        { title: "SUIVI REQUIS", value: stats.followUp, icon: AlertCircle, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/10", trend: "Actif" }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className={`bg-slate-900/40 backdrop-blur-md border ${stat.border} hover:bg-slate-800/40 transition-all duration-300`}>
                                <CardContent className="p-4 md:p-6">
                                    <div className="flex justify-between items-start mb-2 md:mb-4">
                                        <p className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                                        <div className={`p-2 md:p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                            <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                                        <p className={`text-[10px] md:text-xs font-medium ${stat.color === 'text-emerald-400' ? 'text-emerald-400' : 'text-blue-400'} flex items-center gap-1`}>
                                            <span className="opacity-80">↗ {stat.trend}</span>
                                            <span className="text-slate-500 ml-1 font-normal">vs mois dernier</span>
                                        </p>
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
                    transition={{ delay: 0.4 }}
                    className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-slate-900/40"
                >
                    {/* Filters Bar */}
                    <div className="p-4 md:p-6 border-b border-white/5 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/[0.02]">
                        <div className="relative w-full lg:max-w-md group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                            <Input
                                placeholder="Rechercher (ID, Nom, Type...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 bg-slate-950/50 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all rounded-xl w-full"
                            />
                        </div>
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap w-full lg:w-auto gap-3">
                            {/* Year Filter */}
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-full sm:w-[100px] h-11 bg-slate-950/50 border-white/10 hover:bg-slate-900/60 rounded-xl">
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
                                <SelectTrigger className="w-full sm:w-[130px] h-11 bg-slate-950/50 border-white/10 hover:bg-slate-900/60 rounded-xl">
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
                                <SelectTrigger className="w-full sm:w-[90px] h-11 bg-slate-950/50 border-white/10 hover:bg-slate-900/60 rounded-xl">
                                    <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
                                    <SelectValue placeholder="Jour" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 h-[300px]">
                                    <SelectItem value="all">Jour</SelectItem>
                                    {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px] h-11 bg-slate-950/50 border-white/10 hover:bg-slate-900/60 rounded-xl col-span-2 sm:col-span-1">
                                    <div className="flex items-center">
                                        <Filter className="h-4 w-4 mr-2 text-slate-400" />
                                        <SelectValue placeholder="Filtrer" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="glass-card border-white/10 bg-slate-900/95 text-slate-200">
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="pending">En cours</SelectItem>
                                    <SelectItem value="completed">Terminé</SelectItem>
                                    <SelectItem value="follow-up">Suivi requis</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Data Display: Table for Desktop, Cards for Mobile */}
                    <div className="overflow-x-auto">
                        {/* Mobile Card View */}
                        <div className="block md:hidden space-y-3 p-4">
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
                                                    {/* Header: ID + Status */}
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

                                                    {/* Meta Info: Date & Agent */}
                                                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                                                        <div className="flex items-center">
                                                            <CalendarIcon className="w-3 h-3 mr-1.5 opacity-50 text-blue-400" />
                                                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <User className="w-3 h-3 mr-1.5 opacity-50 text-purple-400" />
                                                            <span className="truncate max-w-[100px]">
                                                                {c.agentName || (c.agentId ? `Agent ${c.agentId.slice(0, 4)}` : 'N/A')}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Actions Footer */}
                                                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                                        <span className="text-[10px] text-slate-600 font-medium">
                                                            {c.victimRegion || 'Région Inconnue'}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 border border-blue-500/10 rounded-lg">
                                                                        <Eye className="w-3 h-3 mr-1.5" /> Détails
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar glass-card bg-slate-900/95 border-white/10 text-white p-0">
                                                                    {/* Dialog content is huge, but we must include it or it will be missing. 
                                                                        To save space I will reference the implementation from the file view but 
                                                                        since I am replacing the block I must include it ALL. 
                                                                        I will copy the standard dialog content structure. */}
                                                                    <DialogHeader className="p-6 pb-2 border-b border-white/5 bg-slate-950/50">
                                                                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Détails du Cas #{(c.id || '').toString().slice(-6)}</DialogTitle>
                                                                        <DialogDescription className="text-slate-400">
                                                                            Informations complétes sur le signalement.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <div className="space-y-4">
                                                                            {/* Victim Information */}
                                                                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-blue-500/20 transition-colors">
                                                                                <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center"><User className="w-4 h-4 mr-2" /> Informations Victime</h3>
                                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                                                    <p className="col-span-2"><span className="text-slate-400">Nom:</span> <span className="text-white font-medium">{c.victimName || 'N/A'}</span></p>
                                                                                    <p><span className="text-slate-400">Âge:</span> {c.victimAge || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Genre:</span> {c.victimGender || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Région:</span> {c.victimRegion || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Commune:</span> {c.victimCommune || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Matrimonial:</span> {c.victimMaritalStatus || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Éducation:</span> {c.victimEducation || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Profession:</span> {c.victimProfession || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Ethnie:</span> {c.victimEthnicity || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Religion:</span> {c.victimReligion || 'N/A'}</p>
                                                                                    <p className="col-span-2"><span className="text-slate-400">Handicap:</span> {c.victimDisability || 'Non'}</p>
                                                                                </div>
                                                                            </div>

                                                                            {/* Incident Information */}
                                                                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-amber-500/20 transition-colors">
                                                                                <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center"><MapPin className="w-4 h-4 mr-2" /> Détails de l'Incident</h3>
                                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                                                    <p className="col-span-2"><span className="text-slate-400">Lieu:</span> <span className="text-white">{c.incidentLocation || 'N/A'}</span></p>
                                                                                    <p><span className="text-slate-400">Date:</span> {c.incidentDate ? new Date(c.incidentDate).toLocaleDateString() : 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Délai:</span> {(() => {
                                                                                        if (!c.incidentDate || !c.createdAt) return 'N/A';
                                                                                        const diff = new Date(c.createdAt) - new Date(c.incidentDate);
                                                                                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                                                                        return `${days} jours`;
                                                                                    })()}</p>
                                                                                </div>
                                                                            </div>

                                                                            {/* Perpetrator Information */}
                                                                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-red-500/20 transition-colors">
                                                                                <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Information Auteur</h3>
                                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                                                    <p className="col-span-2"><span className="text-slate-400">Nom:</span> <span className="text-white font-medium">{c.perpetratorName || 'Inconnu'}</span></p>
                                                                                    <p><span className="text-slate-400">Âge:</span> {c.perpetratorAge || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Genre:</span> {c.perpetratorGender || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Profession:</span> {c.perpetratorProfession || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Région:</span> {c.perpetratorRegion || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Commune:</span> {c.perpetratorCommune || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Classe Sociale:</span> {c.perpetratorSocialClass || 'N/A'}</p>
                                                                                    <p><span className="text-slate-400">Relation:</span> {c.relationshipToVictim || 'N/A'}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="space-y-4">
                                                                            {/* Services & Support */}
                                                                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-emerald-500/20 transition-colors">
                                                                                <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center"><HeartHandshake className="w-4 h-4 mr-2" /> Prise en Charge</h3>
                                                                                <div className="space-y-3 text-sm">
                                                                                    <div>
                                                                                        <p className="text-slate-400 mb-1">Services offerts:</p>
                                                                                        <div className="flex flex-wrap gap-2">
                                                                                            {Array.isArray(c.servicesProvided) ? c.servicesProvided.map((s, i) => (
                                                                                                <span key={i} className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-xs">
                                                                                                    {s}
                                                                                                </span>
                                                                                            )) : <span className="text-slate-500">Aucun</span>}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-slate-400 mb-1">Besoins identifiés:</p>
                                                                                        <p className="text-slate-300 bg-black/20 p-2 rounded-lg">{c.supportNeeds || 'N/A'}</p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-slate-400 mb-1">Référencements:</p>
                                                                                        <p className="text-slate-300 bg-black/20 p-2 rounded-lg">{c.referrals || 'N/A'}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Description */}
                                                                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-purple-500/20 transition-colors">
                                                                                <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center"><FileText className="w-4 h-4 mr-2" /> Description</h3>
                                                                                <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                                                                                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                                                        {c.violenceDescription || 'Aucune description disponible.'}
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            {/* Actions */}
                                                                            <div className="flex gap-3 pt-4">
                                                                                <Button onClick={() => handleExportSingleCase(c)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
                                                                                    <Download className="w-4 h-4 mr-2" /> Exporter PDF
                                                                                </Button>
                                                                                <Button variant="destructive" onClick={() => handleDeleteClick(c.id)} className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20">
                                                                                    <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <DialogFooter className="mr-6 mb-4">
                                                                        <DialogTrigger asChild>
                                                                            <Button variant="ghost">Fermer</Button>
                                                                        </DialogTrigger>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(c.id)}
                                                                className="h-7 w-7 p-0 text-slate-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center p-8 text-slate-500">Aucun cas trouvé.</div>
                                )}
                            </AnimatePresence>
                        </div>

                        <table className="hidden md:table w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-slate-950/30 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="p-5 font-semibold">ID</th>
                                    <th className="p-5 font-semibold">Victime</th>
                                    <th className="p-5 font-semibold">Type de Violence</th>
                                    <th className="p-5 font-semibold">Agent</th>
                                    <th className="p-5 font-semibold">Date</th>
                                    <th className="p-5 font-semibold">Statut</th>
                                    <th className="p-5 font-semibold text-right">Actions</th>
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
                                                transition={{ delay: index * 0.05 }}
                                                key={c.id}
                                                className="group hover:bg-white/[0.03] transition-colors"
                                            >
                                                <td className="p-5 text-sm font-mono text-blue-300/80 group-hover:text-blue-300">#{(c.id || '').toString().slice(-6)}</td>
                                                <td className="p-5">
                                                    <div className="font-medium text-white">Anonyme #{c.id}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{c.victimAge ? `${c.victimAge} ans` : 'Âge inconnu'}</div>
                                                </td>
                                                <td className="p-5">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-white/5">
                                                        {c.violenceType}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-sm text-slate-400">{c.agentName || (c.agentId ? `Agent ${c.agentId.slice(0, 4)}` : 'Non assigné')}</td>
                                                <td className="p-5 text-sm text-slate-400 flex items-center">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="w-3.5 h-3.5 opacity-50" />
                                                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    {getStatusBadge(c.status)}
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 data-[state=open]:bg-blue-500/20">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar glass-card bg-slate-900/95 border-white/10 text-white p-0">
                                                                <DialogHeader className="p-6 pb-2 border-b border-white/5 bg-slate-950/50">
                                                                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Détails du Cas #{(c.id || '').toString().slice(-6)}</DialogTitle>
                                                                    <DialogDescription className="text-slate-400">
                                                                        Informations complétes sur le signalement.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    <div className="space-y-4">
                                                                        {/* Victim Information */}
                                                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-blue-500/20 transition-colors">
                                                                            <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center"><User className="w-4 h-4 mr-2" /> Informations Victime</h3>
                                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                                                <p className="col-span-2"><span className="text-slate-400">Nom:</span> <span className="text-white font-medium">{c.victimName || 'N/A'}</span></p>
                                                                                <p><span className="text-slate-400">Âge:</span> {c.victimAge || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Genre:</span> {c.victimGender || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Région:</span> {c.victimRegion || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Commune:</span> {c.victimCommune || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Matrimonial:</span> {c.victimMaritalStatus || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Éducation:</span> {c.victimEducation || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Profession:</span> {c.victimProfession || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Ethnie:</span> {c.victimEthnicity || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Religion:</span> {c.victimReligion || 'N/A'}</p>
                                                                                <p className="col-span-2"><span className="text-slate-400">Handicap:</span> {c.victimDisability || 'Non'}</p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Incident Information (NEW) */}
                                                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-amber-500/20 transition-colors">
                                                                            <h3 className="text-lg font-semibold text-amber-300 mb-3 flex items-center"><MapPin className="w-4 h-4 mr-2" /> Détails de l'Incident</h3>
                                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                                                <p className="col-span-2"><span className="text-slate-400">Lieu:</span> <span className="text-white">{c.incidentLocation || 'N/A'}</span></p>
                                                                                <p><span className="text-slate-400">Date:</span> {c.incidentDate ? new Date(c.incidentDate).toLocaleDateString() : 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Délai Signalement:</span> {(() => {
                                                                                    if (!c.incidentDate || !c.createdAt) return 'N/A';
                                                                                    const diff = new Date(c.createdAt) - new Date(c.incidentDate);
                                                                                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                                                                    return `${days} jours`;
                                                                                })()}</p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Perpetrator Information */}
                                                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-red-500/20 transition-colors">
                                                                            <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> Information Auteur</h3>
                                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                                                <p className="col-span-2"><span className="text-slate-400">Nom:</span> <span className="text-white font-medium">{c.perpetratorName || 'Inconnu'}</span></p>
                                                                                <p><span className="text-slate-400">Âge:</span> {c.perpetratorAge || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Genre:</span> {c.perpetratorGender || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Profession:</span> {c.perpetratorProfession || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Région:</span> {c.perpetratorRegion || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Commune:</span> {c.perpetratorCommune || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Classe Sociale:</span> {c.perpetratorSocialClass || 'N/A'}</p>
                                                                                <p><span className="text-slate-400">Relation:</span> {c.relationshipToVictim || 'N/A'}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-4">
                                                                        {/* Status & Follow-up */}
                                                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-colors">
                                                                            <h3 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Statut & Suivi</h3>
                                                                            <div className="space-y-2 text-sm">
                                                                                <p><span className="text-slate-400">Statut:</span> {getStatusBadge(c.status)}</p>
                                                                                <p><span className="text-slate-400">Agent en charge:</span> {c.agentName || (c.agentId ? `Agent ${c.agentId}` : 'Non assigné')}</p>
                                                                                <p><span className="text-slate-400">Lieu de suivi:</span> {c.victimRegion || 'N/A'}{c.victimCommune ? ` - ${c.victimCommune}` : ''}</p>
                                                                                <p><span className="text-slate-400">Créé le:</span> {new Date(c.createdAt).toLocaleString()}</p>
                                                                            </div>
                                                                        </div>



                                                                        {/* Prises en charge */}
                                                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/20 transition-colors">
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
                                                                            <h3 className="text-lg font-semibold text-slate-300 mb-3">Description du fait</h3>
                                                                            <div className="p-3 rounded-lg bg-black/20">
                                                                                <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">{c.violenceDescription || "Aucune description fournie."}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <DialogFooter className="mr-8 mb-6 ml-6 flex justify-between items-center bg-slate-950/30 p-4 rounded-xl border border-white/5">
                                                                    <Button variant="ghost" className="text-slate-400 hover:text-white">Fermer</Button>
                                                                    <Button onClick={() => handleExportSingleCase(c)} variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                                                                        <Download className="mr-2 h-4 w-4" /> Exporter PDF
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <Button onClick={() => handleDeleteClick(c.id)} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/20">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="p-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FileText className="h-12 w-12 text-slate-700 mb-4" />
                                                    <p className="text-lg">Aucun cas trouvé</p>
                                                    <p className="text-sm">Essayez de modifier vos filtres ou effectuez une nouvelle recherche.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 text-sm text-slate-400 bg-slate-950/50">
                        <span className="text-center sm:text-left">
                            Affichage de {filteredCases.length > 0 ? startIndex + 1 : 0} à {Math.min(endIndex, filteredCases.length)} sur {filteredCases.length} cas
                        </span>
                        <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex-1 sm:flex-none text-xs h-8 border-white/10 bg-transparent text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50"
                            >
                                Précédent
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="flex-1 sm:flex-none text-xs h-8 border-white/10 bg-transparent text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-50"
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-white">Confirmer la suppression</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Êtes-vous sûr de vouloir supprimer ce cas ? Cette action est irréversible.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="border-white/10 hover:bg-white/5 text-slate-300">Annuler</Button>
                            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Supprimer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div >
        </Layout >
    );
};

export default RegionalCasesPage;
