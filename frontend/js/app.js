const paginasProtegidas = ['dashboard.html', 'criar.html', 'jogar.html', 'perfil.html', 'ao-vivo.html', 'estudos.html', 'atividades.html', 'professor.html', 'notificacoes.html', 'turmas.html', 'desenvolvedor.html', 'painel-adm.html'];
const paginaAtual = window.location.pathname.split('/').pop();

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

function configurarNavegacaoPorPerfil() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const ehProfessor = user?.role === 'professor' || user?.roles?.includes('professor');
    const ehDesenvolvedor = user?.role === 'desenvolvedor' || user?.roles?.includes('desenvolvedor');
    document.querySelectorAll('.teacher-nav').forEach((item) => { item.hidden = !ehProfessor; });
    document.querySelectorAll('.developer-nav').forEach((item) => { item.hidden = !ehDesenvolvedor; });
}

    function configurarFeedback() {
        if (paginaAtual !== 'perfil.html') return;
        document.getElementById('feedbackForm')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const status = document.getElementById('feedbackStatus');
            try {
                await apiRequest('/feedbacks', 'POST', { mensagem: document.getElementById('feedbackMessage').value.trim() });
                event.target.reset();
                status.textContent = 'Feedback enviado. Obrigado!';
                status.className = 'auth-message success';
            } catch (erro) {
                status.textContent = erro.message;
                status.className = 'auth-message error';
            }
        });
    }

if (paginasProtegidas.includes(paginaAtual) && !localStorage.getItem('token')) {
    window.location.href = 'index.html';
}

if (paginaAtual === 'professor.html' && !JSON.parse(localStorage.getItem('user') || 'null')?.roles?.includes('professor') && JSON.parse(localStorage.getItem('user') || 'null')?.role !== 'professor') {
    window.location.href = 'dashboard.html';
}

if (paginaAtual === 'turmas.html' && !JSON.parse(localStorage.getItem('user') || 'null')?.roles?.includes('professor') && JSON.parse(localStorage.getItem('user') || 'null')?.role !== 'professor') {
    window.location.href = 'dashboard.html';
}

if (paginaAtual === 'desenvolvedor.html' && !JSON.parse(localStorage.getItem('user') || 'null')?.roles?.includes('desenvolvedor') && JSON.parse(localStorage.getItem('user') || 'null')?.role !== 'desenvolvedor') {
    window.location.href = 'dashboard.html';
}

const socket = typeof io === 'function' ? io() : null;
let codigoSalaAtual = "";
let audioCtx = null;

