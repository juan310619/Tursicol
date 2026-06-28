// Gestión de Autenticación TurisCol
const API_URL = 'http://localhost:4000/api';

const auth = {
    saveAuth(token, user) {
        localStorage.setItem('turiscol_token', token);
        localStorage.setItem('turiscol_user', JSON.stringify(user));
    },
    getToken() { return localStorage.getItem('turiscol_token'); },
    getUser() { 
        const user = localStorage.getItem('turiscol_user');
        return user ? JSON.parse(user) : null;
    },
    logout() { 
        localStorage.removeItem('turiscol_token'); 
        localStorage.removeItem('turiscol_user');
        window.location.href = 'index.html'; 
    },
    isAuthenticated() { return !!this.getToken(); },
    checkAuth() { if (!this.isAuthenticated()) window.location.href = 'login.html'; },
    
    async fetch(endpoint, options = {}) {
        const token = this.getToken();
        const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await fetch(`${API_URL}${formattedEndpoint}`, { ...options, headers });
        if (response.status === 401 && !endpoint.includes('/auth/login')) this.logout();
        return response;
    }
};
