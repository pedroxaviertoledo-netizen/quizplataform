document.addEventListener('DOMContentLoaded', () => {
    const client = window.supabaseClient;
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const message = document.getElementById('authMessage');
    const roleSelect = document.getElementById('regRole');
    const developerPinField = document.getElementById('developerPinField');

    const showMessage = (text, type = 'error') => {
        message.textContent = text;
        message.className = `auth-message ${type}`;
    };

    const requireClient = () => {
        if (client) return true;
        showMessage('Configure a URL e a chave anon do Supabase em frontend/js/config.js.');
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
            message.textContent = '';
            message.className = 'auth-message';
        });
    });

    document.querySelectorAll('.password-toggle').forEach((button) => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.passwordTarget);
            const visible = input.type === 'text';
            input.type = visible ? 'password' : 'text';
            button.setAttribute('aria-label', visible ? 'Mostrar senha' : 'Ocultar senha');
            button.querySelector('.password-toggle-label').textContent = visible ? 'Mostrar' : 'Ocultar';
        });
    });

    roleSelect?.addEventListener('change', () => {
        const isDeveloper = roleSelect.value === 'desenvolvedor';
        developerPinField.style.display = isDeveloper ? 'block' : 'none';
        document.getElementById('developerPin').disabled = !isDeveloper;
    });

    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!requireClient()) return;
        const button = loginForm.querySelector('button[type="submit"]');
        button.disabled = true;
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
        } finally {
            button.disabled = false;
        }
    });

    registerForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!requireClient()) return;
        const button = registerForm.querySelector('button[type="submit"]');
        button.disabled = true;
        try {
            const { data, error } = await client.auth.signUp({
                email: document.getElementById('regEmail').value.trim(),
                password: document.getElementById('regSenha').value,
                options: {
                    data: {
                        full_name: document.getElementById('regNome').value.trim(),
                        role: roleSelect.value
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
        } finally {
            button.disabled = false;
        }
    });