function configurarCriacaoQuiz() {
    if (paginaAtual !== 'criar.html') return;
    const aiModal = document.getElementById('modal-gerador-ia');
    document.querySelector('[data-open-ai]')?.addEventListener('click', async () => {
        try {
            const perfil = await apiRequest('/auth/perfil');
            if (perfil.plano !== 'pro') { window.location.href = 'planos.html'; return; }
            aiModal?.showModal();
        } catch (erro) {
            window.alert(erro.message);
        }
    });
    document.getElementById('aiGeneratorForm')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const status = document.getElementById('aiGeneratorStatus');
        const button = document.getElementById('aiGenerateButton');
        if (!document.getElementById('aiPrompt').value.trim()) { status.textContent = 'Digite um tema ou cole um texto para começar.'; status.className = 'payment-status error'; return; }
        button.disabled = true;
        button.innerHTML = '<span class="loading-spinner"></span> Gerando...';
        status.textContent = 'Analisando o conteúdo e preparando sugestões...';
        window.setTimeout(() => { button.disabled = false; button.textContent = 'Gerar com IA'; status.textContent = 'Sugestão criada. Revise e ajuste as perguntas antes de salvar.'; status.className = 'payment-status success'; aiModal?.close(); tocarSom('acerto'); }, 1200);
    });
    const perguntas = [];
    const lista = document.getElementById('listaPerguntasVisuais');
    const contador = document.getElementById('contadorPerguntas');
    const usarTempo = document.getElementById('usarTempoQuiz');
    const tempoQuiz = document.getElementById('tempoQuiz');
    const mostrarBotaoContinuar = document.getElementById('mostrarBotaoContinuar');
    const exigirTelaCheia = document.getElementById('exigirTelaCheia');
    usarTempo.checked = false;
    tempoQuiz.value = '';
    tempoQuiz.disabled = true;
    mostrarBotaoContinuar.checked = true;
    exigirTelaCheia.checked = false;
    const materiais = [];
    const fundosQuiz = [];
    const mensagem = document.createElement('p');
    mensagem.className = 'create-message';
    document.getElementById('areaPerguntas').prepend(mensagem);
    const retorno = new URLSearchParams(window.location.search).get('retorno');
    if (retorno === 'ao-vivo.html') document.getElementById('voltarCriacao').href = 'ao-vivo.html';

    const renderizarLista = (elemento, itens, aoRemover = () => {}) => {
        elemento.innerHTML = itens.map((item, indice) => `<span class="material-chip">${item.nome || item.url}<button type="button" data-index="${indice}" aria-label="Remover">×</button></span>`).join('');
        elemento.querySelectorAll('button').forEach((botao) => botao.addEventListener('click', () => { itens.splice(Number(botao.dataset.index), 1); aoRemover(); }));
    };
    const renderizarFundos = () => renderizarLista(document.getElementById('fundosVisuais'), fundosQuiz.map((url) => ({ nome: url.startsWith('data:') ? 'Imagem enviada' : url, url })), renderizarFundos);
    const lerArquivo = (arquivo) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ nome: arquivo.name, tipo: arquivo.type, url: reader.result }); reader.onerror = reject; reader.readAsDataURL(arquivo); });
    document.getElementById('addMaterialLink').addEventListener('click', () => { const campo = document.getElementById('materialLink'); if (!campo.value.trim()) return; materiais.push({ nome: campo.value.trim(), tipo: 'link', url: campo.value.trim() }); campo.value = ''; renderizarLista(document.getElementById('materiaisVisuais'), materiais); });
    document.getElementById('materialFiles').addEventListener('change', async (evento) => { const arquivos = [...evento.target.files]; materiais.push(...await Promise.all(arquivos.map(lerArquivo))); document.getElementById('materialFilesStatus').textContent = arquivos.length ? `${arquivos.length} arquivo(s) selecionado(s)` : 'Nenhum arquivo selecionado'; renderizarLista(document.getElementById('materiaisVisuais'), materiais); evento.target.value = ''; });
    document.getElementById('addFundoQuizLink').addEventListener('click', () => { const campo = document.getElementById('fundoQuizLink'); if (!campo.value.trim()) return; fundosQuiz.push(campo.value.trim()); campo.value = ''; renderizarFundos(); });
    document.getElementById('fundosQuizFiles').addEventListener('change', async (evento) => { const arquivos = [...evento.target.files]; fundosQuiz.push(...(await Promise.all(arquivos.map(lerArquivo))).map((item) => item.url)); document.getElementById('fundosFilesStatus').textContent = arquivos.length ? `${arquivos.length} imagem(ns) selecionada(s)` : 'Nenhuma imagem selecionada'; renderizarFundos(); evento.target.value = ''; });

    usarTempo.addEventListener('change', () => {
        tempoQuiz.disabled = !usarTempo.checked;
    });

    const ler = (id) => document.getElementById(id).value.trim();
    const limpar = () => ['textoPergunta', 'opcao0', 'opcao1', 'opcao2', 'opcao3'].forEach((id) => { document.getElementById(id).value = ''; });
    document.getElementById('btnAdicionarPergunta').addEventListener('click', () => {
        const texto = ler('textoPergunta');
        const opcoes = [0, 1, 2, 3].map((index) => ler(`opcao${index}`));
        const correta = document.getElementById('respostaCorreta').value;
        if (!texto || opcoes.some((opcao) => !opcao) || correta === '') {
            mensagem.textContent = 'Preencha a pergunta, as quatro opções e selecione a resposta correta.';
            mensagem.className = 'create-message error';
            return;
        }
        perguntas.push({ pergunta: texto, opcoes, respostaCorreta: Number(correta) });
        contador.textContent = perguntas.length;
        const item = document.createElement('div');
        item.className = 'pergunta-item reveal-item';
        item.innerHTML = `<strong>${perguntas.length}. ${texto}</strong><span>Resposta: opção ${Number(correta) + 1}</span>`;
        lista.appendChild(item);
        mensagem.textContent = 'Pergunta adicionada.';
        mensagem.className = 'create-message success';
        tocarSom('pop');
        limpar();
        document.getElementById('respostaCorreta').value = '';
    });

    document.getElementById('btnSalvarQuiz').addEventListener('click', async () => {
        const titulo = ler('tituloQuiz');
        const categoria = ler('categoriaQuiz');
        const tempoPorPergunta = usarTempo.checked ? Number(tempoQuiz.value) : null;
        const permitirContinuar = mostrarBotaoContinuar.checked;
        const exigirTelaCheiaQuiz = exigirTelaCheia.checked;
        if (tempoPorPergunta !== null && (!Number.isInteger(tempoPorPergunta) || tempoPorPergunta < 5 || tempoPorPergunta > 600)) {
            mensagem.textContent = 'Informe um tempo entre 5 e 600 segundos ou desative o limite de tempo.';
            mensagem.className = 'create-message error';
            return;
        }
        if (!titulo || !categoria || !perguntas.length) {
            mensagem.textContent = 'Informe título, categoria e adicione pelo menos uma pergunta.';
            mensagem.className = 'create-message error';
            tocarSom('erro');
            return;
        }
        try {
            const perfil = await apiRequest('/auth/perfil');
            if (perfil.plano !== 'pro') {
                const quizzes = await apiRequest('/quizzes');
                const usuarioId = perfil.id || JSON.parse(localStorage.getItem('user') || '{}').id;
                const inicioSemana = new Date();
                inicioSemana.setHours(0, 0, 0, 0);
                inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
                const criados = quizzes.filter((quiz) => quiz.criador === usuarioId && new Date(quiz.created_at || 0) >= inicioSemana).length;
                if (criados >= 5) {
                    mensagem.textContent = 'Seu plano gratuito permite até 5 quizzes por semana. Faça upgrade para o Pro.';
                    mensagem.className = 'create-message error';
                    return;
                }
            }
        } catch (erro) {
            mensagem.textContent = erro.message;
            mensagem.className = 'create-message error';
            return;
        }
        const botao = document.getElementById('btnSalvarQuiz');
        botao.disabled = true;
        botao.textContent = 'Salvando...';
        try {
            const resultado = await apiRequest('/quizzes/criar', 'POST', { titulo, categoria, perguntas, tempoPorPergunta, mostrarBotaoContinuar: permitirContinuar, exigirTelaCheia: exigirTelaCheiaQuiz, materiais, fundoInicio: document.getElementById('fundoInicioPreset').value || null, fundosQuiz });
            document.getElementById('codigoGerado').textContent = resultado.codigo;
            document.getElementById('tempoGerado').textContent = tempoPorPergunta ? `Tempo: ${tempoPorPergunta}s por pergunta` : 'Sem limite de tempo';
            document.getElementById('resultadoCriacao').style.display = 'grid';
            mensagem.textContent = 'Quiz criado com sucesso.';
            mensagem.className = 'create-message success';
            tocarSom('acerto');
        } catch (erro) {
            mensagem.textContent = erro.message;
            mensagem.className = 'create-message error';
            botao.disabled = false;
            botao.textContent = 'Finalizar e gerar código';
            tocarSom('erro');
        }
    });
}

