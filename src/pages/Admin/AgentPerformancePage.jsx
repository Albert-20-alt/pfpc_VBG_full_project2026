import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    User,
    TrendingUp,
    FileText,
    CheckCircle2,
    Clock,
    Mail,
    MapPin,
    MoreVertical,
    Award,
    ChevronLeft,
    ChevronRight,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    Plus,
    X,
    Phone
} from 'lucide-react';
import { api } from '@/api';
import { toast } from '@/components/ui/use-toast';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import UserProfileDialog from '@/components/UserProfileDialog';

const AgentPerformancePage = () => {
    const { user } = useAuth();
    const { users, cases, refreshData } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Profile Dialog State
    const [selectedProfileUser, setSelectedProfileUser] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [newAgent, setNewAgent] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        department: '',
        commune: ''
    });

    const handleCreateAgent = async (e) => {
        e.preventDefault();
        try {
            await api.createUser({
                ...newAgent,
                role: 'agent',
                region: user.role === 'admin' ? user.region : '' // Admin forces region, super-admin would need selection (simplified here)
            });
            toast({ title: "Succès", description: "Agent créé avec succès." });
            setIsCreateModalOpen(false);
            setNewAgent({ name: '', username: '', email: '', phone: '', password: '', department: '', commune: '' });
            refreshData(); // Refresh list
        } catch (error) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        }
    };

    // 1. Filter Agents based on the current Admin's region
    const regionalAgents = useMemo(() => {
        if (!users) return [];
        return users.filter(u =>
            u.role === 'agent' &&
            u.status === 'active' &&
            (user.role === 'super-admin' || u.region === user.region)
        );
    }, [users, user]);

    // 2. Calculate statistics for each agent
    const agentStats = useMemo(() => {
        return regionalAgents.map(agent => {
            const agentCases = cases.filter(c =>
                String(c.agentId) === String(agent.id) ||
                String(c.createdBy) === String(agent.id)
            );

            const totalCases = agentCases.length;
            const completedCases = agentCases.filter(c => c.status === 'completed').length;
            const pendingCases = agentCases.filter(c => c.status === 'pending').length;

            const resolutionRate = totalCases > 0 ? (completedCases / totalCases) * 100 : 0;
            let score = 0;
            if (totalCases > 0) score += 50;
            if (totalCases > 5) score += 20;
            if (resolutionRate > 50) score += 30;

            let status = 'Standard';
            if (score >= 90) status = 'Excellent';
            else if (score >= 70) status = 'Bon';

            return {
                ...agent,
                totalCases,
                completedCases,
                pendingCases,
                resolutionRate: resolutionRate.toFixed(1),
                performanceStatus: status,
                lastActive: agentCases.length > 0
                    ? new Date(Math.max(...agentCases.map(c => new Date(c.updatedAt || c.submittedAt || c.createdAt).getTime()))).toLocaleDateString()
                    : 'Jamais'
            };
        });
    }, [regionalAgents, cases]);

    // 3. Analytics Data Preparation
    const analyticsData = useMemo(() => {
        const barData = agentStats.map(agent => ({
            name: agent.name.split(' ')[0], // First name for brevity
            Total: agent.totalCases,
            Résolus: agent.completedCases
        }));

        const totalPending = agentStats.reduce((acc, curr) => acc + curr.pendingCases, 0);
        const totalCompleted = agentStats.reduce((acc, curr) => acc + curr.completedCases, 0);

        const pieData = [
            { name: 'En attente', value: totalPending },
            { name: 'Terminés', value: totalCompleted }
        ].filter(d => d.value > 0);

        return { barData, pieData };
    }, [agentStats]);

    // 4. Pagination & Filtering
    const filteredAgents = useMemo(() => {
        return agentStats.filter(agent =>
            (agent.name && agent.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (agent.email && agent.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [agentStats, searchTerm]);

    const paginatedAgents = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAgents.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAgents, currentPage]);

    const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
    const COLORS = ['#F59E0B', '#10B981']; // Yellow (Pending), Green (Completed)

    return (
        <Layout>
            <div className="space-y-8 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-4 sm:p-8 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/5 shadow-2xl"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
                    <div className="relative z-10 w-full lg:w-auto">
                        <h1 className="text-3xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
                            Performance des Agents
                        </h1>
                        <p className="text-slate-300 mt-2 sm:mt-3 text-sm sm:text-lg font-light max-w-2xl">
                            Visualisez en temps réel l'activité, l'efficacité et l'impact de votre équipe sur le terrain <span className="font-semibold text-white">{user.region ? `(${user.region})` : ''}</span>.
                        </p>
                    </div>

                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 px-4 py-4 sm:px-6 sm:py-6 text-base sm:text-lg rounded-xl border border-white/10 group">
                                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                                Nouvel Agent
                            </Button>
                        </DialogTrigger>
                        {/* Dialog Content remains same... */}
                        <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Créer un nouvel agent</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Ajoutez un nouvel agent à votre équipe {user.region ? `(${user.region})` : ''}.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateAgent} className="space-y-4 max-h-[80vh] overflow-y-auto pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-slate-300">Nom complet</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: Jean Ndiaye"
                                        value={newAgent.name}
                                        onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                                        className="bg-slate-800/50 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-slate-300">Identifiant (Nom d'utilisateur)</Label>
                                    <Input
                                        id="username"
                                        placeholder="Ex: jean_ndiaye"
                                        value={newAgent.username}
                                        onChange={(e) => setNewAgent({ ...newAgent, username: e.target.value })}
                                        className="bg-slate-800/50 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="jean@pfpc.com"
                                        value={newAgent.email}
                                        onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                                        className="bg-slate-800/50 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-slate-300">Téléphone</Label>
                                    <Input
                                        id="phone"
                                        placeholder="77 000 00 00"
                                        value={newAgent.phone}
                                        onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                                        className="bg-slate-800/50 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-300">Mot de passe</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="********"
                                        value={newAgent.password}
                                        onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                                        className="bg-slate-800/50 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="department" className="text-slate-300">Département</Label>
                                        <Input
                                            id="department"
                                            placeholder="Ex: Bignona"
                                            value={newAgent.department}
                                            onChange={(e) => setNewAgent({ ...newAgent, department: e.target.value })}
                                            className="bg-slate-800/50 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="commune" className="text-slate-300">Commune</Label>
                                        <Input
                                            id="commune"
                                            placeholder="Ex: Tenghory"
                                            value={newAgent.commune}
                                            onChange={(e) => setNewAgent({ ...newAgent, commune: e.target.value })}
                                            className="bg-slate-800/50 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="pt-6">
                                    <Button type="button" variant="ghost" className="hover:bg-white/5 text-slate-300" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20">Créer l'agent</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </motion.div>

                {/* Analytics Section with Premium Cards */}
                {agentStats.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="glass-card h-full border-t border-t-blue-500/20 bg-gradient-to-br from-slate-900/60 to-slate-900/40">
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="flex items-center text-lg sm:text-xl font-bold text-slate-100">
                                        <div className="p-1.5 sm:p-2 mr-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <BarChartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                                        </div>
                                        Volume de Cas par Agent
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px] sm:h-[350px] p-2 sm:p-6">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analyticsData.barData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="resolvedColor" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                                            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                                                itemStyle={{ color: '#fff' }}
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                                            <Bar dataKey="Total" fill="url(#totalColor)" radius={[6, 6, 0, 0]} barSize={24} />
                                            <Bar dataKey="Résolus" fill="url(#resolvedColor)" radius={[6, 6, 0, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass-card h-full border-t border-t-purple-500/20 bg-gradient-to-br from-slate-900/60 to-slate-900/40">
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="flex items-center text-lg sm:text-xl font-bold text-slate-100">
                                        <div className="p-1.5 sm:p-2 mr-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                            <PieChartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                                        </div>
                                        Aperçu Global
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px] sm:h-[350px] flex items-center justify-center p-2 sm:p-6">
                                    {analyticsData.pieData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analyticsData.pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {analyticsData.pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <PieChartIcon className="h-12 w-12 sm:h-16 sm:w-16 mb-4 opacity-20" />
                                            <p>Aucune donnée disponible</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}

                {/* Filters & Grid */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative w-full max-w-md group"
                    >
                        <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-lg group-hover:bg-blue-500/20 transition-all duration-300" />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                        <Input
                            placeholder="Rechercher un agent..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-11 sm:pl-12 bg-slate-900/80 backdrop-blur-xl border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 h-11 sm:h-12 rounded-xl text-sm sm:text-lg shadow-xl"
                        />
                    </motion.div>

                    <div className="text-slate-400 text-sm font-medium px-4 py-2 rounded-full bg-white/5 border border-white/5">
                        {filteredAgents.length} Agents trouvés
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedAgents.length > 0 ? (
                        paginatedAgents.map((agent, index) => (
                            <div
                                key={agent.id}
                                className="relative transition-all duration-300 hover:translate-y-[-5px]"
                            >
                                <Card className="glass-card group overflow-hidden border border-white/10 hover:border-blue-500/30">
                                    <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="text-slate-500 hover:text-white cursor-pointer" />
                                    </div>
                                    <CardHeader className="flex flex-row items-center space-x-4 pb-2 relative z-10">
                                        <div className="relative cursor-pointer" onClick={() => { setSelectedProfileUser(agent); setIsProfileOpen(true); }}>
                                            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-md group-hover:blur-lg transition-all" />
                                            <Avatar className="h-16 w-16 border-2 border-slate-200/20 group-hover:border-blue-500 transition-colors shadow-xl">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.email || 'default'}`} />
                                                <AvatarFallback className="bg-slate-800 text-xl font-bold">{(agent.name || '?').charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-slate-900 ${agent.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`} />
                                        </div>
                                        <div className="flex-1 cursor-pointer" onClick={() => { setSelectedProfileUser(agent); setIsProfileOpen(true); }}>
                                            <CardTitle className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                                                {agent.name || 'Nom Inconnu'}
                                            </CardTitle>
                                            <CardDescription className="text-slate-400 flex items-center text-xs mt-1.5 truncate">
                                                <Mail className="h-3 w-3 mr-1.5 text-slate-500" /> {agent.email || 'Pas d\'email'}
                                            </CardDescription>
                                            {agent.phone && (
                                                <CardDescription className="text-slate-400 flex items-center text-xs mt-0.5">
                                                    <Phone className="h-3 w-3 mr-1.5 text-slate-500" /> {agent.phone}
                                                </CardDescription>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="relative z-10 pt-4">
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-gradient-to-br from-white/5 to-white/0 p-4 rounded-xl border border-white/5 text-center group-hover:bg-white/10 transition-colors">
                                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Cas</p>
                                                <p className="text-3xl font-extrabold text-white">{agent.totalCases || 0}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/0 p-4 rounded-xl border border-emerald-500/10 text-center group-hover:border-emerald-500/20 transition-colors">
                                                <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Résolution</p>
                                                <p className="text-3xl font-extrabold text-emerald-400">{agent.resolutionRate || 0}%</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 bg-slate-950/30 p-4 rounded-xl border border-white/5">
                                            <div className="flex justify-between text-sm items-center">
                                                <span className="text-slate-400 flex items-center"><Clock className="h-4 w-4 mr-2 text-yellow-500/80" /> En attente</span>
                                                <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded text-xs">{agent.pendingCases || 0}</span>
                                            </div>
                                            <div className="flex justify-between text-sm items-center">
                                                <span className="text-slate-400 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500/80" /> Terminés</span>
                                                <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded text-xs">{agent.completedCases || 0}</span>
                                            </div>
                                            <div className="w-full h-px bg-white/5 my-2" />
                                            <div className="flex justify-between text-xs pt-1">
                                                <span className="text-slate-500 flex items-center"><TrendingUp className="h-3 w-3 mr-2" /> Dernière activité</span>
                                                <span className="text-slate-400">{agent.lastActive || 'Jamais'}</span>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between">
                                            <div className={`flex items-center px-3 py-1.5 rounded-full border ${agent.performanceStatus === 'Excellent' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                                agent.performanceStatus === 'Bon' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                                    'bg-slate-700/30 border-slate-600 text-slate-400'
                                                }`}>
                                                <Award className="h-4 w-4 mr-2" />
                                                <span className="text-xs font-bold uppercase tracking-wide">{agent.performanceStatus || 'Standard'}</span>
                                            </div>
                                            <span className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                                {agent.commune || agent.department || agent.region || 'Zone Inconnue'}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center p-8 border border-dashed border-white/10 rounded-3xl bg-white/5">
                            <div className="bg-slate-900/50 p-6 rounded-full mb-4 ring-1 ring-white/10">
                                <User className="h-16 w-16 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Aucun agent trouvé</h3>
                            <p className="text-slate-400 max-w-sm mx-auto">
                                Aucun résultat pour "{searchTerm}". Essayez de modifier vos critères de recherche ou ajoutez un nouvel agent.
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-8 pb-12">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="bg-slate-900/50 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm text-slate-400 px-4">
                            Page <span className="text-white font-bold">{currentPage}</span> sur <span className="text-white font-bold">{totalPages}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="bg-slate-900/50 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}

            </div>

            <UserProfileDialog
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={selectedProfileUser}
            />
        </Layout>
    );
};

export default AgentPerformancePage;
