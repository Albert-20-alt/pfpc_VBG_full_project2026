import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useNavigate, useLocation } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { toast } from '@/components/ui/use-toast';
import { Save, Send, User, MapPin, Shield, Heart, UploadCloud } from 'lucide-react';

import VictimInfoForm from '@/components/forms/VictimInfoForm';
import PerpetratorInfoForm from '@/components/forms/PerpetratorInfoForm';
import ViolenceInfoForm from '@/components/forms/ViolenceInfoForm';
import SupportInfoForm from '@/components/forms/SupportInfoForm';
import FormNavigation from '@/components/forms/FormNavigation';

const initialFormData = {
  victimAge: '', victimGender: '', victimDisability: '', victimMaritalStatus: '',
  victimReligion: '', victimEthnicity: '', victimEducation: '', victimProfession: '',
  victimRegion: '', victimCommune: '', victimName: '',

  perpetratorGender: '', perpetratorAge: '', perpetratorProfession: '',
  perpetratorRegion: '', perpetratorCommune: '', perpetratorSocialClass: '',
  relationshipToVictim: '', perpetratorName: '',

  violenceType: '', violenceDescription: '', incidentDate: '', incidentLocation: '',

  servicesProvided: [], followUpRequired: '', supportNeeds: '', referrals: '',
  attachments: [], status: 'pending'
};