async function carregarQuizzes() {
    const lista = document.getElementById('quizList');
    if (!lista || typeof apiRequest !== 'function') return;

    try {
        const quizzes = await apiRequest('/quizzes');
        const usuario = JSON.parse(localStorage.getItem('user') || '{}');
        const usuarioId = usuario.id || usuario._id;
        const podeApagar = (quiz) => quiz.criador && (quiz.criador === usuarioId || usuario.role === 'desenvolvedor' || usuario.roles?.includes('desenvolvedor'));
        const normalizarCategoria = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const renderizarQuizzes = (categoria = '') => {
            const filtrados = categoria ? quizzes.filter((quiz) => normalizarCategoria(quiz.categoria) === normalizarCategoria(categoria)) : quizzes;
            lista.innerHTML = filtrados.length ? filtrados.map((quiz) => `
            <article class="quiz-card" data-quiz-category="${quiz.categoria || ''}">
                <p class="quiz-category">${quiz.categoria}</p>
                <h3>${quiz.titulo}</h3>
                <p>${quiz.perguntas.length} perguntas para responder.</p>
                ${quiz.criador && quiz.codigo ? `<p class="quiz-code">Código para compartilhar: <strong>${quiz.codigo}</strong></p>` : ''}
                <a class="btn-accent quiz-action" href="jogar.html?id=${quiz._id}">Começar quiz</a>
                <div class="share-quiz"><input id="shareEmail-${quiz._id}" type="email" placeholder="E-mail do estudante"><button type="button" class="btn-secondary" onclick="compartilharQuizPorEmail('${quiz._id}')">Compartilhar</button></div>
                ${podeApagar(quiz) ? `<button type="button" class="btn-danger quiz-delete" data-quiz-delete="${quiz._id}">Apagar quiz</button>` : ''}
            </article>
        `).join('') : '<p class="empty-state">Nenhum quiz encontrado nesta matéria.</p>';
            lista.querySelectorAll('[data-quiz-delete]').forEach((botao) => botao.addEventListener('click', () => apagarQuiz(botao.dataset.quizDelete)));
        };
        renderizarQuizzes();
        if (window.materiaSelecionada) filtrarMateria(window.materiaSelecionada);
        document.querySelectorAll('.subject-card').forEach((botao) => botao.addEventListener('mouseenter', () => tocarSom('hover'), { once: true }));
    } catch (erro) {
        lista.innerHTML = `<p class="auth-message error">${erro.message}</p>`;
    }
}

async function apagarQuiz(quizId) {
    if (!window.confirm('Apagar este quiz? Essa ação remove o quiz do dashboard.')) return;
    try {
        await apiRequest(`/quizzes/${encodeURIComponent(quizId)}`, 'DELETE');
        await carregarQuizzes();
    } catch (erro) {
        window.alert(erro.message);
    }
}

async function compartilharQuizPorEmail(quizId) {
    const campo = document.getElementById(`shareEmail-${quizId}`);
    const email = campo.value.trim();
    if (!email) return alert('Informe o e-mail do estudante.');
    try {
        const resultado = await apiRequest('/atividades/compartilhar', 'POST', { quizId, email });
        campo.value = '';
        alert(resultado.mensagem);
    } catch (erro) {
        alert(erro.message);
    }
}

let quizSelecionado = null;
let perguntaSelecionada = 0;
let acertosQuiz = 0;
let quizIniciado = false;
let quizMusic = null;
let timerQuiz = null;
let tempoRestante = 0;
let respostasQuiz = [];
let tempoRestantePerguntas = {};
let transicaoQuiz = false;
let atividadeQuizId = new URLSearchParams(window.location.search).get('atividade');
let inicioPergunta = null;
let tempoTotalQuizMs = 0;
let perguntaPausadaTelaCheia = null;
let perguntaPausadaNavegacao = null;

async function carregarQuizSelecionado() {
    if (paginaAtual !== 'jogar.html' || typeof apiRequest !== 'function') return;

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    try {
        quizSelecionado = await apiRequest(`/quizzes/${encodeURIComponent(id)}`);
        document.getElementById('quizStartTitle').textContent = quizSelecionado.titulo;
        configurarTelaCheiaQuiz();
        aplicarFundoInicioQuiz();
        renderizarMateriaisQuiz();
    } catch (erro) {
        document.getElementById('gameContainer').innerHTML = `<p class="auth-message error">${erro.message}</p>`;
    }
}

function configurarTelaCheiaQuiz() {
    const escolha = document.getElementById('usarTelaCheia');
    const texto = document.getElementById('fullscreenChoiceText');
    if (!escolha) return;
    if (quizSelecionado?.exigirTelaCheia === true) {
        escolha.checked = true;
        escolha.disabled = true;
        texto.textContent = 'Tela cheia obrigatória neste quiz';
    } else {
        escolha.checked = false;
        escolha.disabled = false;
        texto.textContent = 'Usar tela cheia durante o quiz';
    }
}

async function prepararTelaCheiaQuiz() {
    const escolha = document.getElementById('usarTelaCheia');
    const status = document.getElementById('fullscreenStatus');
    if (!escolha?.checked) {
        if (quizSelecionado?.exigirTelaCheia !== true) return true;
        status.textContent = 'A tela cheia é obrigatória para iniciar este quiz.';
        return false;
    }
    if (document.fullscreenElement) return true;
    if (!document.documentElement.requestFullscreen) {
        if (quizSelecionado?.exigirTelaCheia) status.textContent = 'Este navegador não permite tela cheia. Use um navegador compatível.';
        return !quizSelecionado?.exigirTelaCheia;
    }
    try {
        await document.documentElement.requestFullscreen();
        status.textContent = '';
        return true;
    } catch (erro) {
        status.textContent = quizSelecionado?.exigirTelaCheia ? 'Autorize a tela cheia para iniciar este quiz.' : 'O quiz será iniciado sem tela cheia.';
        return !quizSelecionado?.exigirTelaCheia;
    }
}

