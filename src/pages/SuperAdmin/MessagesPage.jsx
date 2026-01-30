import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import DashboardLayout from '@/components/Layout';
import { Loader2, Mail, Trash2, CheckCircle, Clock, Eye, AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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

const MessagesPage = () => {
    useAuth(); // For authentication guard
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [deleteId, setDeleteId] = useState(null);

    // Get token from localStorage
    const getToken = () => localStorage.getItem('token');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const data = await api.getMessages();
            // Sort by date desc (assuming id or createdAt)
            const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
            setMessages(sorted);
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Impossible de charger les messages.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleViewMessage = async (msg) => {
        setSelectedMessage(msg);
        setIsDetailOpen(true);
        if (msg.status === 'unread') {
            try {
                // Optimistic update
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
                await api.markMessageRead(msg.id);
            } catch (err) {
                console.error("Failed to mark read", err);
            }
        }
    };

    const handleDeleteMessage = (id, e) => {
        if (e) e.stopPropagation(); // prevent row click
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await api.deleteMessage(deleteId);
            setMessages(prev => prev.filter(m => m.id !== deleteId));
            toast({ title: "Message supprimé", className: "bg-green-600 text-white" });
            if (selectedMessage?.id === deleteId) setIsDetailOpen(false);
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de supprimer le message.", variant: "destructive" });
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Premium Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-white/5 shadow-2xl"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
                    <div className="relative z-10 w-full">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <Mail className="w-8 h-8 text-blue-400" />
                                </div>
                                <h1 className="text-3xl font-bold text-white">Messagerie (v2)</h1>
                            </div>
                            {messages.filter(m => m.status === 'unread').length > 0 && (
                                <Badge variant="secondary" className="self-start md:self-center bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 text-sm">
                                    {messages.filter(m => m.status === 'unread').length} nouveaux
                                </Badge>
                            )}
                        </div>
                        <p className="text-slate-400 mt-2 text-lg font-light max-w-2xl">
                            Gestion centralisée des messages reçus via le formulaire de contact.
                        </p>
                    </div>
                </motion.div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-900/40 rounded-xl border border-white/5">
                            <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            Aucun message pour le moment.
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                onClick={() => handleViewMessage(msg)}
                                className={`relative p-5 rounded-2xl border transition-all active:scale-[0.98] ${msg.status === 'unread'
                                    ? 'bg-blue-900/20 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                    : 'bg-slate-900/60 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.status === 'unread' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                                            <span className="font-bold text-lg">{msg.firstName.charAt(0)}{msg.lastName.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold text-base ${msg.status === 'unread' ? 'text-white' : 'text-slate-300'}`}>
                                                {msg.firstName} {msg.lastName}
                                            </h3>
                                            <p className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    {msg.status === 'unread' && (
                                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50" />
                                    )}
                                </div>

                                <p className={`text-sm line-clamp-2 mb-4 ${msg.status === 'unread' ? 'text-slate-200' : 'text-slate-400'}`}>
                                    {msg.message}
                                </p>

                                <div className="flex justify-end pt-3 border-t border-white/5">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 -mr-2"
                                        onClick={(e) => handleDeleteMessage(msg.id, e)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <Card className="hidden md:block glass-card border-white/10 bg-slate-900/40 shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-slate-900/50">
                        <CardTitle className="text-white">Boîte de Réception</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="h-40 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                Aucun message pour le moment.
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-950/50">
                                        <TableRow className="border-white/10 hover:bg-transparent">
                                            <TableHead className="text-slate-300 w-[50px]">État</TableHead>
                                            <TableHead className="text-slate-300">Expéditeur</TableHead>
                                            <TableHead className="text-slate-300">Sujet / Message</TableHead>
                                            <TableHead className="text-slate-300">Date</TableHead>
                                            <TableHead className="text-right text-slate-300">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {messages.map((msg) => (
                                            <TableRow
                                                key={msg.id}
                                                className={`cursor-pointer transition-colors border-white/5 ${msg.status === 'unread' ? 'bg-blue-500/5 hover:bg-blue-500/10' : 'hover:bg-white/5'}`}
                                                onClick={() => handleViewMessage(msg)}
                                            >
                                                <TableCell>
                                                    {msg.status === 'unread' ? (
                                                        <div className="w-2 h-2 rounded-full bg-blue-500 mx-auto ring-4 ring-blue-500/20" title="Non lu" />
                                                    ) : (
                                                        <div className="w-2 h-2 rounded-full bg-slate-600 mx-auto" title="Lu" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-200">
                                                    <div>{msg.firstName} {msg.lastName}</div>
                                                    <div className="text-xs text-slate-500">{msg.email}</div>
                                                </TableCell>
                                                <TableCell className="text-slate-300 max-w-[300px]">
                                                    <div className="truncate selection:bg-blue-500/30">{msg.message}</div>
                                                </TableCell>
                                                <TableCell className="text-slate-400 text-sm whitespace-nowrap">
                                                    {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                        onClick={(e) => handleDeleteMessage(msg.id, e)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Message Detail Modal */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <Mail className="w-5 h-5 text-blue-400" /> Détails du Message
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Reçu le {selectedMessage && new Date(selectedMessage.createdAt).toLocaleString()}
                            </DialogDescription>
                        </DialogHeader>

                        {selectedMessage && (
                            <div className="space-y-6 mt-4">
                                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-lg border border-white/5">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">De</p>
                                        <p className="font-semibold text-white">{selectedMessage.firstName} {selectedMessage.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">Email</p>
                                        <p className="text-blue-400 hover:underline cursor-pointer" onClick={() => window.location.href = `mailto:${selectedMessage.email}`}>{selectedMessage.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">Message</p>
                                    <div className="p-4 bg-slate-950 rounded-lg border border-white/10 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                        {selectedMessage.message}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => setIsDetailOpen(false)}>Fermer</Button>
                                    <Button
                                        variant="destructive"
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        onClick={(e) => { handleDeleteMessage(selectedMessage.id, e); }}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
                {/* Confirmation Dialog */}
                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                                Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.
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
        </DashboardLayout>
    );
};

export default MessagesPage;
