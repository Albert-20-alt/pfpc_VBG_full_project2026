import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send, Pencil } from 'lucide-react';
import Layout from '@/components/Layout';
import { api } from '@/api';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ContactPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
    });
    const [errors, setErrors] = useState({});

    const [contactInfo, setContactInfo] = useState({
        address: 'Ziguinchor, Sénégal',
        email: 'contact@fbariss.sn',
        phone: '+221 33 991 00 00'
    });

    const [editForm, setEditForm] = useState({ address: '', email: '', phone: '' });

    const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

    React.useEffect(() => {
        const fetchInfo = async () => {
            try {
                const info = await api.getContactInfo();
                if (info) setContactInfo(info);
            } catch (err) {
                console.error("Using default contact info", err);
            }
        };
        fetchInfo();
    }, []);

    const openEditDialog = () => {
        setEditForm({ address: contactInfo.address, email: contactInfo.email, phone: contactInfo.phone });
        setEditDialogOpen(true);
    };

    const handleSaveContactInfo = async () => {
        setSaving(true);
        try {
            const updated = await api.updateContactInfo(editForm);
            setContactInfo(updated);
            setEditDialogOpen(false);
            toast({
                title: "Mis à jour",
                description: "Les informations de contact ont été mises à jour.",
                className: "bg-green-600 text-white border-none"
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Erreur",
                description: "Impossible de mettre à jour les informations.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = "Requis";
        if (!formData.lastName) newErrors.lastName = "Requis";
        if (!formData.email) newErrors.email = "Requis";
        if (!formData.message) newErrors.message = "Requis";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast({
                title: "Formulaire incomplet",
                description: "Veuillez remplir les champs indiqués en rouge.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            await api.sendMessage(formData);
            toast({
                title: "Message envoyé",
                description: "Nous avons bien reçu votre message et reviendrons vers vous rapidement.",
                className: "bg-green-600 text-white border-none"
            });
            setFormData({ firstName: '', lastName: '', email: '', message: '' });
        } catch (error) {
            console.error(error);
            toast({
                title: "Erreur",
                description: "Impossible d'envoyer le message. Veuillez réessayer.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <Layout hideNavbar={true}>
            <div className="min-h-screen text-foreground overflow-x-hidden selection:bg-purple-500/30 font-sans">

                {/* Navbar */}
                <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 h-20 transition-all duration-300">
                    <div className="container mx-auto px-6 h-full flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                            <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-white group-hover:bg-white/10 rounded-full transition-all">
                                <ArrowLeft size={24} />
                            </Button>
                            <span className="hidden sm:inline text-lg font-medium tracking-tight text-slate-300 group-hover:text-white transition-colors">Retour</span>
                        </div>
                        <div className="flex items-center gap-8">
                            <span className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">Fbariss</span>
                        </div>
                    </div>
                </nav>

                <section className="relative pt-28 sm:pt-32 pb-20 min-h-screen flex items-center bg-slate-950">
                    {/* Dynamic Background Elements */}
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -z-10" />

                    <div className="container mx-auto px-4 sm:px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="mb-12 sm:mb-20 text-center max-w-3xl mx-auto"
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs sm:text-sm font-semibold tracking-wide mb-4 sm:mb-6">
                                NOUS SOMMES À VOTRE ÉCOUTE
                            </span>
                            <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 sm:mb-8 leading-tight">
                                Contactez-nous
                            </h1>
                            <p className="text-slate-400 text-base sm:text-xl leading-relaxed">
                                Une question, un signalement ou une envie de rejoindre notre réseau d'acteurs engagés ?
                                <span className="text-slate-200 font-medium block sm:inline mt-1 sm:mt-0"> Nous sommes là pour vous.</span>
                            </p>
                        </motion.div>

                        <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto items-start">
                            {/* Contact Info Cards */}
                            <div className="lg:col-span-5 space-y-6">
                                {/* Contact Info Cards */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-purple-500/30 transition-all duration-300 group hover:bg-slate-900/60 hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                                            <MapPin size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Siège Social</h4>
                                            <p className="text-xl text-white font-medium">{contactInfo.address}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-pink-500/30 transition-all duration-300 group hover:bg-slate-900/60 hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                                            <Mail size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Email</h4>
                                            <a href={`mailto:${contactInfo.email}`} className="text-xl text-white font-medium hover:text-pink-400 transition-colors">{contactInfo.email}</a>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 group hover:bg-slate-900/60 hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                                            <Phone size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Téléphone</h4>
                                            <a href={`tel:${contactInfo.phone}`} className="text-xl text-white font-medium hover:text-blue-400 transition-colors">{contactInfo.phone}</a>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Form */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="lg:col-span-7"
                            >
                                <div className="p-6 sm:p-10 rounded-[2.5rem] bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl -z-10" />

                                    <h3 className="text-2xl font-bold text-white mb-2">Envoyez-nous un message</h3>
                                    <p className="text-slate-400 mb-8">Remplissez le formulaire ci-dessous, nous vous répondrons très vite.</p>

                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2 group">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-purple-400 transition-colors">Prénom</label>
                                                <Input
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    className={`bg-slate-950/50 border-white/10 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 h-12 rounded-xl transition-all ${errors.firstName ? 'border-red-500' : ''}`}
                                                    placeholder="Votre prénom"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2 group">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-purple-400 transition-colors">Nom</label>
                                                <Input
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    className={`bg-slate-950/50 border-white/10 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 h-12 rounded-xl transition-all ${errors.lastName ? 'border-red-500' : ''}`}
                                                    placeholder="Votre nom"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-purple-400 transition-colors">Email</label>
                                            <Input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`bg-slate-950/50 border-white/10 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 h-12 rounded-xl transition-all ${errors.email ? 'border-red-500' : ''}`}
                                                placeholder="votre@email.com"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-purple-400 transition-colors">Message</label>
                                            <Textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                className={`bg-slate-950/50 border-white/10 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 min-h-[160px] rounded-xl resize-none transition-all ${errors.message ? 'border-red-500' : ''}`}
                                                placeholder="Comment pouvons-nous vous aider ?"
                                                required
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-14 rounded-xl text-lg font-bold shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {loading ? 'Envoi en cours...' : <span className="flex items-center gap-2">Envoyer le message <Send className="h-5 w-5" /></span>}
                                        </Button>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <footer className="py-8 bg-slate-950 text-center border-t border-white/5">
                    <p className="text-slate-500 text-sm font-medium">
                        &copy; {new Date().getFullYear()} Fbariss - Une initiative <span className="text-purple-400">PFPC</span>.
                    </p>
                </footer>

            </div >
        </Layout >
    );
};

export default ContactPage;
