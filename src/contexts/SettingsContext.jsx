import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await api.getSettings();
            // Flatten the settings if they come wrapped or process as needed
            // Based on SystemSettingsPage, the API returns the object directly
            const { createdAt, updatedAt, key, ...userSettings } = data;
            setSettings(userSettings);
        } catch (error) {
            console.error("Failed to load global settings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    // Effect to update Favicon
    useEffect(() => {
        if (settings.faviconUrl) {
            const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'icon';
            // Determine if the URL is absolute or relative
            const baseUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

            // Check if faviconUrl already contains http
            let href = settings.faviconUrl;
            if (!href.startsWith('http')) {
                href = `${baseUrl}${settings.faviconUrl}`;
            }

            link.href = href;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [settings.faviconUrl]);

    const value = {
        settings,
        loading,
        refreshSettings: loadSettings
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
