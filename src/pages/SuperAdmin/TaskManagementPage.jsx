import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Calendar, Filter, Trash2, Edit } from 'lucide-react';
import TaskFormModal from '@/components/calendar/TaskFormModal';
import { toast } from '@/components/ui/use-toast';
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

const TaskManagementPage = () => {
    const { user } = useAuth();
    const { tasks, addTask, updateTask, deleteTask, users, loading } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const initialFormData = {
        title: '', description: '', date: '', time: '', type: 'other',
        priority: 'medium', assignedTo: '', participants: [], location: '', meetingLink: '', relatedCaseId: ''
    };
    const [formData, setFormData] = useState(initialFormData);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, searchTerm, statusFilter, priorityFilter]);

    const handleCreateTask = () => {
        setSelectedTask(null);
        setFormData(initialFormData);
        setShowTaskForm(true);
    };

    const handleEditTask = (task) => {
        setSelectedTask(task);
        setFormData({
            ...task,
            participants: task.participants || []
        });
        setShowTaskForm(true);
    };

    const handleDeleteTask = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await deleteTask(deleteId);
            toast({ title: "Tâche supprimée" });
            setDeleteId(null);
        }
    };

    const handleSubmitTask = async (taskData) => {
        const fullTaskData = {
            ...taskData,
            createdBy: selectedTask ? selectedTask.createdBy : user.id,
            status: selectedTask ? selectedTask.status : 'pending' // Default to pending for new
        };

        if (selectedTask) {
            await updateTask(selectedTask.id, fullTaskData);
            toast({ title: "Tâche mise à jour" });
        } else {
            await addTask(fullTaskData);
            toast({ title: "Tâche créée" });
        }
        setShowTaskForm(false);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Terminée</Badge>;
            case 'cancelled': return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Annulée</Badge>;
            default: return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">En cours</Badge>;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high': return <Badge variant="outline" className="text-red-400 border-red-400">Haute</Badge>;
            case 'medium': return <Badge variant="outline" className="text-yellow-400 border-yellow-400">Moyenne</Badge>;
            case 'low': return <Badge variant="outline" className="text-green-400 border-green-400">Faible</Badge>;
            default: return <Badge variant="outline" className="text-slate-400 border-slate-400">Normale</Badge>;
        }
    };

    // Helper to get user name
    const getUserName = (id) => {
        const u = users.find(user => user.id === id);
        return u ? u.name : 'N/A';
    };

    return (
        <Layout>
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Premium Header */}
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/5 shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
                    <div className="relative z-10">
                        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
                            Gestion des Tâches
                        </h1>
                        <p className="text-slate-300 mt-2 text-lg font-light">
                            Supervision globale des tâches et assignations.
                        </p>
                    </div>
                    <Button onClick={handleCreateTask} className="relative z-10 w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-900/20 border-0">
                        <Plus className="mr-2 h-4 w-4" /> Nouvelle Tâche
                    </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Rechercher une tâche..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 h-10 rounded-xl focus:ring-purple-500/50"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-slate-900/50 border-white/10 text-white h-10 rounded-xl">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="pending">En cours</SelectItem>
                            <SelectItem value="completed">Terminée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="bg-slate-900/50 border-white/10 text-white h-10 rounded-xl">
                            <SelectValue placeholder="Priorité" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                            <SelectItem value="all">Toutes priorités</SelectItem>
                            <SelectItem value="high">Haute</SelectItem>
                            <SelectItem value="medium">Moyenne</SelectItem>
                            <SelectItem value="low">Faible</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Chargement...</div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">Aucune tâche trouvée.</div>
                    ) : (
                        filteredTasks.map((task) => (
                            <div key={task.id} className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 rounded-xl space-y-3 shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">{task.title || 'Sans titre'}</h3>
                                        <p className="text-slate-400 text-sm flex items-center mt-1">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {task.date ? new Date(task.date).toLocaleDateString() : 'Date inconnue'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)} className="h-8 w-8 text-blue-400 bg-blue-400/10 rounded-full">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="h-8 w-8 text-red-400 bg-red-400/10 rounded-full">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                    {getPriorityBadge(task.priority)}
                                    {getStatusBadge(task.status)}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="text-sm">
                                        <span className="text-slate-500">Assigné à: </span>
                                        <span className="text-slate-300 font-medium">
                                            {task.assignedTo ? getUserName(task.assignedTo) : <span className="italic">Non assigné</span>}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <Card className="hidden md:block bg-slate-900/50 border-white/10 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-white/5 bg-white/5">
                                    <TableHead className="text-slate-400">Titre</TableHead>
                                    <TableHead className="text-slate-400">Date</TableHead>
                                    <TableHead className="text-slate-400">Assigné à</TableHead>
                                    <TableHead className="text-slate-400">Priorité</TableHead>
                                    <TableHead className="text-slate-400">Statut</TableHead>
                                    <TableHead className="text-right text-slate-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">Chargement...</TableCell>
                                    </TableRow>
                                ) : filteredTasks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">Aucune tâche trouvée.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTasks.map((task) => (
                                        <TableRow key={task.id} className="border-white/10 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-medium text-white">{task.title || 'Sans titre'}</TableCell>
                                            <TableCell className="text-slate-300">
                                                {task.date ? new Date(task.date).toLocaleDateString() : 'Date inconnue'}
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                {task.assignedTo ? getUserName(task.assignedTo) : <span className="text-slate-500 italic">Non assigné</span>}
                                            </TableCell>
                                            <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                                            <TableCell>{getStatusBadge(task.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {showTaskForm && (
                    <TaskFormModal
                        isOpen={showTaskForm}
                        onClose={() => setShowTaskForm(false)}
                        onSubmit={handleSubmitTask}
                        taskData={formData}
                        setTaskData={setFormData}
                        selectedTask={selectedTask}
                        currentUser={user}
                        allUsers={users}
                    />
                )}

                {/* Confirmation Dialog */}
                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                                Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Layout>
    );
};


export default TaskManagementPage;
