if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

function initAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authMessage = document.getElementById('authMessage');
    const tabs = document.querySelectorAll('.auth-tab');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    const roleSelect = document.getElementById('regRole');
    const developerPinField = document.getElementById('developerPinField');
    const developerPinInput = document.getElementById('developerPin');

    const syncDeveloperPinField = () => {
        if (!developerPinField || !developerPinInput || !roleSelect) return;
        const isDeveloper = roleSelect.value === 'desenvolvedor';

        developerPinField.style.display = isDeveloper ? 'grid' : 'none';
        developerPinField.hidden = !isDeveloper;
        developerPinInput.style.display = isDeveloper ? 'block' : 'none';
        developerPinInput.hidden = !isDeveloper;
        developerPinInput.disabled = !isDeveloper;
        developerPinInput.required = isDeveloper;

        if (!isDeveloper) {
            developerPinInput.value = '';
        }
    };

    const showMessage = (message, type = 'error') => {
        if (!authMessage) return;
        authMessage.textContent = message;
        authMessage.className = `auth-message ${type}`;
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const isLogin = tab.dataset.form === 'loginForm';
            tabs.forEach((item) => item.classList.toggle('is-active', item === tab));
            loginForm.hidden = !isLogin;
            registerForm.hidden = isLogin;
            if (registerForm && !isLogin) {
                syncDeveloperPinField();
            }
            showMessage('');
        });
    });

    passwordToggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const input = document.getElementById(toggle.dataset.passwordTarget);
            const isVisible = input.type === 'text';
            input.type = isVisible ? 'password' : 'text';
            toggle.querySelector('.password-toggle-label').textContent = isVisible ? 'Mostrar' : 'Ocultar';
            toggle.setAttribute('aria-label', isVisible ? 'Mostrar senha' : 'Ocultar senha');
        });
    });

    roleSelect?.addEventListener('change', syncDeveloperPinField);
    syncDeveloperPinField();

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            try {
                const res = await apiRequest('/auth/login', 'POST', { email, senha });
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                window.location.href = 'dashboard.html';
            } catch (err) {
                showMessage(err.message);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('regNome').value;
            const email = document.getElementById('regEmail').value;
            const senha = document.getElementById('regSenha').value;
            const role = document.getElementById('regRole').value;
            const developerPin = document.getElementById('developerPin')?.value.trim().toUpperCase();

            try {
                await apiRequest('/auth/register', 'POST', { nome, email, senha, role, developerPin });
                registerForm.reset();
                document.querySelector('[data-form="loginForm"]')?.click();
                showMessage('Conta cadastrada com sucesso. Agora entre com seus dados.', 'success');
            } catch (err) {
                showMessage(err.message);
            }
        });
    }
}

function toggleDarkMode() {
    const darkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}