document.addEventListener('fullscreenchange', () => {
    if (!quizIniciado || quizSelecionado?.exigirTelaCheia !== true || document.fullscreenElement || !document.getElementById('quizComplete')?.hidden) return;
    limparTimerQuiz();
    perguntaPausadaTelaCheia = perguntaSelecionada;
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('quizStart').hidden = false;
    document.body.classList.add('quiz-start-screen');
    document.body.classList.remove('quiz-active-screen');
    document.getElementById('fullscreenStatus').textContent = 'Este quiz exige tela cheia. Volte para tela cheia para continuar.';
    quizIniciado = false;
});

function aplicarFundoInicioQuiz() {
    const inicio = document.getElementById('quizStart');
    if (quizSelecionado?.fundoInicio) {
        const fundo = `linear-gradient(rgba(255,255,255,.84), rgba(255,255,255,.84)), url("${quizSelecionado.fundoInicio}")`;
        inicio.style.backgroundImage = fundo;
        document.body.style.backgroundImage = fundo;
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
    }
}

function renderizarMateriaisQuiz() {
    const materiais = quizSelecionado?.materiais || [];
    ['materiaisQuizInicio', 'materiaisQuiz'].forEach((id) => {
        const area = document.getElementById(id);
        if (!materiais.length) return;
        area.hidden = false;
        area.innerHTML = materiais.map((item) => `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.nome || 'Material de apoio'}</a>`).join('');
    });
}

function iniciarSomContinuo() {
    initAudio();
    if (!audioCtx || quizMusic) return;

    const notas = [196, 246.94, 293.66, 246.94, 220, 261.63, 329.63, 261.63];
    const volumeMusica = audioCtx.createGain();
    volumeMusica.gain.value = 0.22;
    volumeMusica.connect(audioCtx.destination);
    let indice = 0;
    const tocarNota = () => {
        if (!audioCtx || !quizMusic) return;
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const agora = audioCtx.currentTime;
        oscillator.type = 'triangle';
        oscillator.frequency.value = notas[indice % notas.length];
        gain.gain.setValueAtTime(0.0001, agora);
        gain.gain.exponentialRampToValueAtTime(0.12, agora + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, agora + 1.15);
        oscillator.connect(gain);
        gain.connect(volumeMusica);
        oscillator.start(agora);
        oscillator.stop(agora + 1.2);
        indice++;
    };

    quizMusic = { interval: setInterval(tocarNota, 620), volume: volumeMusica };
    tocarNota();
}

function pararSomContinuo() {
    if (!quizMusic) return;
    clearInterval(quizMusic.interval);
    quizMusic.volume.gain.cancelScheduledValues(audioCtx.currentTime);
    quizMusic.volume.gain.setTargetAtTime(0, audioCtx.currentTime, 0.08);
    quizMusic = null;
}

async function iniciarContagemQuiz() {
    if (quizIniciado || !quizSelecionado) return;
    if (!await prepararTelaCheiaQuiz()) return;
    const retomandoTelaCheia = perguntaPausadaTelaCheia !== null && perguntaSelecionada === perguntaPausadaTelaCheia;
    if (retomandoTelaCheia) {
        perguntaSelecionada = perguntaPausadaTelaCheia;
    }
    perguntaPausadaTelaCheia = null;
    quizIniciado = true;
    document.body.classList.remove('quiz-start-screen');
    document.body.classList.add('quiz-active-screen');
    tocarSom('pop');
    document.getElementById('quizStart').hidden = true;
    const overlay = document.getElementById('countdownOverlay');
    const number = document.getElementById('countdownNumber');
    overlay.hidden = false;
    let count = 3;
    number.textContent = count;
    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            number.textContent = count;
            number.classList.remove('countdown-pulse');
            void number.offsetWidth;
            number.classList.add('countdown-pulse');
            tocarSom('pop');
            return;
        }
        clearInterval(timer);
        number.textContent = 'GO';
        tocarSom('acerto');
        setTimeout(() => {
            overlay.hidden = true;
            document.getElementById('gameContainer').style.display = 'block';
            document.getElementById('quizCategory').textContent = quizSelecionado.categoria;
            iniciarSomContinuo();
            renderizarPerguntaQuiz(true);
        }, 420);
    }, 900);
}

function renderizarPerguntaQuiz(reiniciarTempo = true) {
    const pergunta = quizSelecionado.perguntas[perguntaSelecionada];
    const opcoes = document.getElementById('opcoesContainer');
    const respostaRegistrada = respostasQuiz[perguntaSelecionada];
    const emRevisao = Boolean(respostaRegistrada);
    if (reiniciarTempo) limparTimerQuiz();
    window.speechSynthesis?.cancel();
    document.getElementById('quizProgress').textContent = `Pergunta ${perguntaSelecionada + 1} de ${quizSelecionado.perguntas.length}`;
    document.getElementById('perguntaAtual').textContent = pergunta.pergunta;
    const fundos = quizSelecionado?.fundosQuiz || [];
    if (fundos.length) {
        const fundo = `linear-gradient(rgba(255,255,255,.84), rgba(255,255,255,.84)), url("${fundos[perguntaSelecionada % fundos.length]}")`;
        document.getElementById('gameContainer').style.backgroundImage = fundo;
        document.body.style.backgroundImage = fundo;
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
    } else {
        document.getElementById('gameContainer').style.backgroundImage = '';
        document.body.style.backgroundImage = '';
        document.body.style.backgroundAttachment = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundRepeat = '';
    }
    const permitirContinuar = quizSelecionado.mostrarBotaoContinuar !== false;
    const retornandoParaPerguntaPausada = perguntaPausadaNavegacao === perguntaSelecionada;
    document.getElementById('nextQuestion').hidden = (!emRevisao && !retornandoParaPerguntaPausada) || !permitirContinuar;
    document.getElementById('previousQuestion').disabled = perguntaSelecionada === 0;
    transicaoQuiz = false;
    opcoes.innerHTML = '';

    pergunta.opcoes.forEach((opcao, indice) => {
        const botao = document.createElement('button');
        botao.className = 'btn-option';
        botao.type = 'button';
        botao.textContent = opcao;
        if (emRevisao) {
            botao.disabled = true;
            if (indice === pergunta.respostaCorreta) botao.style.background = 'var(--mint)';
            if (indice === respostaRegistrada.indice && indice !== pergunta.respostaCorreta) botao.style.background = 'var(--coral)';
        } else {
            botao.addEventListener('click', () => responderQuizLocal(indice));
        }
        opcoes.appendChild(botao);
    });
    if (!emRevisao && reiniciarTempo && !retornandoParaPerguntaPausada) {
        inicioPergunta = performance.now();
        iniciarTimerQuiz();
    }
}

