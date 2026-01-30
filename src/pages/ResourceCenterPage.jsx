
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Filter, Download, FileText, Video, Image as ImageIcon } from 'lucide-react';

import { api } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const BASE_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');

const ResourceCenterPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('guide');
  const [uploadCategory, setUploadCategory] = useState('protocoles');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  React.useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await api.getResources();
      // Map backend data to frontend structure if needed
      // Backend: title, type, link, category, addedBy, createdAt
      const formatted = data.map(r => ({
        id: r.id,
        title: r.title,
        type: r.type || 'autre',
        category: r.category || 'autre',
        region: r.region || 'National', // Needs to be added to backend or derived
        date: r.createdAt,
        fileType: r.link ? r.link.split('.').pop() : 'file',
        size: 'N/A', // Size not stored yet
        url: r.link ? `${BASE_URL}/${r.link}` : '#'
      }));
      setResources(formatted);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteResource(deleteId);
      toast({
        title: "Succès",
        description: "Ressource supprimée avec succès.",
        variant: "success"
      });
      fetchResources();
    } catch (err) {
      console.error("Delete failed:", err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la ressource.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('type', uploadType);
      formData.append('category', uploadCategory);
      formData.append('file', uploadFile);
      formData.append('addedBy', user.id);
      formData.append('region', user.region || 'National');

      await api.createResource(formData);
      setIsUploadOpen(false);
      setUploadTitle('');
      setUploadFile(null);
      fetchResources(); // Refresh list
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Erreur lors de l'upload");
    } finally {
      setUploadLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
    const matchesRegion = regionFilter === 'all' || resource.region === regionFilter;
    return matchesSearch && matchesType && matchesCategory && matchesRegion;
  });

  const resourceTypes = ['all', ...new Set(resources.map(r => r.type))];
  const resourceCategories = ['all', ...new Set(resources.map(r => r.category))];
  const resourceRegions = ['all', ...new Set(resources.map(r => r.region))];

  const getFileTypeIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'pdf': return <FileText className="text-red-500" />;
      case 'docx':
      case 'doc': return <FileText className="text-blue-500" />;
      case 'video': return <Video className="text-purple-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg': return <ImageIcon className="text-green-500" />;
      default: return <FileText className="text-gray-500" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Cette action est irréversible. La ressource sera définitivement supprimée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-white/10">Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col md:flex-row justify-between items-start md:items-center p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0f172a] border border-white/5 shadow-2xl"
        >
          {/* Decorative Background Grid */}
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
          {/* Gradient Glow Orbs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
            <div className="w-full md:w-auto">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight flex items-center mb-2">
                <BookOpen className="mr-3 sm:mr-4 h-8 w-8 sm:h-10 sm:w-10 text-blue-400" /> Centre de Ressources
              </h1>
              <p className="text-slate-400 text-sm sm:text-lg font-light max-w-2xl">
                Accédez à une bibliothèque complète de guides, protocoles, formations et documents essentiels pour votre travail.
              </p>
            </div>
            {(user?.role === 'super-admin') && (
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter une ressource
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Ajouter une ressource</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Téléversez un document pour le rendre accessible aux agents.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre</Label>
                      <Input
                        id="title"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className="bg-slate-800 border-white/10"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={uploadType} onValueChange={setUploadType}>
                          <SelectTrigger className="bg-slate-800 border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/10 text-white">
                            <SelectItem value="guide">Guide</SelectItem>
                            <SelectItem value="formation">Formation</SelectItem>
                            <SelectItem value="modele">Modèle</SelectItem>
                            <SelectItem value="procedure">Procédure</SelectItem>
                            <SelectItem value="rapport">Rapport</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Catégorie</Label>
                        <Select value={uploadCategory} onValueChange={setUploadCategory}>
                          <SelectTrigger className="bg-slate-800 border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/10 text-white">
                            <SelectItem value="protocoles">Protocoles</SelectItem>
                            <SelectItem value="sensibilisation">Sensibilisation</SelectItem>
                            <SelectItem value="outils">Outils</SelectItem>
                            <SelectItem value="communication">Communication</SelectItem>
                            <SelectItem value="donnees">Données</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file">Média / Document</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        className="bg-slate-800 border-white/10 cursor-pointer"
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={uploadLoading} className="bg-blue-600 hover:bg-blue-700">
                        {uploadLoading ? 'Envoi...' : 'Téléverser'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-white/5 shadow-lg">
            {/* Gradient accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  <Input
                    placeholder="Rechercher une ressource..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-slate-900 border-white/10 focus:border-blue-500/50 text-white placeholder:text-slate-500 rounded-xl transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-11 bg-slate-800/50 border-white/10 text-slate-300 hover:text-white rounded-xl focus:ring-blue-500/30"><Filter className="h-4 w-4 mr-2 text-slate-400" /><SelectValue placeholder="Type de ressource" /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                    {resourceTypes.map(type => <SelectItem key={type} value={type}>{type === 'all' ? 'Tous types' : type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-11 bg-slate-800/50 border-white/10 text-slate-300 hover:text-white rounded-xl focus:ring-blue-500/30"><Filter className="h-4 w-4 mr-2 text-slate-400" /><SelectValue placeholder="Catégorie" /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                    {resourceCategories.map(cat => <SelectItem key={cat} value={cat}>{cat === 'all' ? 'Toutes catégories' : cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="h-11 bg-slate-800/50 border-white/10 text-slate-300 hover:text-white rounded-xl focus:ring-blue-500/30"><Filter className="h-4 w-4 mr-2 text-slate-400" /><SelectValue placeholder="Région" /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                    {resourceRegions.map(region => <SelectItem key={region} value={region}>{region === 'all' ? 'Toutes régions' : region}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="relative h-full bg-slate-900/60 backdrop-blur-md border-white/5 overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                    {/* Hover Gradient Border */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/50 rounded-xl transition-colors pointer-events-none" />

                    <CardHeader className="relative z-10 p-4 sm:p-6 pb-2 sm:pb-2">
                      <div className="flex justify-between items-start gap-3 sm:gap-4">
                        <div className="space-y-1">
                          <CardTitle className="text-base sm:text-lg font-bold leading-tight text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                            {resource.title}
                          </CardTitle>
                          <div className="flex flex-wrap gap-2 mt-1.5 sm:mt-2">
                            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] sm:text-xs font-medium border border-blue-500/20">
                              {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                            </span>
                            <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] sm:text-xs font-medium border border-purple-500/20">
                              {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex-shrink-0 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {React.cloneElement(getFileTypeIcon(resource.fileType), { className: "h-4 w-4 sm:h-5 sm:w-5" })}
                          </div>
                          {user?.role === 'super-admin' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteClick(resource.id); }}
                              className="p-1.5 sm:p-2 text-red-500 hover:text-red-400 hover:bg-white/10 rounded-full transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="relative z-10 flex-grow p-4 sm:p-6 pt-2 space-y-3">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-[10px] sm:text-xs">
                        <div className="space-y-0.5 sm:space-y-1">
                          <span className="text-slate-500">Région</span>
                          <p className="text-slate-300 font-medium truncate">{resource.region}</p>
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                          <span className="text-slate-500">Date</span>
                          <p className="text-slate-300 font-medium">{new Date(resource.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>

                    <div className="p-4 sm:p-6 pt-0 mt-auto relative z-10 grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-white/10 bg-white/5 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:border-transparent text-slate-300 hover:text-white transition-all duration-300 h-10 text-xs sm:text-sm font-medium"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <svg className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                        Lire
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-white/10 bg-white/5 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:border-transparent text-slate-300 hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300 h-10 text-xs sm:text-sm font-medium"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <Download className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Télécharger
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                <Search className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg">Aucune ressource ne correspond à vos critères.</p>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default ResourceCenterPage;
