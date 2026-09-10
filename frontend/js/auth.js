document.addEventListener('DOMContentLoaded', () => {
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
