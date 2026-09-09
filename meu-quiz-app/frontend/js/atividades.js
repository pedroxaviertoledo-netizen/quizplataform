function renderizarAtividade(atividade, concluida) {
    const data = new Date(atividade.concluidaEm || atividade.enviadaEm).toLocaleDateString('pt-BR');
    return `<article class="activity-item"><div><span class="activity-category">${concluida ? 'Concluída' : 'Nova atividade'}</span><h3>${atividade.titulo}</h3><p>Compartilhado por ${atividade.remetente} em ${data}.</p></div>${concluida ? '<span class="activity-check">OK</span>' : `<a class="btn-accent" href="jogar.html?id=${encodeURIComponent(atividade.quizId)}&atividade=${encodeURIComponent(atividade._id)}">Começar</a>`}</article>`;
}
async function carregarAtividades() {
    try {
        const atividades = await apiRequest('/atividades');
        const pendentes = atividades.filter((item) => item.status !== 'concluida');
        const concluidas = atividades.filter((item) => item.status === 'concluida');
        document.getElementById('pendingCount').textContent = pendentes.length;
        document.getElementById('completedCount').textContent = concluidas.length;
        document.getElementById('pendingActivities').innerHTML = pendentes.length ? pendentes.map((item) => renderizarAtividade(item, false)).join('') : '<p class="empty-state">Nenhuma atividade pendente.</p>';
        document.getElementById('completedActivities').innerHTML = concluidas.length ? concluidas.map((item) => renderizarAtividade(item, true)).join('') : '<p class="empty-state">Nenhuma atividade concluída.</p>';
    } catch (erro) {
        document.getElementById('pendingActivities').innerHTML = `<p class="auth-message error">${erro.message}</p>`;
    }
}
carregarAtividades();