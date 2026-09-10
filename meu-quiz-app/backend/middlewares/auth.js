/**
 * SISTEMA DE AUTENTICAÇÃO DO SUPABASE (auth.js)
 * Substitui o sistema antigo de JWT por chamadas diretas na nuvem.
 */

// 1. FUNÇÃO DE CADASTRO (SIGN UP)
// Use esta função no formulário onde novos usuários se registram
async function cadastrarUsuario(email, password, nome, cargo) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                // Guarda o nome e o cargo (professor/aluno) dentro dos metadados do usuário
                data: {
                    full_name: nome,
                    role: cargo // Pode ser 'aluno', 'professor' ou 'desenvolvedor'
                }
            }
        });

        if (error) throw error;

        alert('Cadastro realizado com sucesso! Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada.');
        return data;
    } catch (error) {
        console.error('Erro no cadastro:', error.message);
        alert('Erro ao cadastrar: ' + error.message);
    }
}

// 2. FUNÇÃO DE LOGIN (SIGN IN)
// Substitui a rota antiga que dava erro 405
async function realizarLogin(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        alert('Bem-vindo(a) de volta!');
        
        // Verifica o cargo do usuário para saber para onde redirecionar
        const cargo = data.user.user_metadata.role;
        if (cargo === 'professor' || cargo === 'desenvolvedor') {
            window.location.href = 'painel-professor.html'; // Altere para a sua página de professor
        } else {
            window.location.href = 'quiz.html'; // Altere para a página de jogar o quiz
        }

    } catch (error) {
        console.error('Erro no login:', error.message);
        alert('Erro de autenticação: ' + error.message);
    }
}

// 3. FUNÇÃO DE LOGOUT (SAIR)
async function fazerLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert('Erro ao sair: ' + error.message);
    } else {
        window.location.href = 'index.html'; // Manda de volta para a tela inicial
    }
}

// 4. PROTETOR DE ROTAS (Substitui o 'verifyToken' e 'isTeacherOrDev')
// Roda automaticamente em páginas protegidas para bloquear acessos indevidos
async function verificarAcessoProtegido(exigirProfessor = false) {
    // Busca o usuário logado na sessão atual do navegador
    const { data: { user }, error } = await supabase.auth.getUser();

    // Se não tiver usuário logado, barra na hora
    if (error || !user) {
        alert('Acesso negado. Por favor, faça login.');
        window.location.href = 'index.html';
        return;
    }

    // Se a página exigir nível de Professor/Dev, valida os metadados
    if (exigirProfessor) {
        const cargo = user.user_metadata.role;
        if (cargo !== 'professor' && cargo !== 'desenvolvedor') {
            alert('Acesso restrito. Apenas professores ou desenvolvedores possuem permissão aqui.');
            window.location.href = 'quiz.html'; // Manda o aluno de volta para a área dele
        }
    }
}

// Expõe as funções globalmente para que seus formulários HTML consigam chamá-las
window.cadastrarUsuario = cadastrarUsuario;
window.realizarLogin = realizarLogin;
window.fazerLogout = fazerLogout;
window.verificarAcessoProtegido = verificarAcessoProtegido;
