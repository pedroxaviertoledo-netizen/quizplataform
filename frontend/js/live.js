const liveSocket = typeof io === 'function' ? io(window.QUIZ_API_URL || window.location.origin) : null;
let liveRoom = '';
let liveQuiz = null;
let liveHost = false;
let liveQuizSelecionado = null;

async function carregarOpcoesLive() {
    const select = document.getElementById('liveQuizSelect');
    const rankingSelect = document.getElementById('rankingQuizSelect');
    if (!select && !rankingSelect) return;
    const quizzes = await apiRequest('/quizzes');
    [select, rankingSelect].filter(Boolean).forEach((element) => {
        quizzes.forEach((quiz) => {
            const option = new Option(quiz.titulo, quiz._id);
            element.appendChild(option);
        });
    });
    if (select) select.value = '';
    window.liveQuizzes = quizzes;
}

function renderLiveQuestion({ pergunta, numero, total }) {
    document.getElementById('liveGame').hidden = false;
    document.getElementById('liveProgress').textContent = `Pergunta ${numero} de ${total}`;
    document.getElementById('liveQuestion').textContent = pergunta.pergunta || pergunta.texto;
    const options = document.getElementById('liveOptions');
    options.innerHTML = '';
    pergunta.opcoes.forEach((opcao, index) => {
        const button = document.createElement('button');
        button.className = 'btn-option';
        button.textContent = opcao;
        button.onclick = () => {
            options.querySelectorAll('button').forEach((item) => { item.disabled = true; });
            liveSocket.emit('responderAoVivo', { codigo: liveRoom, opcao: index });
        };
        options.appendChild(button);
    });
}

if (liveSocket) {
    liveSocket.on('salaCriada', ({ codigo }) => {
        liveRoom = codigo;
        document.getElementById('hostCode').textContent = `Código: ${codigo}`;
        document.getElementById('startLive').hidden = false;
    });
    liveSocket.on('novaPerguntaAoVivo', renderLiveQuestion);
    liveSocket.on('resultadoAoVivo', ({ acertou, xp }) => {
        document.getElementById('liveStatus').textContent = acertou ? `Acerto. XP na sala: ${xp}` : `Erro. XP na sala: ${xp}`;
    });
    liveSocket.on('fimAoVivo', (ranking) => {
        document.getElementById('liveGame').hidden = true;
        document.getElementById('liveRanking').hidden = false;
        document.getElementById('liveRankingList').innerHTML = ranking.map((item, index) => `<div class="ranking-row"><strong>${index + 1}.</strong><span>${item.nome}</span><b>${item.xp} XP</b></div>`).join('');
    });
    liveSocket.on('erro', (message) => { document.getElementById('liveStatus').textContent = message; });
}

document.getElementById('createLive')?.addEventListener('click', async () => {
    const quizId = document.getElementById('liveQuizSelect').value;
    if (quizId && quizId !== '__novo__') {
        liveQuizSelecionado = await apiRequest(`/quizzes/${encodeURIComponent(quizId)}`);
    } else if (!liveQuizSelecionado) {
        document.getElementById('liveSetupStatus').textContent = 'Escolha um quiz pelo nome ou carregue pelo código.';
        return;
    }
    liveQuiz = liveQuizSelecionado;
    if (!liveQuiz) return;
    liveRoom = Math.random().toString(36).slice(2, 8).toUpperCase();
    liveHost = true;
    liveSocket.emit('criarSala', { codigo: liveRoom, quiz: liveQuiz });
});
document.getElementById('liveQuizSelect')?.addEventListener('change', (event) => {
    if (event.target.value === '__novo__') window.location.href = 'criar.html?retorno=ao-vivo.html';
    if (event.target.value && event.target.value !== '__novo__') liveQuizSelecionado = null;
});
document.getElementById('loadLiveQuiz')?.addEventListener('click', async () => {
    const codigo = document.getElementById('liveQuizCode').value.trim().toUpperCase();
    const status = document.getElementById('liveSetupStatus');
    if (!codigo) {
        status.textContent = 'Informe o código do quiz.';
        return;
    }
    try {
        liveQuizSelecionado = await apiRequest(`/quizzes/codigo/${encodeURIComponent(codigo)}`);
        liveQuiz = liveQuizSelecionado;
        document.getElementById('liveQuizSelect').value = '';
        status.textContent = `Quiz selecionado: ${liveQuiz.titulo}`;
    } catch (erro) {
        liveQuizSelecionado = null;
        status.textContent = erro.message;
    }
});
document.getElementById('startLive')?.addEventListener('click', () => liveSocket.emit('iniciarSala', liveRoom));
document.getElementById('joinLive')?.addEventListener('click', () => {
    liveRoom = document.getElementById('liveCode').value.trim().toUpperCase();
    liveSocket.emit('entrarSala', { codigo: liveRoom, nome: document.getElementById('liveName').value.trim() });
});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', carregarOpcoesLive); else carregarOpcoesLive();
