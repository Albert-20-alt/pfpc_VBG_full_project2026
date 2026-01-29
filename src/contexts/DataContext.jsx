import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [cases, setCases] = useState([]);
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    // Load data from API - memoized
    const loadData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [fetchedUsers, fetchedCases, fetchedTasks] = await Promise.all([
                api.getUsers().catch(err => { console.error("Failed to load users", err); return []; }),
                api.getCases().catch(err => { console.error("Failed to load cases", err); return []; }),
                api.getTasks().catch(err => { console.error("Failed to load tasks", err); return []; })
            ]);
            setUsers(fetchedUsers || []);
            setCases(fetchedCases || []);
            setTasks(fetchedTasks || []);
        } catch (error) {
            console.error("Error loading data:", error);
            toast({ title: "Erreur de chargement", description: "Impossible de charger les données.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [loadData, user]);

    // Case Management - memoized
    const addCase = useCallback(async (newCase) => {
        try {
            const createdCase = await api.createCase(newCase);
            setCases(prev => [createdCase, ...prev]);
            toast({ title: "Succès", description: "Cas créé avec succès." });
            return createdCase;
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Impossible de créer le cas.", variant: "destructive" });
        }
    }, []);

    const updateCase = useCallback(async (id, updatedData) => {
        try {
            const updated = await api.updateCase(id, updatedData);
            setCases(prev => prev.map(c => c.id === id ? updated : c));
            toast({ title: "Succès", description: "Cas mis à jour." });
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Impossible de mettre à jour le cas.", variant: "destructive" });
        }
    }, []);

    const deleteCase = useCallback(async (id) => {
        try {
            await api.deleteCase(id);
            setCases(prev => prev.filter(c => c.id !== id));
            toast({ title: "Succès", description: "Cas supprimé." });
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Impossible de supprimer le cas.", variant: "destructive" });
        }
    }, []);

    // User Management - memoized
    const addUser = useCallback(async (newUser) => {
        try {
            const createdUser = await api.createUser(newUser);
            setUsers(prev => [createdUser, ...prev]);
            return createdUser;
        } catch (error) {
            console.error("Error adding user:", error);
            toast({ title: "Erreur", description: error.message || "Impossible de créer l'utilisateur.", variant: "destructive" });
            throw error;
        }
    }, []);

    const updateUser = useCallback(async (id, updatedData) => {
        try {
            const updated = await api.updateUser(id, updatedData);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
            return updated;
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Impossible de mettre à jour l'utilisateur.", variant: "destructive" });
            throw error;
        }
    }, []);

    const deleteUser = useCallback(async (id) => {
        try {
            await api.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            toast({ title: "Succès", description: "Utilisateur supprimé." });
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: error.message || "Impossible de supprimer l'utilisateur.", variant: "destructive" });
        }
    }, []);

    // Task Management - memoized
    const addTask = useCallback(async (newTask) => {
        try {
            const createdTask = await api.createTask(newTask);
            setTasks(prev => [...prev, createdTask]);
            return createdTask;
        } catch (error) {
            console.error("Error creating task:", error);
            toast({ title: "Erreur", description: "Impossible de créer la tâche.", variant: "destructive" });
            throw error;
        }
    }, []);

    const updateTask = useCallback(async (id, updatedData) => {
        try {
            const updatedTask = await api.updateTask(id, updatedData);
            setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
            return updatedTask;
        } catch (error) {
            console.error("Error updating task:", error);
            toast({ title: "Erreur", description: "Impossible de mettre à jour la tâche.", variant: "destructive" });
            throw error;
        }
    }, []);

    const deleteTask = useCallback(async (id) => {
        try {
            await api.deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Error deleting task:", error);
            toast({ title: "Erreur", description: "Impossible de supprimer la tâche.", variant: "destructive" });
            throw error;
        }
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        cases,
        users,
        tasks,
        loading,
        refreshData: loadData,
        addCase,
        updateCase,
        deleteCase,
        addUser,
        updateUser,
        deleteUser,
        addTask,
        updateTask,
        deleteTask
    }), [cases, users, tasks, loading, loadData, addCase, updateCase, deleteCase, addUser, updateUser, deleteUser, addTask, updateTask, deleteTask]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
