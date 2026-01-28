import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { UploadCloud, FileText, Image as ImageIcon, Trash2, CheckCircle, Eye, X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { api } from '@/api';
import Layout from '@/components/Layout';

const DocumentUploadPage = () => {
  const { users } = useData();
  const location = useLocation();
  const { prefilledCaseId } = location.state || {};
  const [files, setFiles] = useState([]);
  const [caseId, setCaseId] = useState(prefilledCaseId || '');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Filter users to show only admins and agents
  const eligibleRecipients = users.filter(u => ['admin', 'super-admin', 'agent'].includes(u.role));

  const onDrop = useCallback(acceptedFiles => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file),
      status: 'pending'
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': []
    },
    maxSize: 5 * 1024 * 1024,
  });

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const toggleRecipient = (userId) => {
    setSelectedRecipients(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleUpload = async () => {
    if (!caseId) {
      toast({ title: "Erreur", description: "Veuillez entrer un N° de cas.", variant: "destructive" });
      return;
    }
    if (files.length === 0) {
      toast({ title: "Aucun fichier", description: "Veuillez sélectionner des fichiers à téléverser.", variant: "destructive" });
      return;
    }

    // Simulate sending logic (in a real app, this would be part of the API payload)

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'success') continue;

      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));

      try {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('caseId', caseId);
        // Backend expects 'type' or other metadata? Using 'document' generic type if needed, 
        // but 'createResource' logic on backend usually infers from extension or needs 'type' field.
        // Assuming backend handles it or defaults. We will send 'type' just in case.
        formData.append('type', 'document');
        if (selectedRecipients.length > 0) {
          formData.append('sharedWith', JSON.stringify(selectedRecipients));
        }

        await api.createDocument(formData);

        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'success' } : f));
      } catch (error) {
        console.error("Upload failed for file:", files[i].name, error);
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f));
      }
    }

    // Detailed toast message
    const recipientNames = selectedRecipients.map(id => users.find(u => String(u.id) === String(id))?.name).join(', ');
    const message = selectedRecipients.length > 0
      ? `Fichiers téléversés et partagés avec : ${recipientNames}`
      : "Fichiers téléversés avec succès (Aucun partage sélectionné).";

    toast({ title: "Opération terminée", description: message });
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-400" />;
    if (fileType === 'application/pdf') return <FileText className="h-8 w-8 text-red-400" />;
    return <FileText className="h-8 w-8 text-gray-400" />;
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-4 sm:px-0">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400 tracking-tight">Téléversement</h1>
          <p className="text-slate-400 mt-2 text-base sm:text-lg">Ajoutez des pièces justificatives et partagez-les.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect border-white/5 bg-slate-900/30 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Détails et Partage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="caseId" className="text-slate-300 mb-2 block">N° de Cas Associé</Label>
                <Input
                  id="caseId"
                  placeholder="Entrez le numéro du cas (ex: CAS-12345)"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  className="bg-slate-900/50 border-white/10 focus:border-green-500/50 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Partager avec (Agents/Admins)</Label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-900/50 border border-white/10 min-h-[50px]">
                  {eligibleRecipients.map(user => (
                    <div
                      key={user.id}
                      onClick={() => toggleRecipient(user.id)}
                      className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedRecipients.includes(user.id)
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                        }`}
                    >
                      {user.name} ({user.role})
                    </div>
                  ))}
                  {eligibleRecipients.length === 0 && <span className="text-slate-500 text-sm">Aucun destinataire disponible.</span>}
                </div>
                <p className="text-xs text-slate-500 mt-2">Cliquez pour sélectionner les personnes qui recevront une notification.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/5 bg-slate-900/30 backdrop-blur-xl">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-lg sm:text-xl">Zone de Téléversement</CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm">Glissez-déposez vos fichiers ou cliquez pour sélectionner. (Max 5MB)</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div
                {...getRootProps()}
                className={`p-6 sm:p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300
                ${isDragActive ? 'border-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(74,222,128,0.2)]' : 'border-white/10 hover:border-green-400/50 hover:bg-white/[0.02]'}`}
              >
                <input {...getInputProps()} />
                <div className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-all ${isDragActive ? 'bg-green-500/20' : 'bg-white/5'}`}>
                  <UploadCloud className={`h-6 w-6 sm:h-8 sm:w-8 transition-colors ${isDragActive ? 'text-green-400' : 'text-slate-400'}`} />
                </div>
                {isDragActive ? (
                  <p className="text-green-400 font-medium text-base sm:text-lg">Relâchez les fichiers ici...</p>
                ) : (
                  <p className="text-slate-300 font-medium text-base sm:text-lg">Glissez-déposez ou cliquez</p>
                )}
                <p className="text-xs sm:text-sm text-slate-500 mt-2">Types supportés: JPG, PNG, PDF, DOC</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-effect border-white/5 bg-slate-900/30 backdrop-blur-xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-lg sm:text-xl">Fichiers Sélectionnés ({files.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                {files.map((file, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-white/5 gap-3">
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-2 pl-12 sm:pl-0">
                      <div className="flex items-center gap-2">
                        <div className="min-w-[80px] flex justify-end">
                          {file.status === 'pending' && <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 whitespace-nowrap">En attente</span>}
                          {file.status === 'uploading' && <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center whitespace-nowrap"><UploadCloud className="w-3 h-3 mr-1 animate-bounce" /> Envoi...</span>}
                          {file.status === 'success' && <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center whitespace-nowrap"><CheckCircle className="w-3 h-3 mr-1" /> Terminé</span>}
                          {file.status === 'error' && <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 whitespace-nowrap">Échec</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handlePreview(file)} className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-blue-400 hover:bg-blue-400/10" title="Prévisualiser">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeFile(file.name)} className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-400/10" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-end p-4 sm:p-0">
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || !caseId || files.some(f => f.status === 'uploading')}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white border-0 shadow-lg shadow-green-900/20 px-6 sm:px-8 py-4 sm:py-6 h-auto text-base sm:text-lg rounded-xl"
          >
            <UploadCloud className="mr-2 h-5 w-5" />
            Téléverser et Partager
          </Button>
        </motion.div>
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-4xl bg-slate-900 border-white/10 text-white p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="p-4 bg-slate-900/50 border-b border-white/5">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-medium truncate pr-8">{previewFile?.name}</DialogTitle>
              {/* Close button is automatically added by DialogContent usually, but consistent custom one is safer if needed. Shadcn default is fine. */}
            </div>
          </DialogHeader>
          <div className="flex-1 bg-black/50 p-4 flex items-center justify-center overflow-auto">
            {previewFile && (
              <>
                {previewFile.type.startsWith('image/') ? (
                  <img src={previewFile.preview} alt={previewFile.name} className="max-w-full max-h-[70vh] object-contain rounded-md" />
                ) : previewFile.type === 'application/pdf' ? (
                  <iframe src={previewFile.preview} title={previewFile.name} className="w-full h-[70vh] rounded-md border-0" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
                    <FileText className="h-16 w-16 mb-4 opacity-50" />
                    <p>Aperçu non disponible pour ce type de fichier.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default DocumentUploadPage;