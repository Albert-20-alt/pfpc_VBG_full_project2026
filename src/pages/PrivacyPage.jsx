import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Edit } from 'lucide-react';
import Layout from '@/components/Layout';

import { api } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

const PrivacyPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await api.getContent('privacy_policy');
                if (data && data.content) {
                    setContent(data.content);
                    setLastUpdated(data.updatedAt);
                }
            } catch (err) {
                console.error("Failed to fetch privacy policy", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    return (
        <Layout hideNavbar={true}>
            <div className="min-h-screen text-foreground overflow-x-hidden selection:bg-purple-500/30">

                {/* Navbar */}
                <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 h-20">
                    <div className="container mx-auto px-6 h-full flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                                <ArrowLeft size={24} />
                            </Button>
                            <span className="hidden sm:inline text-xl font-bold tracking-tight text-white">Retour</span>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-8">
                            {user?.role === 'super-admin' && (
                                <Button
                                    onClick={() => navigate('/superadmin/privacy')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2 h-9 px-3 sm:h-10 sm:px-4 text-xs sm:text-sm"
                                >
                                    <Edit size={16} />
                                    <span className="hidden sm:inline">Modifier</span>
                                </Button>
                            )}
                            <span className="text-lg sm:text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Fbariss</span>
                        </div>
                    </div>
                </nav>

                <section className="pt-28 sm:pt-32 pb-20">
                    <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 sm:mb-12 text-center"
                        >
                            <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-purple-500/10 rounded-2xl mb-4 sm:mb-6 text-purple-400">
                                <Shield className="h-10 w-10 sm:h-12 sm:w-12" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">Politique de Confidentialité</h1>
                            <p className="text-slate-400 text-sm sm:text-lg">Dernière mise à jour : {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                        </motion.div>

                        <div className="bg-slate-900/50 p-6 sm:p-8 md:p-12 rounded-3xl border border-white/5 backdrop-blur-sm min-h-[400px]">
                            {loading ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                                </div>
                            ) : (
                                <div
                                    className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed space-y-6"
                                    dangerouslySetInnerHTML={{ __html: content || '<p>Aucun contenu disponible pour le moment.</p>' }}
                                />
                            )}
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

export default PrivacyPage;
