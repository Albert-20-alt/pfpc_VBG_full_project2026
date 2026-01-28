const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const api = {
    // Users
    getMe: async () => {
        const res = await fetch(`${API_URL}/users/me`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch user profile');
        return res.json();
    },

    getUsers: async () => {
        const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
    },

    createUser: async (userData) => {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        });
        if (!res.ok) {
            const error = await res.json();
            const errorMessage = error.details
                ? `${error.error}: ${error.details.join(', ')}`
                : (error.error || 'Failed to create user');
            throw new Error(errorMessage);
        }
        return res.json();
    },

    updateUser: async (id, userData) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        });
        if (!res.ok) {
            const error = await res.json();
            const errorMessage = error.details
                ? `${error.error}: ${error.details.join(', ')}`
                : (error.error || 'Failed to update user');
            throw new Error(errorMessage);
        }
        return res.json();
    },

    deleteUser: async (id) => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to delete user');
        }
        return res.json();
    },

    // Cases
    getCases: async () => {
        const res = await fetch(`${API_URL}/cases`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch cases');
        return res.json();
    },

    createCase: async (caseData) => {
        const res = await fetch(`${API_URL}/cases`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(caseData)
        });
        if (!res.ok) throw new Error('Failed to create case');
        return res.json();
    },

    updateCase: async (id, caseData) => {
        const res = await fetch(`${API_URL}/cases/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(caseData)
        });
        if (!res.ok) throw new Error('Failed to update case');
        return res.json();
    },

    deleteCase: async (id) => {
        const res = await fetch(`${API_URL}/cases/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete case');
        return res.json();
    },

    // Tasks
    getTasks: async () => {
        const res = await fetch(`${API_URL}/tasks`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch tasks');
        return res.json();
    },

    createTask: async (taskData) => {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(taskData)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create task');
        }
        return res.json();
    },

    updateTask: async (id, taskData) => {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(taskData)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to update task');
        }
        return res.json();
    },

    deleteTask: async (id) => {
        const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete task');
        return res.json();
    },

    // Resources
    getResources: async () => {
        const res = await fetch(`${API_URL}/resources`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch resources');
        return res.json();
    },

    createResource: async (formData) => {
        // Note: Content-Type header is NOT set manually for FormData, browser sets it with boundary
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/resources`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: formData
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create resource');
        }
        return res.json();
    },

    deleteResource: async (id) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/resources/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        });
        if (!res.ok) throw new Error('Failed to delete resource');
        return res.json();
    },

    // Messages
    sendMessage: async (data) => {
        const res = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to send message');
        }
        return res.json();
    },

    getMessages: async () => {
        const res = await fetch(`${API_URL}/messages`, { headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
    },

    markMessageRead: async (id) => {
        const res = await fetch(`${API_URL}/messages/${id}/read`, {
            method: 'PUT',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to update message');
        return res.json();
    },

    deleteMessage: async (id) => {
        const res = await fetch(`${API_URL}/messages/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete message');
        return res.json();
    },

    // Contact Info
    getContactInfo: async () => {
        const res = await fetch(`${API_URL}/contact-info`);
        if (!res.ok) throw new Error('Failed to fetch contact info');
        return res.json();
    },

    updateContactInfo: async (data) => {
        const res = await fetch(`${API_URL}/contact-info`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update contact info');
        return res.json();
    },

    // Site Content
    getContent: async (key) => {
        const res = await fetch(`${API_URL}/content/${key}`);
        if (!res.ok) throw new Error('Failed to fetch content');
        return res.json();
    },

    updateContent: async (key, content) => {
        const res = await fetch(`${API_URL}/content/${key}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ content })
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to update content');
        }
        return res.json();
    },

    // Settings
    getSettings: async () => {
        const res = await fetch(`${API_URL}/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        return res.json();
    },

    // Documents (Real Case Evidence)
    createDocument: async (formData) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/documents`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: formData
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to upload document');
        }
        return res.json();
    },
    // Generic Upload
    uploadFile: async (formData) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: formData
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to upload file');
        }
        return res.json();
    }
};
