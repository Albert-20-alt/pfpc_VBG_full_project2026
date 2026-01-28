import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, User, Shield, CheckCircle2, AlertCircle, Phone, Calendar, Camera, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/api';
import { toast } from '@/components/ui/use-toast';

const UserProfileDialog = ({ isOpen, onClose, user, caseCount, onUpdate }) => {
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload File
            const uploadRes = await api.uploadFile(formData);
            const fileUrl = uploadRes.url;

            // 2. Update User Profile
            await api.updateUser(user.id, { profilePicture: fileUrl });

            toast({
                title: "Succès",
                description: "Photo de profil mise à jour.",
                className: "bg-green-600 text-white"
            });

            if (onUpdate) onUpdate(); // Refresh user data in parent
        } catch (error) {
            console.error(error);
            toast({
                title: "Erreur",
                description: "Échec de la mise à jour de la photo.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemovePhoto = async () => {
        if (!confirm("Voulez-vous vraiment supprimer votre photo de profil ?")) return;

        setLoading(true);
        try {
            await api.updateUser(user.id, { profilePicture: null }); // Send null to reset
            toast({
                title: "Succès",
                description: "Photo de profil supprimée.",
                className: "bg-green-600 text-white"
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            toast({
                title: "Erreur",
                description: "Impossible de supprimer la photo.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'super-admin': return 'Super Admin';
            case 'admin': return 'Administrateur';
            case 'agent': return 'Agent de terrain';
            default: return role;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'super-admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'admin': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'agent': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Profil Utilisateur</DialogTitle>
                    <DialogDescription className="text-slate-400">Détails et informations du compte.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center py-6 border-b border-white/5 space-y-4">
                    <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-slate-800 shadow-xl">
                            <AvatarImage src={user.profilePicture ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profilePicture}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} className="object-cover" />
                            <AvatarFallback className="text-2xl bg-slate-800">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>

                        {/* Edit Overlay */}
                        <label
                            htmlFor="avatar-upload"
                            className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <Camera className="w-8 h-8 text-white" />
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={loading}
                        />

                        {/* Remove Button */}
                        {user.profilePicture && (
                            <button
                                onClick={handleRemovePhoto}
                                disabled={loading}
                                className="absolute -bottom-2 -right-2 p-1.5 bg-red-500 rounded-full text-white shadow-lg hover:bg-red-600 transition-colors"
                                title="Supprimer la photo"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}

                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full z-10">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                        <div className="flex gap-2 mt-2 justify-center">
                            <Badge variant="outline" className={`${getRoleColor(user.role)} capitalize`}>
                                {getRoleLabel(user.role)}
                            </Badge>
                            <Badge variant="outline" className={user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}>
                                {user.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
                        <Mail className="h-5 w-5 text-slate-400" />
                        <div>
                            <p className="text-sm font-medium text-slate-400">Email</p>
                            <p className="text-white">{user.email}</p>
                        </div>
                    </div>

                    {user.phone && (
                        <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
                            <Phone className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="text-sm font-medium text-slate-400">Téléphone</p>
                                <p className="text-white">{user.phone}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-[24px_1fr] gap-3 items-start">
                        <MapPin className="h-5 w-5 text-slate-400 mt-1" />
                        <div>
                            <p className="text-sm font-medium text-slate-400">Localisation</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                <div>
                                    <span className="text-xs text-slate-500">Région</span>
                                    <p className="text-white text-sm">{user.region || '—'}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500">Département</span>
                                    <p className="text-white text-sm">{user.department || '—'}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-xs text-slate-500">Commune</span>
                                    <p className="text-white text-sm">{user.commune || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
                        <Shield className="h-5 w-5 text-slate-400" />
                        <div>
                            <p className="text-sm font-medium text-slate-400">Statistiques</p>
                            <p className="text-white flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {caseCount || 0} Cas enregistrés
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-[24px_1fr] gap-3 items-center">
                        <Calendar className="h-5 w-5 text-slate-400" />
                        <div>
                            <p className="text-sm font-medium text-slate-400">Membre depuis</p>
                            <p className="text-white text-sm">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Optional: Add Stats Section if we pass in stats prop later */}

            </DialogContent>
        </Dialog>
    );
};

export default UserProfileDialog;
