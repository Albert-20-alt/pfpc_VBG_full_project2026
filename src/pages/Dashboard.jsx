
import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AgentDashboard from '@/pages/Agent/AgentDashboard';
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import SuperAdminDashboard from '@/pages/SuperAdmin/SuperAdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    // This should ideally not happen due to ProtectedRoute, but as a fallback:
    navigate('/login');
    return null; 
  }

  const renderDashboardByRole = () => {
    switch (user.role) {
      case 'agent':
        return <AgentDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'super-admin':
        return <SuperAdminDashboard />;
      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold gradient-text">Bienvenue</h1>
            <p className="text-white/70 mt-1">Rôle utilisateur non reconnu. Veuillez contacter l'administrateur.</p>
          </motion.div>
        );
    }
  };

  return <Layout>{renderDashboardByRole()}</Layout>;
};

export default Dashboard;
