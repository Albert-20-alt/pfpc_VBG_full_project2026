import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext'; // Added import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import {
  Plus, Search, Filter, Edit, Trash2,
  Shield, User, UserCheck, UserX, Mail, MapPin, Key,
  MoreVertical, CheckCircle2, AlertCircle, Phone, Eye, EyeOff
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

import UserProfileDialog from '@/components/UserProfileDialog';

const UsersPage = () => {
  const { user: currentUser } = useAuth(); // Added hook
  const { users = [], cases = [], addUser, updateUser, deleteUser } = useData();

  // ... (lines 40-720)

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Profile Dialog State
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Password Change Dialog State
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    action: null
  });

  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: '',
    region: '',
    department: '',
    commune: '',
    status: 'active'
  });

  const [showPassword, setShowPassword] = useState(false);

  const senegalRegions = [
    'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 'Fatick',
    'Kaolack', 'Kolda', 'Ziguinchor', 'Tambacounda', 'Kaffrine',
    'Kédougou', 'Matam', 'Sédhiou'
  ];

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    if (!user) return false;
    const term = searchTerm.toLowerCase();
    const nameMatch = user.name ? user.name.toLowerCase().includes(term) : false;
    const emailMatch = user.email ? user.email.toLowerCase().includes(term) : false;
    const usernameMatch = user.username ? user.username.toLowerCase().includes(term) : false;

    const matchesSearch = nameMatch || emailMatch || usernameMatch;
    const matchesRole = filterRole === 'all' || user.role === filterRole;

    // Regional Admin Filter
    const matchesRegion = currentUser?.role === 'admin'
      ? user.region === currentUser.region
      : true;

    return matchesSearch && matchesRole && matchesRegion;
  });

  // Calculate Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        const { password, ...restOfData } = formData; // Don't update password on edit unless explicitly changed
        const dataToUpdate = password ? formData : restOfData;
        await updateUser(editingUser.id, dataToUpdate);
        toast({
          title: "Utilisateur modifié",
          description: "Les informations ont été mises à jour avec succès",
        });
      } else {
        if (!formData.password) {
          toast({ title: "Mot de passe requis", description: "Veuillez définir un mot de passe pour le nouvel utilisateur.", variant: "destructive" });
          return;
        }
        await addUser(formData);
        toast({
          title: "Utilisateur ajouté",
          description: "Le nouvel utilisateur a été créé avec succès",
        });
      }

      handleCloseDialog();
    } catch (error) {
      // Error is handled in context/api, here we just stop the dialog from closing
      console.error("Failed to save user", error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone || '', // Handle potentially missing phone
      password: '', // Clear password field for editing
      role: user.role,
      region: user.region,
      department: user.department || '',
      commune: user.commune || '',
      status: user.status
    });
    setIsDialogOpen(true);
  };

  const openNewUserDialog = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      role: currentUser?.role === 'admin' ? 'agent' : '',
      region: currentUser?.role === 'admin' ? currentUser.region : '',
      department: '',
      commune: '',
      status: 'active'
    });
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({ name: '', username: '', email: '', password: '', role: '', region: '', department: '', commune: '', status: 'active' });
    setShowPassword(false);
  };

  const handleStatusToggle = (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const actionName = newStatus === 'active' ? 'Activer' : 'Bloquer';

    setConfirmDialog({
      isOpen: true,
      title: `Confirmer l'action`,
      description: `Êtes-vous sûr de vouloir ${actionName.toLowerCase()} l'utilisateur "${user.name}" ? ${newStatus === 'inactive' ? 'Il ne pourra plus se connecter.' : 'Il retrouvera l\'accès à la plateforme.'}`,
      action: () => {
        updateUser(user.id, { status: newStatus });
        toast({
          title: "Statut modifié",
          description: `L'utilisateur est maintenant ${newStatus === 'active' ? 'actif' : 'inactif'}`,
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDelete = (user) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Supprimer l\'utilisateur',
      description: `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${user.name}" ? Cette action est irréversible.`,
      action: async () => {
        await deleteUser(user.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (!newPassword) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Confirmer le changement',
      description: `Êtes-vous sûr de vouloir modifier le mot de passe pour "${passwordUser?.name}" ?`,
      action: () => {
        updateUser(passwordUser.id, { password: newPassword });
        toast({
          title: "Mot de passe mis à jour",
          description: "Le mot de passe de l'utilisateur a été modifié avec succès.",
        });
        setIsPasswordDialogOpen(false);
        setPasswordUser(null);
        setNewPassword('');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super-admin': return Shield;
      case 'admin': return UserCheck;
      case 'agent': return User;
      default: return User;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super-admin': return 'text-red-400 bg-red-500/10';
      case 'admin': return 'text-blue-400 bg-blue-500/10';
      case 'agent': return 'text-green-400 bg-green-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
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

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-3 sm:px-0">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col justify-between items-start p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0f172a] border border-white/5 shadow-2xl"
        >
          {/* Decorative Background Grid */}
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
          {/* Gradient Glow Orb */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full flex flex-col gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
                Gestion des Utilisateurs
              </h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base lg:text-lg font-light">
                Administration des comptes, rôles et permissions.
              </p>
            </div>

            <Button
              onClick={openNewUserDialog}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30 transition-all px-4 sm:px-6 py-2.5 font-semibold text-sm sm:text-base"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { title: 'Total utilisateurs', value: (users || []).length, icon: User, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/5', glow: 'group-hover:shadow-blue-500/20' },
            { title: 'Agents actifs', value: (users || []).filter(u => u && u.role === 'agent' && u.status === 'active').length, icon: UserCheck, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/5', glow: 'group-hover:shadow-emerald-500/20' },
            { title: 'Administrateurs', value: (users || []).filter(u => u && (u.role === 'admin' || u.role === 'super-admin')).length, icon: Shield, color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/5', glow: 'group-hover:shadow-purple-500/20' },
            { title: 'Comptes inactifs', value: (users || []).filter(u => u && u.status === 'inactive').length, icon: UserX, color: 'text-rose-400', bg: 'from-rose-500/20 to-rose-600/5', glow: 'group-hover:shadow-rose-500/20' }
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
                    <p className="text-[10px] sm:text-sm font-medium text-slate-400 uppercase tracking-wide">{stat.title}</p>
                    <p className="text-xl sm:text-4xl font-extrabold mt-1 sm:mt-2 text-white">{stat.value}</p>
                  </div>
                  <div className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.bg} border border-white/10 backdrop-blur-sm`}>
                    <stat.icon className={`h-4 w-4 sm:h-7 sm:w-7 ${stat.color}`} />
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
          <div className="p-3 sm:p-6 border-b border-white/5 flex flex-col gap-3 sm:gap-4 bg-gradient-to-r from-slate-900/80 to-slate-800/50">
            <div className="relative w-full">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher par nom ou identifiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-11 h-10 sm:h-11 bg-slate-800/50 border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all rounded-xl text-white placeholder:text-slate-500 text-sm"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full max-w-[220px] h-10 sm:h-11 bg-slate-800/50 border-white/10 rounded-xl text-sm">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="super-admin">Super Admin</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto min-h-[300px] sm:min-h-[400px]">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3 p-3 sm:p-4">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, index) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-slate-900/60 backdrop-blur-md border border-white/5 overflow-hidden group hover:bg-slate-800/60 transition-colors">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedProfileUser(user); setIsProfileOpen(true); }}>
                              <div className={`p-2 rounded-full ${getRoleColor(user.role)} bg-opacity-20`}>
                                <RoleIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm leading-tight">{user.name}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-0.5">@{user.username}</p>
                              </div>
                            </div>
                            <div className="transform scale-90 origin-top-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {user.status === 'active' ? 'Actif' : 'Inactif'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1.5 opacity-50 text-blue-400" />
                              <span className="truncate max-w-[120px]">{user.region || 'Toutes régions'}</span>
                            </div>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border border-white/5 ${getRoleColor(user.role)} bg-opacity-10`}>
                                {getRoleLabel(user.role)}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-teal-400 hover:bg-teal-500/20 rounded-lg" onClick={() => { setSelectedProfileUser(user); setIsProfileOpen(true); }}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-400 hover:bg-blue-500/20 rounded-lg" onClick={() => handleEdit(user)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-amber-400 hover:bg-amber-500/20 rounded-lg" onClick={() => { setPasswordUser(user); setIsPasswordDialogOpen(true); }}>
                                <Key className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" className={`h-7 w-7 p-0 hover:bg-white/10 rounded-lg ${user.status === 'active' ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`} onClick={() => handleStatusToggle(user)}>
                                {user.status === 'active' ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-500/20 rounded-lg" onClick={() => handleDelete(user)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center p-8 text-slate-500">Aucun utilisateur trouvé.</div>
              )}
            </div>

            {/* Desktop Table View */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Utilisateur</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rôle</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Localisation</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user, index) => {
                      const RoleIcon = getRoleIcon(user.role);
                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group hover:bg-white/[0.04] transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center cursor-pointer" onClick={() => { setSelectedProfileUser(user); setIsProfileOpen(true); }}>
                              <div className={`p-2 rounded-full mr-3 ${getRoleColor(user.role)}`}>
                                <RoleIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-white hover:text-blue-400 transition-colors">{user.name}</p>
                                <p className="text-xs text-slate-400 flex items-center mt-0.5">
                                  <User className="h-3 w-3 mr-1" /> {user.username}
                                </p>
                                <p className="text-xs text-slate-500 flex items-center mt-0.5">
                                  <Mail className="h-3 w-3 mr-1" /> {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/5 ${getRoleColor(user.role)} bg-opacity-10`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-slate-300">
                            <div className="flex flex-col">
                              <div className="flex items-center text-white">
                                <MapPin className="h-3 w-3 mr-1 text-slate-500" />
                                {user.region || 'Toutes'}
                              </div>
                              {(user.department || user.commune) && (
                                <div className="text-xs text-slate-500 ml-4">
                                  {user.department && <span>{user.department}</span>}
                                  {user.department && user.commune && <span> • </span>}
                                  {user.commune && <span>{user.commune}</span>}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-red-500/10 text-red-500'
                              }`}>
                              {user.status === 'active' ? (
                                <><CheckCircle2 className="w-3 h-3 mr-1" /> Actif</>
                              ) : (
                                <><AlertCircle className="w-3 h-3 mr-1" /> Inactif</>
                              )}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-teal-400 hover:text-teal-300 hover:bg-teal-500/20"
                                onClick={() => { setSelectedProfileUser(user); setIsProfileOpen(true); }}
                                title="Voir le profil"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                                onClick={() => handleEdit(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                                onClick={() => {
                                  setPasswordUser(user);
                                  setIsPasswordDialogOpen(true);
                                }}
                                title="Changer le mot de passe"
                              >
                                <Key className="h-4 w-4" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                className={`h-8 w-8 hover:bg-white/10 ${user.status === 'active' ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                                onClick={() => handleStatusToggle(user)}
                              >
                                {user.status === 'active' ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/20"
                                onClick={() => handleDelete(user)}
                                title="Supprimer l'utilisateur"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">
                        Aucun utilisateur trouvé correspondant à vos critères.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredUsers.length > 0 && (
            <div className="p-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm bg-gradient-to-r from-slate-900/80 to-slate-800/50">
              <span className="text-slate-400 text-center sm:text-left">
                Affichage de <span className="text-white font-semibold">{startIndex + 1}</span> à <span className="text-white font-semibold">{Math.min(endIndex, filteredUsers.length)}</span> sur <span className="text-white font-semibold">{filteredUsers.length}</span> utilisateurs
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
                  disabled={currentPage === totalPages}
                  className="h-9 px-4 border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white disabled:opacity-40 rounded-lg transition-all"
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Add/Edit User Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gradient-to-b from-slate-900 to-slate-950 border-white/10 text-white sm:max-w-[520px] shadow-2xl">
            {/* Decorative Gradient Orb */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-base">
                {editingUser ? 'Mettre à jour les informations du compte.' : 'Créer un nouveau compte d\'accès à la plateforme.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4 relative z-10">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-slate-300">Nom complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Prénom et Nom"
                      className="pl-10 bg-black/20 border-white/10"
                      required
                    />
                  </div>
                </div>


                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-slate-300">Identifiant (pour la connexion)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Identifiant unique"
                      className="pl-10 bg-black/20 border-white/10"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-300">Email professionnel (Optionnel)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="agent@pfpc.sn"
                      className="pl-10 bg-black/20 border-white/10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-slate-300">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="77 000 00 00"
                      className="pl-10 bg-black/20 border-white/10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-slate-300">
                    Mot de passe {editingUser && <span className="text-xs text-slate-500 font-normal">(Laisser vide pour conserver)</span>}
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={editingUser && !showPassword ? "••••••••" : "Entrez le mot de passe"}
                      className="pl-10 pr-10 bg-black/20 border-white/10"
                      required={!editingUser}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role" className="text-slate-300">Rôle</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                      required
                      disabled={currentUser?.role === 'admin'}
                    >
                      <SelectTrigger className="bg-black/20 border-white/10 disabled:opacity-50">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="agent">Agent</SelectItem>
                        {currentUser?.role === 'super-admin' && (
                          <>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super-admin">Super Admin</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="region" className="text-slate-300">Région</Label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                      required
                      disabled={currentUser?.role === 'admin'}
                    >
                      <SelectTrigger className="bg-black/20 border-white/10 disabled:opacity-50">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        {currentUser?.role === 'admin' && currentUser?.region ? (
                          <SelectItem value={currentUser.region}>{currentUser.region}</SelectItem>
                        ) : (
                          senegalRegions.map(region => (
                            <SelectItem key={region} value={region}>{region}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department" className="text-slate-300">Département</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Département"
                      className="bg-black/20 border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="commune" className="text-slate-300">Commune</Label>
                    <Input
                      id="commune"
                      value={formData.commune}
                      onChange={(e) => setFormData(prev => ({ ...prev, commune: e.target.value }))}
                      placeholder="Commune"
                      className="bg-black/20 border-white/10"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-8 gap-3">
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl px-6">
                  Annuler
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-500/20 rounded-xl px-6 font-semibold">
                  {editingUser ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="bg-gradient-to-b from-slate-900 to-slate-950 border-white/10 text-white sm:max-w-[420px] shadow-2xl">
            {/* Decorative Gradient Orb */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                Changer le mot de passe
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-base">
                Définissez un nouveau mot de passe pour <span className="text-white font-medium">{passwordUser?.name}</span>.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordReset} className="space-y-5 mt-4 relative z-10">
              <div className="grid gap-2">
                <Label htmlFor="new-password" className="text-slate-300 font-medium">Nouveau mot de passe</Label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 h-11 bg-slate-800/50 border-white/10 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 rounded-xl"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-8 gap-3">
                <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)} className="border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl px-6">
                  Annuler
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 rounded-xl px-6 font-semibold">
                  Sauvegarder
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <AlertDialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => setConfirmDialog(prev => ({ ...prev, isOpen }))}>
          <AlertDialogContent className="bg-gradient-to-b from-slate-900 to-slate-950 border-white/10 text-white shadow-2xl">
            {/* Decorative Gradient Orb */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-red-500/20 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <AlertDialogHeader className="relative z-10">
              <AlertDialogTitle className="text-xl font-bold text-white">{confirmDialog.title}</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400 text-base">
                {confirmDialog.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-xl px-6">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-500/20 rounded-xl px-6 font-semibold"
                onClick={(e) => {
                  e.preventDefault();
                  if (confirmDialog.action) confirmDialog.action();
                }}
              >
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div >

      <UserProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={selectedProfileUser}
        caseCount={selectedProfileUser ? cases.filter(c => String(c.agentId) === String(selectedProfileUser.id) || c.agentName === selectedProfileUser.name).length : 0}
        onUpdate={() => {
          // Refresh the current user if they're viewing their own profile
          if (selectedProfileUser?.id === currentUser?.id) {
            window.location.reload(); // Simple refresh for now
          }
        }}
      />
    </Layout >
  );
};

export default UsersPage;
