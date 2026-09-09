function formatarTempo(ms) {
    const segundos = Math.round((Number(ms) || 0) / 1000);
    return `${Math.floor(segundos / 60)}m ${String(segundos % 60).padStart(2, '0')}s`;
}
function escapeTeacherText(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function renderizarResultadoProfessor(atividade) {
    const respostas = atividade.resultado.respostas || [];
    const linhas = respostas.length ? respostas.map((resposta) => `<tr><td>Pergunta ${Number(resposta.pergunta) + 1}</td><td>${resposta.indice === null ? 'Tempo esgotado' : `Opção ${Number(resposta.indice) + 1}`}</td><td>${resposta.tempoEsgotado ? 'Não respondida' : (resposta.acertou ? 'Acertou' : 'Errou')}</td><td>${formatarTempo(resposta.tempoMs)}</td></tr>`).join('') : '<tr><td colspan="4">Detalhamento não disponível para este resultado antigo.</td></tr>';
    return `<article class="teacher-result"><div class="teacher-result-header"><div><span class="activity-category">${escapeTeacherText(atividade.titulo)}</span><h3>${escapeTeacherText(atividade.aluno)}</h3><p>${escapeTeacherText(atividade.alunoEmail)} · concluído em ${new Date(atividade.resultado.concluidaEm).toLocaleString('pt-BR')}</p></div><div class="teacher-grade"><strong>${atividade.resultado.nota}</strong><span>/ 10</span></div></div><div class="teacher-result-meta"><span>${atividade.resultado.acertos} acertos</span><span>${atividade.resultado.erros} erros</span><span>Tempo total: ${formatarTempo(atividade.resultado.tempoTotalMs)}</span></div><details><summary>Ver tempo por pergunta</summary><div class="teacher-table-wrap"><table><thead><tr><th>Pergunta</th><th>Resposta</th><th>Resultado</th><th>Tempo</th></tr></thead><tbody>${linhas}</tbody></table></div></details></article>`;
}
async function carregarResultadosProfessor() {
    try {
        const atividades = await apiRequest('/professor/atividades');
        document.getElementById('teacherSubmissionCount').textContent = atividades.length;
        document.getElementById('teacherAverageScore').textContent = atividades.length ? (atividades.reduce((total, item) => total + Number(item.resultado.nota || 0), 0) / atividades.length).toFixed(1) : '0';
        document.getElementById('teacherResultsList').innerHTML = atividades.length ? atividades.map(renderizarResultadoProfessor).join('') : '<p class="empty-state">Nenhuma atividade concluída ainda.</p>';
    } catch (erro) {
        document.getElementById('teacherResultsList').innerHTML = `<p class="auth-message error">${escapeTeacherText(erro.message)}</p>`;
    }
}
document.getElementById('refreshTeacherResults').addEventListener('click', carregarResultadosProfessor);
carregarResultadosProfessor();
