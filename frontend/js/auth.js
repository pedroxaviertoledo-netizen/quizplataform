document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form') || document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o '?' com dados confidenciais na URL
            
            const emailInput = document.getElementById('email') || document.querySelector('input[type="email"]');
            const passwordInput = document.getElementById('senha') || document.getElementById('password') || document.querySelector('input[type="password"]');
            
            if (!emailInput || !passwordInput) return;

            // Usa o cliente Supabase global já criado no seu HTML original
            const client = window.supabase;

            if (client) {
                try {
                    const { data, error } = await client.auth.signInWithPassword({
                        email: emailInput.value,
                        password: passwordInput.value
                    });

                    if (error) throw error;
                    alert('Bem-vindo(a) de volta à Quiz Platform!');
                    window.location.href = 'dashboard.html';
                } catch (error) {
                    console.error('Erro de Login:', error.message);
                    alert('Erro de autenticação: ' + error.message);
                }
            } else {
                console.error("Aguardando inicialização do cliente Supabase...");
            }
        });
    }
});
