document.addEventListener('DOMContentLoaded', () => {
    const client = window.supabaseClient;
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const message = document.getElementById('authMessage');
    const roleSelect = document.getElementById('regRole');

    const showMessage = (text, type = 'error') => {
        if (!message) return;
        message.textContent = text;
        message.className = `auth-message ${type}`;
    };

    const requireClient = () => {
        if (client) return true;
        showMessage('O cliente Supabase não foi carregado. Recarregue a página e tente novamente.');
        return false;
    };

    const saveSession = (session) => {
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'estudante',
            roles: [session.user.user_metadata?.role || 'estudante']
        }));
    };

    document.querySelectorAll('.auth-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            const showRegister = tab.dataset.form === 'registerForm';
            loginForm.hidden = showRegister;
            registerForm.hidden = !showRegister;
            document.querySelectorAll('.auth-tab').forEach((item) => item.classList.toggle('is-active', item === tab));
            showMessage('');
        });
    });

    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!requireClient()) return;
        try {
            const { data, error } = await client.auth.signInWithPassword({
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('senha').value
            });
            if (error) throw error;
            saveSession(data.session);
            window.location.href = 'dashboard.html';
        } catch (error) {
            showMessage(error.message || 'Não foi possível entrar.');
        }
    });

    registerForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!requireClient()) return;
        try {
            const { data, error } = await client.auth.signUp({
                email: document.getElementById('regEmail').value.trim(),
                password: document.getElementById('regSenha').value,
                options: {
                    data: {
                        full_name: document.getElementById('regNome').value.trim(),
                        role: roleSelect?.value || 'estudante'
                    }
                }
            });
            if (error) throw error;
            if (data.session) {
                saveSession(data.session);
                window.location.href = 'dashboard.html';
                return;
            }
            registerForm.reset();
            showMessage('Conta criada. Confirme seu e-mail para entrar.', 'success');
        } catch (error) {
            showMessage(error.message || 'Não foi possível criar a conta.');
        }
    });
});
