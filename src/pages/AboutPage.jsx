import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Heart, Shield, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import communityImage from '@/assets/senegalese_community_solidarity.jpg';

const AboutPage = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <Layout hideNavbar={true}>
            <div className="min-h-screen text-foreground overflow-x-hidden selection:bg-purple-500/30">

                {/* Navbar / Header */}
                <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 h-20">
                    <div className="container mx-auto px-6 h-full flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                                <ArrowLeft size={24} />
                            </Button>
                            <span className="hidden sm:inline text-xl font-bold tracking-tight text-white">Retour à l'accueil</span>
                        </div>
                        <div className="flex items-center gap-8">
                            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Fbariss</span>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-20 overflow-hidden text-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

                    <div className="container mx-auto px-6">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white leading-tight"
                        >
                            Notre Mission : <span className="gradient-text block sm:inline mt-2 sm:mt-0">Protéger & Agir</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
                        >
                            Fbariss est née de la volonté de centraliser et d'optimiser la lutte contre les Violences Basées sur le Genre au Sénégal à travers une technologie sécurisée et inclusive.
                        </motion.p>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 bg-slate-950/50">
                    <div className="container mx-auto px-6">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid md:grid-cols-3 gap-8"
                        >
                            <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Target size={100} />
                                </div>
                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 mb-6">
                                    <Target size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Impact Ciblé</h3>
                                <p className="text-slate-400">
                                    Nous utilisons les données pour identifier les zones à risque et diriger les ressources là où elles sont le plus nécessaires.
                                </p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Shield size={100} />
                                </div>
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-6">
                                    <Shield size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Confidentialité Totale</h3>
                                <p className="text-slate-400">
                                    La sécurité des victimes est notre priorité absolue. Nos protocoles de cryptage garantissent l'anonymat et la protection des données.
                                </p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Heart size={100} />
                                </div>
                                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400 mb-6">
                                    <Heart size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Soutien Humain</h3>
                                <p className="text-slate-400">
                                    Derrière chaque donnée, il y a une vie. Notre plateforme soutient les travailleurs sociaux et les agents de terrain dans leur mission d'accompagnement.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Story / Context Section */}
                <section className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="glass-effect rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1 space-y-6">
                                <h2 className="text-3xl font-bold text-white mb-4">L'Initiative PFPC</h2>
                                <p className="text-slate-300 leading-relaxed">
                                    La <strong>Plateforme des Femmes pour la Paix en Casamance (PFPC)</strong> œuvre depuis des années pour la paix et la sécurité. Fbariss est l'aboutissement de notre engagement numérique.
                                </p>
                                <p className="text-slate-300 leading-relaxed">
                                    Face à la fragmentation des informations et à la difficulté de coordonner les actions sur le terrain, nous avons conçu cet outil pour unifier les forces de tous les acteurs : ONG, État, et société civile.
                                </p>
                                <div className="pt-4">
                                    <Button className="bg-white text-purple-900 hover:bg-slate-200" onClick={() => navigate('/contact')}>
                                        Rejoindre le mouvement
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl -z-10" />
                                <img
                                    src={communityImage}
                                    alt="Femmes sénégalaises en cercle de solidarité"
                                    className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-white/5 bg-slate-950 text-center">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Fbariss - Une initiative PFPC.
                    </p>
                </footer>

            </div>
        </Layout>
    );
};

export default AboutPage;
