function esc(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function normalizarTexto(valor) {
    return String(valor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function rotuloPerfil(role) {
    return role === 'desenvolvedor' ? 'Desenvolvedor' : role === 'professor' ? 'Professor' : 'Estudante';
}

function renderizarGraficoAcesso(dados) {
    const container = document.getElementById('accessChart');
    if (!container) return;

    const maximo = Math.max(...dados.map((item) => item.valor), 1);
    container.innerHTML = dados.map((item) => `
        <div class="bar-item">
            <span class="bar-label">${item.dia}</span>
            <div class="bar-track">
                <span class="bar-fill" style="height: ${(item.valor / maximo) * 100}%"></span>
            </div>
            <strong>${item.valor}</strong>
        </div>
    `).join('');
}

function renderizarMetas(metas) {
    const container = document.getElementById('goalsList');
    if (!container) return;

    container.innerHTML = metas.map((meta) => {
        const percentual = Math.min(100, Math.max(0, meta.progresso));
        return `
            <div class="goal-item">
                <div class="goal-header">
                    <span>${meta.nome}</span>
                    <strong>${meta.valor}</strong>
                </div>
                <div class="goal-track"><span style="width: ${percentual}%"></span></div>
                <small>${meta.meta}</small>
            </div>
        `;
    }).join('');
}

async function carregarResumo() {
    try {
        const overview = await apiRequest('/desenvolvedor/overview');
        document.getElementById('summaryUsers').textContent = overview.totalUsuarios ?? 0;
        document.getElementById('summaryStudents').textContent = overview.estudantes ?? 0;
        document.getElementById('summaryTeachers').textContent = overview.professores ?? 0;
        document.getElementById('summaryDevelopers').textContent = overview.desenvolvedores ?? 0;
        document.getElementById('summaryQuizzes').textContent = overview.quizzesAtivos ?? 0;

        document.getElementById('metricAccess').textContent = overview.acessosHoje ?? 0;
        document.getElementById('metricAccessMeta').textContent = `Meta: ${overview.metaAcessos ?? 50}`;
        document.getElementById('metricAccuracy').textContent = `${overview.taxaAcerto ?? 0}%`;
        document.getElementById('metricAccuracyMeta').textContent = `Meta: ${overview.metaAcerto ?? 70}%`;
        document.getElementById('metricCompletion').textContent = `${overview.taxaConclusao ?? 0}%`;
        document.getElementById('metricCompletionMeta').textContent = `Meta: ${overview.metaConclusao ?? 80}%`;
        document.getElementById('metricXp').textContent = overview.xpTotal ?? 0;
        document.getElementById('metricXpMeta').textContent = `Meta: ${overview.metaXp ?? 2000}`;

        renderizarGraficoAcesso(overview.acessoSemanal || []);

        renderizarMetas(overview.metas || []);
    } catch (erro) {
        console.error('Erro ao carregar resumo do desenvolvedor:', erro);
    }
}

async function carregarUsuarios() {
    const lista = document.getElementById('userList');
    const termo = document.getElementById('userSearch')?.value.trim() || '';
    const role = document.getElementById('userRoleFilter')?.value || 'todos';

    try {
        const usuarios = await apiRequest('/users');
        const filtrados = usuarios.filter((usuario) => {
            const perfil = usuario.role || 'estudante';
            const matchRole = role === 'todos' || perfil === role;
            const matchTexto = !termo || normalizarTexto(`${usuario.nome} ${usuario.email}`).includes(normalizarTexto(termo));
            return matchRole && matchTexto;
        });

        lista.innerHTML = filtrados.length ? filtrados.map((usuario) => `
            <article class="user-item">
                <div>
                    <span class="activity-category">${rotuloPerfil(usuario.role)}</span>
                    <h3>${esc(usuario.nome)}</h3>
                    <p>${esc(usuario.email)}</p>
                </div>
                <div class="user-meta">
                    <span>${Number(usuario.pontos || 0)} pts</span>
                    <span>${Number(usuario.xp || 0)} XP</span>
                </div>
            </article>
        `).join('') : '<p class="empty-state">Nenhum usuário encontrado.</p>';
    } catch (erro) {
        lista.innerHTML = `<p class="auth-message error">${esc(erro.message)}</p>`;
    }
}

async function carregarFeedbacks() {
    const lista = document.getElementById('feedbackList');
    const termo = document.getElementById('feedbackSearch')?.value.trim() || '';
    const statusFiltro = document.getElementById('feedbackStatusFilter')?.value || 'todos';

    try {
        const feedbacks = await apiRequest('/feedbacks');
        const total = feedbacks.length;
        const emAberto = feedbacks.filter((item) => item.status === 'aberto').length;
        const resolvidos = feedbacks.filter((item) => item.status === 'resolvido').length;

        document.getElementById('feedbackTotal').textContent = total;
        document.getElementById('feedbackOpen').textContent = emAberto;
        document.getElementById('feedbackResolved').textContent = resolvidos;

        const filtrados = feedbacks.filter((item) => {
            const matchStatus = statusFiltro === 'todos' || item.status === statusFiltro;
            const matchTexto = !termo || normalizarTexto(`${item.nome} ${item.email} ${item.mensagem}`).includes(normalizarTexto(termo));
            return matchStatus && matchTexto;
        });

        lista.innerHTML = filtrados.length ? filtrados.map((item) => `
            <article class="feedback-item">
                <div>
                    <span class="activity-category">${item.status === 'aberto' ? 'Em aberto' : 'Resolvido'}</span>
                    <h3>${esc(item.nome)} · ${esc(item.email)}</h3>
                    <p>${esc(item.mensagem)}</p>
                    <small>${new Date(item.criadoEm).toLocaleString('pt-BR')}</small>
                </div>
                <button class="btn-secondary" data-feedback="${item._id}" data-status="${item.status === 'aberto' ? 'resolvido' : 'aberto'}">${item.status === 'aberto' ? 'Resolver' : 'Reabrir'}</button>
            </article>
        `).join('') : '<p class="empty-state">Nenhum feedback encontrado.</p>';

        lista.querySelectorAll('[data-feedback]').forEach((button) => button.addEventListener('click', async () => {
            await apiRequest(`/feedbacks/${button.dataset.feedback}`, 'PATCH', { status: button.dataset.status });
            carregarFeedbacks();
        }));
    } catch (erro) {
        lista.innerHTML = `<p class="auth-message error">${esc(erro.message)}</p>`;
    }
}

document.getElementById('refreshFeedbacks')?.addEventListener('click', carregarFeedbacks);
document.getElementById('feedbackSearch')?.addEventListener('input', carregarFeedbacks);
document.getElementById('feedbackStatusFilter')?.addEventListener('change', carregarFeedbacks);
document.getElementById('userSearch')?.addEventListener('input', carregarUsuarios);
document.getElementById('userRoleFilter')?.addEventListener('change', carregarUsuarios);

carregarResumo();
carregarUsuarios();
carregarFeedbacks();