function limparTimerQuiz() {
    if (timerQuiz) {
        tempoRestantePerguntas[perguntaSelecionada] = Math.max(0, tempoRestante);
        clearInterval(timerQuiz);
    }
    timerQuiz = null;
}

function atualizarTimerQuiz() {
    const timerText = document.getElementById('timerText');
    const timerBar = document.getElementById('timerBar');
    timerText.textContent = `${String(Math.floor(tempoRestante / 60)).padStart(2, '0')}:${String(tempoRestante % 60).padStart(2, '0')}`;
    const tempoTotal = Number(quizSelecionado.perguntas[perguntaSelecionada].tempoSegundos ?? quizSelecionado.tempoPorPergunta);
    timerBar.style.width = `${Math.max(0, (tempoRestante / tempoTotal) * 100)}%`;
    if (tempoRestante <= 5) timerBar.classList.add('is-ending');
}

function iniciarTimerQuiz() {
    const timerArea = document.getElementById('timerArea');
    const tempoConfigurado = Number(quizSelecionado?.perguntas?.[perguntaSelecionada]?.tempoSegundos ?? quizSelecionado?.tempoPorPergunta);
    if (!Number.isInteger(tempoConfigurado) || tempoConfigurado < 1) {
        timerArea.hidden = true;
        return;
    }
    timerArea.hidden = false;
    tempoRestante = tempoRestantePerguntas[perguntaSelecionada] ?? tempoConfigurado;
    tempoRestantePerguntas[perguntaSelecionada] = tempoRestante;
    document.getElementById('timerBar').classList.remove('is-ending');
    atualizarTimerQuiz();
    timerQuiz = setInterval(() => {
        tempoRestante--;
        tempoRestantePerguntas[perguntaSelecionada] = Math.max(0, tempoRestante);
        atualizarTimerQuiz();
        if (tempoRestante <= 0) {
            limparTimerQuiz();
            tocarSom('erro');
            transicaoQuiz = true;
            const tempoRespostaMs = Math.round(performance.now() - inicioPergunta);
            tempoTotalQuizMs += tempoRespostaMs;
            respostasQuiz[perguntaSelecionada] = { pergunta: perguntaSelecionada, indice: null, acertou: false, tempoEsgotado: true, tempoMs: tempoRespostaMs };
            document.querySelectorAll('#opcoesContainer .btn-option').forEach((botao, index) => {
                botao.disabled = true;
                if (index === quizSelecionado.perguntas[perguntaSelecionada].respostaCorreta) botao.style.background = 'var(--mint)';
            });
            setTimeout(avancarQuiz, 700);
        }
    }, 1000);
}

