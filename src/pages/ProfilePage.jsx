import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { User, Mail, Phone, MapPin, Shield, Key, Loader2, Save, Eye, EyeOff, Camera } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Generate initials from user name (e.g., "Agent Dakar" -> "AD")
const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const ProfilePage = () => {
    const { user, login } = useAuth(); // We might need to update the auth context if user changes name/email
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        department: '',
        commune: '',
        password: '',
        profilePicture: ''
    });

    // Read-only fields
    const [readOnlyData, setReadOnlyData] = useState({
        role: '',
        region: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // We use /me to ensure we get the latest data from DB
            // Assuming api.getMe() or similar exists, otherwise we fetch by ID if we trust local user.id
            // Let's rely on api.getUsers() filtered or just fetch /me via direct fetch if api.getMe missing.
            // Actually users.js has router.get('/me'...)

            // We use /me to ensure we get the latest data from DB
            const data = await api.getMe();

            setFormData({
                name: data.name || '',
                username: data.username || '',
                email: data.email || '',
                phone: data.phone || '',
                department: data.department || '',
                commune: data.commune || '',
                password: '',
                profilePicture: data.profilePicture || ''
            });

            setReadOnlyData({
                role: data.role,
                region: data.region
            });

            setFetching(false);

            // Update auth context if needed (optional but good practice to keep context in sync)
            if (login && typeof login === 'function') {
                // We don't have the token here to pass to login, but usually login expects full user obj + token or just user? 
                // Looking at AuthContext, login takes userData and saves it. 
                // We should probably preserve the token.
                const token = localStorage.getItem('token');
                // We can just update the user part of context without re-login or requiring token if we had a setUser method.
                // Since we don't, we can skip or implement a "refreshUser" in context later.
                // For now, let's just rely on the component state.
            }

        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Impossible de charger les informations du profil.", variant: "destructive" });
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // We need to call the PUT /users/:id endpoint
            // api.updateUser might exist, let's verify or use fetch directly
            if (!user?.id) throw new Error("ID utilisateur manquant");

            // Prepare payload - remove empty password to avoid validation issues
            const payload = { ...formData };
            if (!payload.password) {
                delete payload.password;
            }
            // Ensure empty strings are handled if needed, but password is the critical one

            await api.updateUser(user.id, payload);

            toast({
                title: "Succès",
                description: "Votre profil a été mis à jour avec succès.",
                className: "bg-emerald-500 text-white border-none"
            });

            // Clear password field after success
            setFormData(prev => ({ ...prev, password: '' }));

        } catch (error) {
            console.error(error);
            toast({
                title: "Erreur",
                description: error.message || "Échec de la mise à jour du profil.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Erreur",
                description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
                variant: "destructive"
            });
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "Erreur",
                description: "L'image ne doit pas dépasser 5MB",
                variant: "destructive"
            });
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload immediately
        handleAvatarUpload(file);
    };

    const handleAvatarUpload = async (file) => {
        setUploadingAvatar(true);

        try {
            // Upload file first
            const formData = new FormData();
            formData.append('file', file);

            const uploadResult = await api.uploadFile(formData);

            // Update user profile with new avatar URL
            await api.updateUser(user.id, { profilePicture: uploadResult.url });

            // Refresh profile to get updated data
            await fetchProfile();

            toast({
                title: "Succès",
                description: "Photo de profil mise à jour avec succès",
                className: "bg-emerald-500 text-white border-none"
            });

            setAvatarPreview(null);
        } catch (error) {
            console.error(error);
            toast({
                title: "Erreur",
                description: error.message || "Échec du téléchargement de l'image",
                variant: "destructive"
            });
            setAvatarPreview(null);
        } finally {
            setUploadingAvatar(false);
        }
    };

    if (fetching) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8 p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex flex-col items-center justify-between p-6 sm:p-8 rounded-3xl overflow-hidden bg-[#0f172a] border border-white/5 shadow-2xl gap-6 sm:gap-0 sm:flex-row"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarSelect}
                                disabled={uploadingAvatar}
                            />
                            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 shadow-xl">
                                <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden relative">
                                    {uploadingAvatar || avatarPreview ? (
                                        <>
                                            {avatarPreview && (
                                                <img
                                                    src={avatarPreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                            {uploadingAvatar && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                </div>
                                            )}
                                        </>
                                    ) : formData.profilePicture ? (
                                        <img
                                            src={`${import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '')}${formData.profilePicture}`}
                                            alt={formData.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-2xl sm:text-3xl font-bold text-white">{getInitials(formData.name)}</span>
                                        </div>
                                    )}
                                    {/* Hover overlay */}
                                    {!uploadingAvatar && (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera className="h-6 w-6 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{formData.name}</h1>
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                                    {readOnlyData.role === 'super-admin' ? 'Super Admin' : readOnlyData.role}
                                </span>
                                {readOnlyData.region && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        {readOnlyData.region}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid gap-6">
                    <Card className="bg-slate-900/50 border-white/5 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-xl text-white">Informations Personnelles</CardTitle>
                            <CardDescription className="text-slate-400">Modifier vos informations de connexion et de contact.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-slate-300">Nom complet</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="pl-10 bg-black/20 border-white/10 text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-slate-300">Identifiant</Label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="pl-10 bg-black/20 border-white/10 text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-slate-300">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="pl-10 bg-black/20 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="region" className="text-slate-300">Région</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="region"
                                                value={readOnlyData.region || ''}
                                                readOnly
                                                className="pl-10 bg-black/40 border-white/10 text-slate-400 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-slate-300">Téléphone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="pl-10 bg-black/20 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="department" className="text-slate-300">Département</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="pl-10 bg-black/20 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="commune" className="text-slate-300">Commune</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="commune"
                                                value={formData.commune}
                                                onChange={handleChange}
                                                className="pl-10 bg-black/20 border-white/10 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <div className="space-y-2 max-w-md">
                                        <Label htmlFor="password" className="text-slate-300">Nouveau mot de passe <span className="text-slate-500 text-xs font-normal">(Laisser vide pour conserver)</span></Label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 bg-black/20 border-white/10 text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-white transition-colors z-10 cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-w-[150px]">
                                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Enregistrer
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;
