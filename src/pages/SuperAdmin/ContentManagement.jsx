import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea'; // Removed in favor of WYSIWYG
import { Editor, EditorProvider, Toolbar, BtnBold, BtnItalic, BtnUnderline, BtnStrikeThrough, BtnBulletList, BtnNumberedList, BtnLink, BtnClearFormatting, Separator } from 'react-simple-wysiwyg';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/Layout';
import { Save, Loader2, Info, FileText, Phone, Mail, MapPin } from 'lucide-react';
import { api } from '@/api';

const ContentManagement = () => {
    // const { token } = useAuth(); // Token handled by api module
    const [loading, setLoading] = useState(false);
    const [loadingContent, setLoadingContent] = useState(true);

    // Contact Info State
    const [contactInfo, setContactInfo] = useState({
        address: '',
        phone: '',
        email: ''
    });

    // Legal Content State
    const [activeLegalTab, setActiveLegalTab] = useState('terms_of_service'); // terms_of_service | privacy_policy
    const [legalContent, setLegalContent] = useState('');

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            setLoadingContent(true);
            try {
                // Fetch Contact
                const contactData = await api.getContactInfo();
                setContactInfo({
                    address: contactData.address || '',
                    phone: contactData.phone || '',
                    email: contactData.email || ''
                });

                // Fetch Active Legal Content
                fetchLegalContent(activeLegalTab);
            } catch (error) {
                console.error(error);
                toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
            } finally {
                setLoadingContent(false);
            }
        };
        fetchData();
    }, [activeLegalTab]);

    const fetchLegalContent = async (key) => {
        try {
            const data = await api.getContent(key);
            setLegalContent(data.content || '');
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: `Impossible de charger ${key}`, variant: "destructive" });
        }
    };

    const handleSaveContact = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.updateContactInfo(contactInfo);
            toast({ title: "Succès", description: "Informations de contact mises à jour.", className: "bg-green-600 text-white" });
        } catch (error) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLegal = async () => {
        setLoading(true);
        try {
            await api.updateContent(activeLegalTab, legalContent);
            toast({ title: "Succès", description: "Contenu mis à jour.", className: "bg-green-600 text-white" });
        } catch (error) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto p-6 space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/5 shadow-2xl"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-grid-white/5 mix-blend-overlay pointer-events-none" />
                    <div className="relative z-10">
                        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
                            Gestion du Contenu
                        </h1>
                        <p className="text-slate-300 mt-2 text-lg font-light">
                            Modifiez les informations publiques et les textes légaux.
                        </p>
                    </div>
                </motion.div>

                <Tabs defaultValue="contact" className="space-y-6">
                    <TabsList className="flex flex-col sm:flex-row h-auto w-full bg-slate-900/50 border border-white/10 p-1.5 rounded-xl gap-2">
                        <TabsTrigger
                            value="contact"
                            className="w-full sm:w-auto data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg px-6 py-3 transition-all"
                        >
                            <Info className="w-4 h-4 mr-2" /> Informations de Contact
                        </TabsTrigger>
                        <TabsTrigger
                            value="legal"
                            className="w-full sm:w-auto data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg px-6 py-3 transition-all"
                        >
                            <FileText className="w-4 h-4 mr-2" /> Pages Légales
                        </TabsTrigger>
                    </TabsList>

                    {/* CONTACT TAB */}
                    <TabsContent value="contact">
                        <Card className="glass-card border-white/10 bg-slate-900/40 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2 text-white">
                                    <Phone className="w-5 h-5 text-blue-400" /> Coordonnées Publiques
                                </CardTitle>
                                <CardDescription className="text-slate-400">Ces informations apparaissent sur la page "Contact" et le pied de page.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSaveContact} className="space-y-6 max-w-2xl">
                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="text-slate-300">Adresse Physique</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                                <Input
                                                    id="address"
                                                    value={contactInfo.address}
                                                    onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                                                    className="pl-10 h-10 bg-slate-950/50 border-white/10 text-white rounded-xl focus:ring-blue-500/50"
                                                    placeholder="Ex: 123 Rue Principale, Dakar"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-slate-300">Téléphone</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                                    <Input
                                                        id="phone"
                                                        value={contactInfo.phone}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                                        className="pl-10 h-10 bg-slate-950/50 border-white/10 text-white rounded-xl focus:ring-blue-500/50"
                                                        placeholder="+221 ..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-slate-300">Email de Contact</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                                    <Input
                                                        id="email"
                                                        value={contactInfo.email}
                                                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                                        className="pl-10 h-10 bg-slate-950/50 border-white/10 text-white rounded-xl focus:ring-blue-500/50"
                                                        placeholder="contact@exemple.sn"
                                                        type="email"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4 border-t border-white/5">
                                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl shadow-lg shadow-blue-900/20 w-full sm:w-auto">
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                            Enregistrer
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* LEGAL TAB */}
                    <TabsContent value="legal">
                        <Card className="glass-card border-white/10 bg-slate-900/40 shadow-xl">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2 text-white">
                                            <FileText className="w-5 h-5 text-purple-400" /> Éditeur de Contenu Légal
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 mt-1">Modifiez les Conditions d'Utilisation et la Politique de Confidentialité.</CardDescription>
                                    </div>
                                    <div className="bg-slate-950/50 p-1.5 rounded-xl border border-white/10 flex flex-col sm:flex-row w-full md:w-auto gap-1">
                                        <button
                                            onClick={() => setActiveLegalTab('terms_of_service')}
                                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all w-full md:w-auto ${activeLegalTab === 'terms_of_service' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            Conditions d'Utilisation
                                        </button>
                                        <button
                                            onClick={() => setActiveLegalTab('privacy_policy')}
                                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all w-full md:w-auto ${activeLegalTab === 'privacy_policy' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            Confidentialité
                                        </button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {loadingContent ? (
                                    <div className="h-64 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <style>{`
                                            .rsw-editor {
                                                background: rgba(2, 6, 23, 0.5);
                                                border: 1px solid rgba(255, 255, 255, 0.1);
                                                border-radius: 0.5rem;
                                                color: white;
                                                min-height: 500px;
                                            }
                                            .rsw-toolbar {
                                                background: rgba(15, 23, 42, 0.5);
                                                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                                            }
                                            .rsw-btn {
                                                color: #94a3b8;
                                            }
                                            .rsw-btn:hover {
                                                color: white;
                                                background: rgba(255, 255, 255, 0.1);
                                            }
                                            .rsw-btn[data-active="true"] {
                                                color: #a855f7; /* purple-500 */
                                                background: rgba(168, 85, 247, 0.1);
                                            }
                                            .rsw-separator {
                                                background: rgba(255, 255, 255, 0.1);
                                            }
                                        `}</style>
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-200 text-sm mb-4">
                                            <strong>Note :</strong> Utilisez l'éditeur ci-dessous pour formater votre texte facilement (Gras, Italique, Listes, etc.).
                                        </div>

                                        <EditorProvider>
                                            <Editor value={legalContent} onChange={(e) => setLegalContent(e.target.value)}>
                                                <Toolbar>
                                                    <BtnBold />
                                                    <BtnItalic />
                                                    <BtnUnderline />
                                                    <BtnStrikeThrough />
                                                    <Separator />
                                                    <BtnNumberedList />
                                                    <BtnBulletList />
                                                    <Separator />
                                                    <BtnLink />
                                                    <BtnClearFormatting />
                                                </Toolbar>
                                            </Editor>
                                        </EditorProvider>

                                        <div className="flex justify-end gap-3 pt-4">
                                            <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white">Annuler</Button>
                                            <Button onClick={handleSaveLegal} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                                Publier {activeLegalTab === 'terms_of_service' ? 'les Conditions' : 'la Politique'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default ContentManagement;