function ouvirPerguntaAtual() {
    if (!quizSelecionado || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const pergunta = quizSelecionado.perguntas[perguntaSelecionada];
    const texto = `${pergunta.pergunta}. Opções: ${pergunta.opcoes.join('. ')}`;
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    fala.rate = 0.92;
    fala.pitch = 1;
    window.speechSynthesis.speak(fala);
    document.getElementById('listenQuestion').classList.add('is-speaking');
    fala.onend = () => document.getElementById('listenQuestion').classList.remove('is-speaking');
}

function responderQuizLocal(indice) {
    if (transicaoQuiz || respostasQuiz[perguntaSelecionada]) return;
    transicaoQuiz = true;
    if (timerQuiz) limparTimerQuiz();
    const pergunta = quizSelecionado.perguntas[perguntaSelecionada];
    const tempoRespostaMs = Math.max(0, Math.round(performance.now() - inicioPergunta));
    tempoTotalQuizMs += tempoRespostaMs;
    respostasQuiz[perguntaSelecionada] = { pergunta: perguntaSelecionada, indice, acertou: indice === pergunta.respostaCorreta, tempoEsgotado: false, tempoMs: tempoRespostaMs };
    const botoes = document.querySelectorAll('#opcoesContainer .btn-option');
    botoes.forEach((botao, index) => {
        botao.disabled = true;
        if (index === pergunta.respostaCorreta) botao.style.background = 'var(--mint)';
        if (index === indice && index !== pergunta.respostaCorreta) botao.style.background = 'var(--coral)';
    });
    if (indice === pergunta.respostaCorreta) {
        acertosQuiz++;
        tocarSom('acerto');
        document.body.classList.add('answer-correct');
    } else {
        tocarSom('erro');
        document.body.classList.add('answer-wrong');
    }
    setTimeout(() => document.body.classList.remove('answer-correct', 'answer-wrong'), 500);
    setTimeout(avancarQuiz, 700);
}

async function avancarQuiz() {
    if (perguntaSelecionada >= quizSelecionado.perguntas.length) return;
    const respostaRegistrada = respostasQuiz[perguntaSelecionada];
    const permitirContinuar = quizSelecionado.mostrarBotaoContinuar !== false;
    const retornandoParaPerguntaPausada = perguntaPausadaNavegacao === perguntaSelecionada + 1;
    if (!respostaRegistrada && permitirContinuar && !retornandoParaPerguntaPausada) return;
    if (respostaRegistrada && !permitirContinuar && !transicaoQuiz) return;
    limparTimerQuiz();
    perguntaSelecionada++;
    if (retornandoParaPerguntaPausada) perguntaPausadaNavegacao = null;
    if (perguntaSelecionada < quizSelecionado.perguntas.length) {
        renderizarPerguntaQuiz();
        return;
    }
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('quizStart').hidden = true;
    document.body.classList.remove('quiz-start-screen');
    document.body.classList.remove('quiz-active-screen');
    quizIniciado = false;
    pararSomContinuo();
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    document.getElementById('quizComplete').hidden = false;
    document.getElementById('quizScore').textContent = `Você acertou ${acertosQuiz} de ${quizSelecionado.perguntas.length} perguntas.`;
    try {
        await apiRequest(`/quizzes/${encodeURIComponent(quizSelecionado._id)}/resultado`, 'POST', {
            acertos: acertosQuiz,
            erros: quizSelecionado.perguntas.length - acertosQuiz,
            atividadeId: atividadeQuizId,
            tempoTotalMs: tempoTotalQuizMs,
            respostas: respostasQuiz
        });
    } catch (erro) {
        console.error('Não foi possível salvar o resultado:', erro);
    }
}

function voltarPergunta() {
    if (perguntaSelecionada === 0) return;
    limparTimerQuiz();
    perguntaPausadaNavegacao = perguntaSelecionada;
    transicaoQuiz = false;
    perguntaSelecionada--;
    renderizarPerguntaQuiz(false);
}

let avatarCatalogo = {
    aurora: { label: 'AU', nome: 'Aurora', preco: 0 },
    oceano: { label: 'OC', nome: 'Oceano', preco: 0 },
    bosque: { label: 'BO', nome: 'Bosque', preco: 0 },
    sol: { label: 'SL', nome: 'Solar', preco: 0 },
    cosmos: { label: 'CO', nome: 'Cosmos', preco: 0 },
    rubi: { label: 'RU', nome: 'Rubi', preco: 0 }
};

async function carregarPerfil() {
    if (paginaAtual !== 'perfil.html') return;
    const perfilLocal = JSON.parse(localStorage.getItem('user') || '{}');
    const preencherPerfil = (perfil) => {
        document.getElementById('userName').textContent = perfil.nome || 'Usuário';
        document.getElementById('userEmail').textContent = perfil.email || 'E-mail não informado';
        document.getElementById('userRole').textContent = perfil.role === 'professor' ? 'Professor e estudante' : 'Estudante';
        document.getElementById('userPoints').textContent = `${perfil.xp || 0} XP`;
        document.getElementById('userCorrect').textContent = perfil.acertos || 0;
        document.getElementById('userWrong').textContent = perfil.erros || 0;
        const avatarAtual = avatarCatalogo[perfil.avatar] ? perfil.avatar : 'aurora';
        const avatarPrincipal = document.getElementById('profileAvatar');
        avatarPrincipal.textContent = avatarCatalogo[avatarAtual].label;
        avatarPrincipal.dataset.avatar = avatarAtual;
    };
    preencherPerfil(perfilLocal);
    let perfil = perfilLocal;
    try {
        perfil = await apiRequest('/auth/perfil');
        preencherPerfil(perfil);
    } catch (erro) {
        document.getElementById('globalRanking').innerHTML = '<p>Dados atualizados localmente. Ranking indisponível no momento.</p>';
    }
    try {
        const dadosAvatares = await apiRequest('/auth/avatares');
        avatarCatalogo = Object.fromEntries(dadosAvatares.catalogo.map((avatar) => [avatar.id, avatar]));
        perfil = { ...perfil, xp: dadosAvatares.xp, avataresComprados: dadosAvatares.avataresComprados };
        preencherPerfil(perfil);
    } catch (erro) {
        console.error('Não foi possível carregar o catálogo de avatares:', erro);
    }

    const avataresComprados = perfil.avataresComprados || Object.keys(avatarCatalogo).filter((id) => avatarCatalogo[id].preco === 0);
    const avatarAtual = avatarCatalogo[perfil.avatar] ? perfil.avatar : 'aurora';
    const avatarPrincipal = document.getElementById('profileAvatar');
    avatarPrincipal.textContent = avatarCatalogo[avatarAtual].label;
    avatarPrincipal.dataset.avatar = avatarAtual;
    document.getElementById('avatarChoices').innerHTML = Object.entries(avatarCatalogo).map(([id, avatar]) => {
        const comprado = avataresComprados.includes(id);
        const preco = Number(avatar.preco || 0);
        return `<div class="avatar-card ${comprado ? '' : 'locked'}">
            <button type="button" class="avatar-choice avatar-${id} ${avatarAtual === id ? 'selected' : ''}" data-avatar="${id}" ${comprado ? '' : 'disabled'}><span>${avatar.label}</span><small>${avatar.nome}</small></button>
            ${comprado ? '<small class="avatar-owned">Desbloqueado</small>' : `<button type="button" class="avatar-buy" data-buy-avatar="${id}">Comprar por ${preco} XP</button>`}
        </div>`;
    }).join('');
    document.querySelectorAll('.avatar-choice').forEach((button) => button.addEventListener('click', () => {
        document.querySelectorAll('.avatar-choice').forEach((item) => item.classList.remove('selected'));
        button.classList.add('selected');
        document.getElementById('profileAvatar').textContent = avatarCatalogo[button.dataset.avatar].label;
        document.getElementById('profileAvatar').dataset.avatar = button.dataset.avatar;
    }));
    document.querySelectorAll('[data-buy-avatar]').forEach((button) => button.addEventListener('click', async () => {
        button.disabled = true;
        try {
            const resultado = await apiRequest(`/auth/avatares/${button.dataset.buyAvatar}/comprar`, 'POST');
            perfil.xp = resultado.xp;
            perfil.avataresComprados = resultado.avataresComprados;
            const usuarioLocal = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...usuarioLocal, xp: resultado.xp, avataresComprados: resultado.avataresComprados }));
            carregarPerfil();
        } catch (erro) {
            button.disabled = false;
            button.textContent = erro.message;
        }
    }));
    document.getElementById('saveAvatar').onclick = async () => {
        const selected = document.querySelector('.avatar-choice.selected')?.dataset.avatar;
        const botaoSalvar = document.getElementById('saveAvatar');
        if (!selected) return;
        botaoSalvar.disabled = true;
        botaoSalvar.textContent = 'Salvando...';
        try {
            const perfilAtualizado = await apiRequest('/auth/perfil', 'PATCH', { avatar: selected });
            const usuarioLocal = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...usuarioLocal, avatar: perfilAtualizado.avatar }));
            botaoSalvar.textContent = 'Avatar salvo';
        } catch (erro) {
            botaoSalvar.textContent = 'Tentar novamente';
            console.error('Não foi possível salvar o avatar:', erro);
        } finally {
            botaoSalvar.disabled = false;
        }
    };
    let quizzes = [];
    try {
        quizzes = await apiRequest('/quizzes');
    } catch (erro) {
        document.getElementById('quizRanking').innerHTML = `<p class="auth-message error">Não foi possível carregar os quizzes.</p>`;
    }
    const select = document.getElementById('rankingQuizSelect');
    quizzes.forEach((quiz) => select.appendChild(new Option(quiz.titulo, quiz._id)));
    try {
        const ranking = await apiRequest('/ranking');
        document.getElementById('globalRanking').innerHTML = ranking.map((item) => `<div class="ranking-row"><strong>${item.posicao}.</strong><span>${item.nome}</span><b>${item.xp} XP</b></div>`).join('');
    } catch (erro) {
        document.getElementById('globalRanking').innerHTML = '<p>Ranking indisponível no momento.</p>';
    }
    select.onchange = async () => {
        if (!select.value) return;
        const quizRanking = await apiRequest(`/ranking/${select.value}`);
        document.getElementById('quizRanking').innerHTML = quizRanking.length ? quizRanking.map((item) => `<div class="ranking-row"><strong>${item.posicao}.</strong><span>${item.nome}</span><b>${item.xp} XP</b></div>`).join('') : '<p>Ainda não há resultados neste quiz.</p>';
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', carregarQuizzes);
    document.addEventListener('DOMContentLoaded', carregarQuizSelecionado);
    document.addEventListener('DOMContentLoaded', carregarPerfil);
    document.addEventListener('DOMContentLoaded', configurarCriacaoQuiz);
} else {
    carregarQuizzes();
    carregarQuizSelecionado();
    carregarPerfil();
    configurarCriacaoQuiz();
}

