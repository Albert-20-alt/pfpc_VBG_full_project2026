
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, BarChart3, ArrowRight, CheckCircle, Smartphone, Lock, Globe } from 'lucide-react';
import Layout from '@/components/Layout';

const LOGO_URL = "https://storage.googleapis.com/hostinger-horizons-assets-prod/5e35826e-25c3-4875-8798-5c8c9f39c0c4/dfc81b5213d93d1d72a68fe20443a381.png";

const HomePage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const features = [
    {
      title: "Collecte Sécurisée",
      description: "Cryptage de bout en bout pour toutes les données sensibles des victimes.",
      icon: Lock,
      color: "from-blue-400 to-cyan-300"
    },
    {
      title: "Accès Multi-Niveaux",
      description: "Gestion granulaire des permissions pour agents, administrateurs et superviseurs.",
      icon: Users,
      color: "from-purple-400 to-pink-300"
    },
    {
      title: "Analytique Puissante",
      description: "Tableaux de bord interactifs pour visualiser les tendances en temps réel.",
      icon: BarChart3,
      color: "from-amber-400 to-orange-300"
    },
    {
      title: "Support Mobile",
      description: "Interface optimisée pour une utilisation sur le terrain, même avec une connexion limitée.",
      icon: Smartphone,
      color: "from-emerald-400 to-green-300"
    },
  ];

  return (
    <Layout hideNavbar={true}>
      <div className="min-h-screen text-foreground overflow-x-hidden selection:bg-purple-500/30">

        {/* Navbar */}
        <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 h-20">
          <div className="container mx-auto px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src={LOGO_URL} alt="Logo" className="h-8 md:h-10 w-auto" />
              <span className="text-lg md:text-xl font-bold tracking-tight text-white">Fbariss</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Desktop Menu Items */}
              <div className="hidden md:flex items-center gap-8 mr-4">
                <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Fonctionnalités</a>
                <a href="#impact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Impact</a>
              </div>

              {/* Login Button - Visible on all devices */}
              <Button
                onClick={() => navigate('/login')}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm transition-all text-xs md:text-sm h-9 md:h-10 px-4"
              >
                Espace Membre
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

              <motion.div
                className="flex-1 text-center lg:text-left"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  Fbariss
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                  Unir nos forces pour un avenir <span className="gradient-text">sans violence.</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Une solution technologique avancée pour centraliser le signalement, le suivi et l'analyse des violences basées sur le genre au Sénégal.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate('/login')}
                    className="hidden sm:flex w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white h-14 px-8 rounded-full text-lg shadow-lg shadow-purple-600/25 transition-all hover:scale-105"
                  >
                    Connectez-vous ici
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/about')}
                    className="w-full sm:w-auto border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/20 hover:border-purple-400 text-white h-14 px-8 rounded-full text-lg backdrop-blur-md shadow-[0_0_15px_-3px_rgba(168,85,247,0.15)] transition-all hover:scale-105 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.3)]"
                  >
                    En savoir plus
                  </Button>
                </motion.div>
              </motion.div>

              {/* Hero Visual/Illustration */}
              <motion.div
                className="flex-1 relative w-full max-w-lg lg:max-w-none"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="relative z-10 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl p-4 md:p-6 animate-float">
                  {/* Abstract UI Representation */}
                  <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="h-2 w-20 bg-white/10 rounded-full" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400"><BarChart3 size={20} /></div>
                        <span className="text-xs text-green-400">+12%</span>
                      </div>
                      <div className="h-2 w-16 bg-white/10 rounded-full mb-2" />
                      <div className="h-8 w-24 bg-white/20 rounded-lg" />
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400"><Users size={20} /></div>
                        <span className="text-xs text-green-400">+5%</span>
                      </div>
                      <div className="h-2 w-16 bg-white/10 rounded-full mb-2" />
                      <div className="h-8 w-24 bg-white/20 rounded-lg" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-white/50">{i + 1}</div>
                        <div className="flex-1 space-y-2">
                          <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                          <div className="h-2 w-1/2 bg-white/5 rounded-full" />
                        </div>
                        <div className="h-6 w-16 bg-purple-500/20 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Decor elements behind */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-20 blur-xl -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-slate-950/50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Technologie au service de l'humain</h2>
              <p className="text-slate-400 text-lg">
                Des outils conçus pour simplifier le travail des acteurs de terrain tout en garantissant la sécurité des données.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-[1px] mb-6 transform group-hover:scale-110 transition-transform`}>
                    <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                      <feature.icon className="text-white" size={24} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats / Impact */}
        <section id="impact" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-900/10 -z-10" />
          <div className="max-w-4xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center">Un impact mesurable sur le terrain</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-3 bg-green-500/10 rounded-xl text-green-400 shrink-0">
                    <Globe size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-1">Couverture Nationale</h4>
                    <p className="text-slate-400">Déployé dans 14 régions avec des agents locaux formés.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shrink-0">
                    <Shield size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-1">Protection des Données</h4>
                    <p className="text-slate-400">Conforme aux standards internationaux de sécurité informatique.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Minimal Footer */}
        <footer className="py-12 border-t border-white/5 bg-slate-950">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} Fbariss. All rights reserved.
            </p>
            <div className="flex gap-6">
              <span onClick={() => navigate('/privacy')} className="text-slate-500 hover:text-white transition-colors text-sm cursor-pointer">Confidentialité</span>
              <span onClick={() => navigate('/terms')} className="text-slate-500 hover:text-white transition-colors text-sm cursor-pointer">Conditions</span>
              <span onClick={() => navigate('/contact')} className="text-slate-500 hover:text-white transition-colors text-sm cursor-pointer">Contact</span>
            </div>
          </div>
        </footer>

      </div>
    </Layout>
  );
};

export default HomePage;
