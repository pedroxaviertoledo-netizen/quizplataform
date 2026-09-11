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
});document.addEventListener('DOMContentLoaded', () => {
    // Busca o formulário de cadastro pelo ID ou tag
    const cadastroForm = document.getElementById('cadastroForm') || document.querySelector('form:not(#loginForm)');
    
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Bloqueia o recarregamento da página

            // Coleta os valores reais digitados pelo usuário no Chromebook
            const nomeInput = document.querySelector('input[placeholder*="Nome"]') || document.getElementById('nome');
            const emailInput = document.querySelector('input[type="email"]') || document.getElementById('email');
            const passwordInput = document.querySelector('input[type="password"]') || document.getElementById('senha');
            
            // Coleta o cargo selecionado (Estudante / Professor / Desenvolvedor)
            const cargoSelect = document.querySelector('select') || document.querySelector('input[name="role"]:checked');
            const cargoValue = cargoSelect ? cargoSelect.value : 'Estudante';

            if (!emailInput || !passwordInput) {
                alert("Campos de e-mail ou senha não encontrados.");
                return;
            }

            // Usa a instância local do Supabase instalada no passo anterior
            const client = window.supabase;

            if (client) {
                try {
                    // Executa a criação real da conta na nuvem do Supabase
                    const { data, error } = await client.auth.signUp({
                        email: emailInput.value,
                        password: passwordInput.value,
                        options: {
                            data: {
                                full_name: nomeInput ? nomeInput.value : '',
                                role: cargoValue
                            }
                        }
                    });

                    if (error) throw error;

                    alert('Conta criada com sucesso! Você já pode tentar acessar a plataforma.');
                    
                    // Limpa os campos da tela e reseta a URL retirando os dados salvos
                    cadastroForm.reset();
                    window.history.replaceState({}, document.title, window.location.pathname);
                    
                } catch (error) {
                    console.error('Erro no Cadastro:', error.message);
                    alert('Erro ao criar conta: ' + error.message);
                }
            } else {
                alert("Erro: O sistema de banco de dados não foi inicializado corretamente.");
            }
        });
    }
});
