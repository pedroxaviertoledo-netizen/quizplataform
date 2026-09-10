// Funções de requisição à API

class API {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    get(endpoint, options) {
        return this.request(endpoint, { method: 'GET', ...options });
    }

    post(endpoint, data, options) {
        return this.request(endpoint, { method: 'POST', body: JSON.stringify(data), ...options });
    }

    put(endpoint, data, options) {
        return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data), ...options });
    }

    delete(endpoint, options) {
        return this.request(endpoint, { method: 'DELETE', ...options });
    }
}

const api = new API(API_BASE_URL);