configurarNavegacaoPorPerfil();
configurarFeedback();
configurarCabecalho();

document.getElementById('nextQuestion')?.addEventListener('click', avancarQuiz);
document.getElementById('previousQuestion')?.addEventListener('click', voltarPergunta);
document.getElementById('startQuiz')?.addEventListener('click', iniciarContagemQuiz);
document.getElementById('listenQuestion')?.addEventListener('click', ouvirPerguntaAtual);

function configurarCabecalho() {
    document.querySelectorAll('.theme-toggle').forEach((botao) => {
        botao.textContent = document.body.classList.contains('dark-mode') ? '☀' : '☾';
        botao.title = 'Alternar tema';
        botao.setAttribute('aria-label', 'Alternar tema claro e escuro');
    });
    document.querySelectorAll('a[href="perfil.html"]').forEach((link) => {
        const usuario = JSON.parse(localStorage.getItem('user') || '{}');
        const nome = usuario.nome || usuario.email || 'Perfil';
        link.classList.add('profile-nav-avatar', `avatar-${usuario.avatar || 'aurora'}`);
        link.innerHTML = `<span>${nome.slice(0, 2).toUpperCase()}</span>`;
        link.title = 'Meu perfil';
        link.setAttribute('aria-label', 'Meu perfil');
        const itemPerfil = link.closest('li');
        const itemTema = document.querySelector('.theme-toggle')?.closest('li');
        if (itemPerfil && itemTema) itemTema.parentElement.insertBefore(itemPerfil, itemTema);
    });
}

// Inicializa o Áudio do Navegador no primeiro clique
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

// Sintetizador de Efeitos Sonoros (Zero arquivos MP3 necessários)
function tocarSom(tipo) {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => tocarSom(tipo));
        return;
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (tipo === 'pop') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
    } else if (tipo === 'acerto') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
    } else if (tipo === 'erro') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.linearRampToValueAtTime(170, now + 0.18);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
    } else if (tipo === 'categoria') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
    } else if (tipo === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.045);
        osc.start(now);
        osc.stop(now + 0.045);
    }
}

// Ativar/Desativar Modo Escuro
function toggleDarkMode() {
    tocarSom('pop');
    const darkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
}

// Fluxo de Telas
function prepararEntrada() {
    tocarSom('pop');
    codigoSalaAtual = document.getElementById('codigoBusca').value.trim();
    if (!codigoSalaAtual) return alert("Digite o código da sala!");

    document.getElementById('telaPrincipal').style.display = 'none';
    document.getElementById('telaNickname').style.display = 'block';
}

function entrarNaSala() {
    tocarSom('pop');
    const nome = document.getElementById('jogadorNome').value.trim();
    if (!nome) return alert("Digite seu nome!");

    if (!socket) return alert('O modo multiplayer não está disponível nesta página.');
    socket.emit('entrarSala', { codigo: codigoSalaAtual, nome });
    document.getElementById('telaNickname').style.display = 'none';
    document.getElementById('telaLobby').style.display = 'block';
}

