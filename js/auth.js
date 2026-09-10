// Funções de autenticação

class Auth {
    constructor() {
        this.user = null;
        this.token = localStorage.getItem('token');
    }

    isAuthenticated() {
        return !!this.token;
    }

    getToken() {
        return this.token;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            this.setToken(response.token);
            this.user = response.user;
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async logout() {
        this.clearToken();
        this.user = null;
    }

    async register(email, password, name) {
        try {
            const response = await api.post('/auth/register', { email, password, name });
            this.setToken(response.token);
            this.user = response.user;
            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }
}

const auth = new Auth();