const FormPage = () => {
  const { user } = useAuth();
  const { addCase, updateCase } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const { caseData: editingCaseData, isEditing, reset } = location.state || {};

  const [formData, setFormData] = useState(() => {
    if (reset) return initialFormData;

    if (isEditing && editingCaseData) {
      return {
        ...initialFormData,
        ...editingCaseData,
        servicesProvided: Array.isArray(editingCaseData.servicesProvided) ? editingCaseData.servicesProvided : []
      };
    }
    const savedDraft = localStorage.getItem('vbg_form_draft');
    try {
      return savedDraft ? JSON.parse(savedDraft) : initialFormData;
    } catch (error) {
      console.error('Error parsing draft from localStorage:', error);
      return initialFormData;
    }
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('victim');

  useEffect(() => {
    if (!isEditing) {
      localStorage.setItem('vbg_form_draft', JSON.stringify(formData));
    }
  }, [formData, isEditing]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      servicesProvided: prev.servicesProvided.includes(service)
        ? prev.servicesProvided.filter(s => s !== service)
        : [...prev.servicesProvided, service]
    }));
  };

  const saveDraft = () => {
    localStorage.setItem('vbg_form_draft', JSON.stringify(formData));
    toast({ title: "Brouillon sauvegardé", description: "Votre formulaire a été sauvegardé localement." });
  };

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [wantsToUpload, setWantsToUpload] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Comprehensive validation
    const newErrors = {};
    const requiredFields = [
      { key: 'victimAge', label: "L'âge de la victime", tab: 'victim' },
      { key: 'victimRegion', label: "La région de la victime", tab: 'victim' },
      { key: 'victimCommune', label: "La commune de la victime", tab: 'victim' },
      { key: 'violenceType', label: "Le type de violence", tab: 'violence' },
      { key: 'incidentDate', label: "La date de l'incident", tab: 'violence' }
    ];

    requiredFields.forEach(field => {
      if (!formData[field.key]) {
        newErrors[field.key] = `Ce champ est requis`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Find the first tab with an error
      const firstErrorField = requiredFields.find(f => newErrors[f.key]);
      if (firstErrorField) {
        setActiveTab(firstErrorField.tab);
        toast({
          title: "Formulaire incomplet",
          description: "Veuillez corriger les erreurs affichées en rouge.",
          variant: "destructive"
        });
      }
      return;
    }

    setIsConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    const casePayload = {
      ...formData,
      agentId: user.id,
      agentName: user.name,
      status: formData.status || 'pending', // Keep existing status if editing
      updatedAt: new Date().toISOString()
    };

    if (!isEditing) {
      casePayload.submittedAt = new Date().toISOString();
      const newCase = await addCase(casePayload);
      toast({
        title: "Cas enregistré",
        description: "Le cas a été soumis avec succès.",
      });
      localStorage.removeItem('vbg_form_draft');
      setFormData(initialFormData);

      if (wantsToUpload && newCase?.id) {
        navigate('/form/upload', { state: { prefilledCaseId: newCase.id } });
      } else {
        // Redirect based on role
        if (user?.role === 'admin') {
          navigate('/admin/cases');
        } else {
          // agent and super-admin
          navigate('/agent/cases');
        }
      }
    } else {
      updateCase(editingCaseData.id, casePayload);
      toast({
        title: "Cas modifié",
        description: "Les modifications ont été enregistrées.",
      });
      navigate('/agent/cases');
    }
    setIsConfirmOpen(false);
  };

  const formTabs = [
    { value: 'victim', label: 'Victime', icon: User, component: VictimInfoForm },
    { value: 'perpetrator', label: 'Auteur', icon: Shield, component: PerpetratorInfoForm },
    { value: 'violence', label: 'Violence', icon: MapPin, component: ViolenceInfoForm },
    { value: 'support', label: 'Prise en charge', icon: Heart, component: SupportInfoForm }
  ];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/5 shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
          <div className="relative z-10 w-full text-center md:text-left">
            <h1 className="text-2xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg leading-tight mb-2">
              {isEditing ? `Modification du Cas #${(editingCaseData.id || '').toString().slice(-6)}` : 'Formulaire de Signalement VBG'}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg font-light max-w-3xl mx-auto md:mx-0">
              {isEditing ? 'Mise à jour des informations du dossier.' : "Enregistrement sécurisé d'un nouveau cas de violence basée sur le genre."}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border border-white/10 bg-slate-900/90 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <form onSubmit={handleSubmit} className="p-4 sm:p-8">
                <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                  <AlertDialogContent className="glass-card border-white/10 bg-slate-900/95">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Confirmer la soumission</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        Êtes-vous sûr de vouloir soumettre ce cas ? Une fois soumis, l'administrateur sera notifié.
                      </AlertDialogDescription>
                      <div className="flex items-center space-x-3 mt-4 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setWantsToUpload(!wantsToUpload)}>
                        <input
                          type="checkbox"
                          id="upload-check"
                          className="w-5 h-5 rounded border-white/20 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                          checked={wantsToUpload}
                          onChange={(e) => setWantsToUpload(e.target.checked)}
                        />
                        <label htmlFor="upload-check" className="text-sm text-slate-300 font-medium cursor-pointer select-none">
                          Je souhaite joindre des documents (Photos, PDF...)
                        </label>
                      </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/5">Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmSubmit} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-none">
                        Confirmer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Step Progress Indicator */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs sm:text-sm font-medium text-slate-400">
                      Étape {formTabs.findIndex(t => t.value === activeTab) + 1} sur {formTabs.length}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-blue-400">
                      {Math.round(((formTabs.findIndex(t => t.value === activeTab) + 1) / formTabs.length) * 100)}% complété
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${((formTabs.findIndex(t => t.value === activeTab) + 1) / formTabs.length) * 100}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    {formTabs.map((tab, index) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveTab(tab.value)}
                        className={`flex flex-col items-center gap-1 px-1 sm:px-2 py-1 rounded-lg transition-all ${activeTab === tab.value
                          ? 'text-white'
                          : formTabs.findIndex(t => t.value === activeTab) > index
                            ? 'text-green-400'
                            : 'text-slate-500'
                          }`}
                      >
                        <div className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${activeTab === tab.value
                          ? 'bg-blue-500'
                          : formTabs.findIndex(t => t.value === activeTab) > index
                            ? 'bg-green-500/20 border border-green-500'
                            : 'bg-slate-700'
                          }`}>
                          {formTabs.findIndex(t => t.value === activeTab) > index ? '✓' : index + 1}
                        </div>
                        <span className="text-[10px] sm:text-xs hidden sm:block">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sm:space-y-8">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1.5 bg-slate-950/50 rounded-2xl border border-white/10">
                    {formTabs.map(tab => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="flex items-center justify-center gap-2 py-2 sm:py-3.5 text-xs sm:text-sm data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
                      >
                        <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div className="bg-slate-900/30 rounded-2xl p-4 sm:p-6 border border-white/5 min-h-[400px]">
                    {formTabs.map(tab => {
                      const TabComponent = tab.component;
                      return (
                        <TabsContent key={tab.value} value={tab.value} className="mt-0 focus-visible:ring-0">
                          <TabComponent
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleServiceToggle={handleServiceToggle}
                            setFormData={setFormData}
                            errors={errors}
                          />
                        </TabsContent>
                      );
                    })}
                  </div>

                  <FormNavigation
                    tabs={formTabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                  />

                  <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-white/10">
                    <Button type="button" variant="ghost" onClick={() => navigate('/form/upload')} className="w-full sm:w-auto text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10">
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Joindre Documents
                    </Button>

                    {isEditing && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-800/50 p-2 rounded-xl border border-white/10">
                        <span className="text-sm text-slate-400 pl-2 hidden sm:inline">Statut:</span>
                        <Select
                          value={formData.status || 'pending'}
                          onValueChange={(value) => handleInputChange('status', value)}
                        >
                          <SelectTrigger className="w-full sm:w-[180px] h-10 bg-slate-900 border-white/10 text-white">
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="open">En cours</SelectItem>
                            <SelectItem value="completed">Traité / Clos</SelectItem>
                            <SelectItem value="follow-up">Suivi requis</SelectItem>
                            <SelectItem value="archived">Archivé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button type="button" variant="outline" onClick={saveDraft} className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-white">
                        <Save className="mr-2 h-4 w-4" />
                        Sauvegarder
                      </Button>
                      <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-900/20 px-8">
                        <Send className="mr-2 h-4 w-4" />
                        Soumettre le Cas
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default FormPage;