// Lógica do Host
function criarSalaHost() {
    tocarSom('pop');
    codigoSalaAtual = Math.floor(100000 + Math.random() * 900000).toString();
    const quizExemplo = {
        perguntas: [
            { texto: "Quanto é 2 + 2?", opcoes: ["3", "4", "5", "22"], correta: 1 },
            { texto: "Qual a cor do céu em um dia limpo?", opcoes: ["Verde", "Vermelho", "Azul", "Roxo"], correta: 2 }
        ]
    };

    if (!socket) return alert('O modo multiplayer não está disponível nesta página.');
    socket.emit('criarSala', { codigo: codigoSalaAtual, quizData: quizExemplo });
    document.getElementById('telaPrincipal').style.display = 'none';
    document.getElementById('painelHost').style.display = 'block';
    document.getElementById('hostCodigoDisplay').innerText = codigoSalaAtual;
}

function expulsar(id) {
    if (!socket) return;
    socket.emit('expulsarJogador', { codigo: codigoSalaAtual, jogadorId: id });
}

function iniciarPartidaHost() {
    tocarSom('pop');
    if (socket) socket.emit('iniciarJogo', codigoSalaAtual);
}

function proximaPerguntaHost() {
    tocarSom('pop');
    if (socket) socket.emit('proximaPergunta', codigoSalaAtual);
}

// Resposta do Jogador
function responder(opcaoIndex) {
    tocarSom('pop');
    const botoes = document.querySelectorAll('.btn-option');
    botoes.forEach(b => b.disabled = true);

    if (socket) socket.emit('responder', { codigo: codigoSalaAtual, opcaoIndex });
}

// Power-Ups
function usarPowerUp(tipo) {
    tocarSom('pop');
    if (socket) socket.emit('usarPowerUp', { codigo: codigoSalaAtual, tipo });
}

// Escutando Eventos do Servidor (Socket.io)
if (socket) socket.on('atualizarJogadores', (jogadores) => {
    const listaLobby = document.getElementById('listaJogadoresLobby');
    const listaHost = document.getElementById('listaJogadoresHost');

    const html = jogadores.map(j => `<div class="jogador-badge" onclick="expulsar('${j.id}')">${j.nome}</div>`).join('');
    if (listaLobby) listaLobby.innerHTML = html;
    if (listaHost) listaHost.innerHTML = html;
});

if (socket) socket.on('novaPergunta', ({ pergunta, numero, total }) => {
    document.getElementById('telaLobby').style.display = 'none';
    document.getElementById('painelHost').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';

    document.getElementById('perguntaAtual').innerText = `${numero}/${total}: ${pergunta.texto}`;

    const botoes = document.querySelectorAll('.btn-option');
    botoes.forEach((btn, index) => {
        btn.innerText = pergunta.opcoes[index];
        btn.disabled = false;
        btn.style.display = 'flex';
        btn.className = 'btn-option';
    });
});

if (socket) socket.on('tempoAtualizado', (tempo) => {
    const timerBar = document.getElementById('timerBar');
    const porcentagem = (tempo / 15) * 100;
    timerBar.style.width = `${porcentagem}%`;
});

if (socket) socket.on('resultadoResposta', ({ acertou, streak }) => {
    if (acertou) {
        tocarSom('acerto');
        const streakDisplay = document.getElementById('streakDisplay');
        document.getElementById('streakCount').innerText = streak;
        streakDisplay.style.display = 'block';
        streakDisplay.classList.add('streak-pop');
        setTimeout(() => streakDisplay.classList.remove('streak-pop'), 400);
    } else {
        tocarSom('erro');
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 400);
        document.getElementById('streakDisplay').style.display = 'none';
    }
});

if (socket) socket.on('powerUpAplicado', ({ tipo }) => {
    if (tipo === 'dobro') document.getElementById('pwDobro').disabled = true;
    if (tipo === 'escudo') document.getElementById('pwEscudo').disabled = true;
    if (tipo === 'metade') {
        document.getElementById('pwMetade').disabled = true;
        // Elimina duas erradas visualmente
        const botoes = document.querySelectorAll('.btn-option');
        botoes[0].style.display = 'none';
        botoes[3].style.display = 'none';
    }
});

if (socket) socket.on('estatisticasRespostas', (respostas) => {
    const container = document.getElementById('barrasEstatisticas');
    document.getElementById('estatisticasAoVivo').style.display = 'block';
    container.innerHTML = Object.entries(respostas)
        .map(([opt, qtd]) => `<div class="jogador-badge">Opção ${parseInt(opt)+1}: ${qtd} votos</div>`).join('');
});

if (socket) socket.on('fimDeJogo', (ranking) => {
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('painelHost').style.display = 'none';
    document.getElementById('telaPodio').style.display = 'block';

    if (ranking[0]) document.getElementById('nomePrimeiro').innerText = ranking[0].nome;
    if (ranking[1]) document.getElementById('nomeSegundo').innerText = ranking[1].nome;
    if (ranking[2]) document.getElementById('nomeTerceiro').innerText = ranking[2].nome;

    if (typeof confetti === 'function') confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 } });
});

if (socket) socket.on('expulso', () => {
    alert("Você foi removido da sala pelo host.");
    location.reload();
});

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

async function buscarQuizPorCodigo() {
    const codigo = document.getElementById('codigoBusca')?.value.trim();
    if (!codigo) return alert('Digite o código do quiz.');
    try {
        const quiz = await apiRequest(`/quizzes/codigo/${encodeURIComponent(codigo)}`);
        window.location.href = `jogar.html?id=${quiz._id}`;
    } catch (err) {
        alert(err.message);
    }
}

function filtrarMateria(categoria) {
    window.materiaSelecionada = categoria;
    const normalizar = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const categoriaNormalizada = normalizar(categoria);
    document.querySelectorAll('[data-category]').forEach((item) => item.classList.toggle('is-active', item.dataset.category === categoria));
    document.querySelectorAll('[data-quiz-category]').forEach((card) => { card.hidden = normalizar(card.dataset.quizCategory) !== categoriaNormalizada; });
    document.getElementById('quizList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    tocarSom('categoria');
}