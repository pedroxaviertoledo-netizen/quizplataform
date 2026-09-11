let SUPABASE = window.supabaseClient;

async function obterUsuarioSupabase() {
    return SUPABASE?.auth?.getUser();
}

function converterQuiz(quiz, ocultarRespostas = false) {
    const perguntas = (quiz.perguntas || []).map((pergunta) => {
        if (!ocultarRespostas) return pergunta;
        const { respostaCorreta, ...semResposta } = pergunta;
        return semResposta;
    });
    return {
        ...quiz,
        _id: quiz.id,
        criador: quiz.criador,
        tempoPorPergunta: quiz.tempo_por_pergunta,
        mostrarBotaoContinuar: quiz.mostrar_botao_continuar,
        exigirTelaCheia: quiz.exigir_tela_cheia,
        fundoInicio: quiz.fundo_inicio,
        fundosQuiz: quiz.fundos_quiz,
        perguntas
    };
}

async function apiRequest(endpoint, method = 'GET', body = null) {
    if (!SUPABASE && window.supabaseReady) {
        SUPABASE = await window.supabaseReady;
    }
    if (!SUPABASE) {
        throw new Error('O cliente Supabase não foi carregado. Recarregue a página.');
    }

    const partes = endpoint.split('?')[0].split('/').filter(Boolean);
    if (partes[0] !== 'quizzes') {
        throw new Error(`A função ${endpoint} ainda não foi migrada para o Supabase.`);
    }

    if (partes.length === 1 && method === 'GET') {
        const { data, error } = await SUPABASE
            .from('quizzes')
            .select('*')
            .eq('ativo', true)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map((quiz) => converterQuiz(quiz, true));
    }

    if (partes[1] === 'criar' && method === 'POST') {
        const { data: sessao, error: erroSessao } = await obterUsuarioSupabase();
        if (erroSessao || !sessao?.user) throw new Error('Sessão expirada. Faça login novamente.');
        const codigo = Math.random().toString(36).slice(2, 8).toUpperCase();
        const registro = {
            titulo: body.titulo,
            categoria: body.categoria,
            codigo,
            criador: sessao.user.id,
            perguntas: (body.perguntas || []).map((pergunta) => ({ ...pergunta, tempoSegundos: body.tempoPorPergunta ?? null })),
            tempo_por_pergunta: body.tempoPorPergunta ?? null,
            mostrar_botao_continuar: body.mostrarBotaoContinuar !== false,
            exigir_tela_cheia: body.exigirTelaCheia === true,
            materiais: body.materiais || [],
            fundo_inicio: body.fundoInicio || null,
            fundos_quiz: body.fundosQuiz || []
        };
        const { data, error } = await SUPABASE.from('quizzes').insert(registro).select().single();
        if (error) throw error;
        return { mensagem: 'Quiz criado com sucesso!', quiz: converterQuiz(data), codigo };
    }

    if (partes[1] === 'codigo' && method === 'GET') {
        const { data, error } = await SUPABASE
            .from('quizzes')
            .select('*')
            .eq('codigo', partes[2].toUpperCase())
            .eq('ativo', true)
            .single();
        if (error) throw new Error('Quiz não encontrado com este código.');
        return converterQuiz(data);
    }

    if (partes.length === 2 && method === 'GET') {
        const { data, error } = await SUPABASE.from('quizzes').select('*').eq('id', partes[1]).eq('ativo', true).single();
        if (error) throw new Error('Quiz não encontrado.');
        return converterQuiz(data);
    }

    if (partes.length === 2 && method === 'DELETE') {
        const { error } = await SUPABASE.from('quizzes').update({ ativo: false }).eq('id', partes[1]);
        if (error) throw error;
        return { ok: true };
    }

    if (partes[2] === 'resultado') {
        throw new Error('Resultados ainda não foram migrados para o Supabase.');
    }

    throw new Error(`A função ${endpoint} ainda não foi migrada para o Supabase.`);
}
