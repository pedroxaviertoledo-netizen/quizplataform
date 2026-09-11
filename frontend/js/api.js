const API_URL = window.QUIZ_API_URL
    ? `${window.QUIZ_API_URL.replace(/\/$/, '')}/api`
    : null;

/**
 * Função central para realizar requisições à API.
 * Gerencia tokens de autenticação e trata erros comuns.
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
    if (!API_URL) {
        throw new Error('A API de quizzes ainda não foi configurada. Configure uma URL de backend em window.QUIZ_API_URL.');
    }

    const token = localStorage.getItem('token');
    
    const headers = { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    // Injeta o token de segurança se o usuário estiver logado
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };
    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json().catch(() => ({}));

        // Se o token expirou ou for inválido, desloga o usuário por segurança
        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = 'index.html';
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        if (!response.ok) {
            throw new Error(data.erro || 'Erro desconhecido na requisição');
        }

        return data;
    } catch (err) {
        if (err instanceof TypeError && err.message.includes('fetch')) {
            throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está ativo.');
        }
        console.error(`Erro na API (${endpoint}):`, err);
        throw err; // Repassa o erro para ser tratado na tela
    }
}