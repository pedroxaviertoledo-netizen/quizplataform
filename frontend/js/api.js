let SUPABASE = window.supabaseClient;

async function obterUsuarioSupabase() {
    return SUPABASE?.auth?.getUser();
}

async function exigirUsuario() {
    const { data, error } = await obterUsuarioSupabase();
    if (error || !data?.user) throw new Error('Sessão expirada. Faça login novamente.');
    return data.user;
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

    if (partes[0] === 'atividades' && partes[1] === 'compartilhar' && method === 'POST') {
        const usuario = await exigirUsuario();
        const email = String(body?.email || '').trim().toLowerCase();
        const [{ data: quiz, error: erroQuiz }, { data: destinatario, error: erroDestinatario }, { data: remetente, error: erroRemetente }] = await Promise.all([
            SUPABASE.from('quizzes').select('id,titulo').eq('id', body?.quizId).eq('ativo', true).single(),
            SUPABASE.from('profiles').select('id,email,nome').ilike('email', email).single(),
            SUPABASE.from('profiles').select('nome,email').eq('id', usuario.id).single()
        ]);
        if (erroQuiz || !quiz) throw new Error('Quiz não encontrado.');
        if (erroDestinatario || !destinatario) throw new Error('Não encontramos um usuário com esse e-mail.');
        if (destinatario.id === usuario.id) throw new Error('Escolha o e-mail de outro estudante.');
        if (erroRemetente) throw erroRemetente;
        const { data: atividade, error } = await SUPABASE.from('atividades').insert({
            quiz_id: quiz.id,
            destinatario_id: destinatario.id,
            remetente_id: usuario.id,
            titulo: quiz.titulo,
            remetente: remetente?.nome || usuario.user_metadata?.full_name || 'Seu professor',
            remetente_email: remetente?.email || usuario.email,
            status: 'pendente'
        }).select().single();
        if (error) throw new Error(error.code === '23505' ? 'Este quiz já está pendente para esse estudante.' : error.message);
        return { mensagem: `Quiz compartilhado com ${email}.`, atividade: converterAtividade(atividade) };
    }

    if (partes[0] === 'atividades' && method === 'GET') {
        const usuario = await exigirUsuario();
        const { data, error } = await SUPABASE.from('atividades').select('*').eq('destinatario_id', usuario.id).order('enviada_em', { ascending: false });
        if (error) throw error;
        return (data || []).map(converterAtividade);
    }

    if (partes[0] === 'professor' && partes[1] === 'atividades' && method === 'GET') {
        const usuario = await exigirUsuario();
        const { data, error } = await SUPABASE.from('atividades').select('*').eq('remetente_id', usuario.id).eq('status', 'concluida').order('concluida_em', { ascending: false });
        if (error) throw error;
        return (data || []).map((atividade) => ({ ...converterAtividade(atividade), aluno: atividade.destinatario_id, alunoEmail: '', resultado: atividade.resultado || {} }));
    }

    if (partes[0] === 'quizzes' && partes[1] === 'pontos' && method === 'POST') {
        return { ok: true };
    }

    if (partes[0] !== 'quizzes') throw new Error(`A função ${endpoint} ainda não foi migrada para o Supabase.`);

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
        const usuario = await exigirUsuario();
        const atividadeId = body?.atividadeId || null;
        const nota = Number((((body?.acertos || 0) / Math.max(1, body?.acertos + body?.erros)) * 10).toFixed(2));
        const resultado = { acertos: Number(body?.acertos) || 0, erros: Number(body?.erros) || 0, nota, tempoTotalMs: Number(body?.tempoTotalMs) || 0, respostas: Array.isArray(body?.respostas) ? body.respostas : [], concluidaEm: new Date().toISOString() };
        const { data, error } = await SUPABASE.from('resultados').insert({ quiz_id: partes[1], aluno_id: usuario.id, atividade_id: atividadeId, acertos: resultado.acertos, erros: resultado.erros, nota, tempo_total_ms: resultado.tempoTotalMs, respostas: resultado.respostas, concluida_em: resultado.concluidaEm }).select().single();
        if (error) throw error;
        if (atividadeId) {
            const { error: erroAtividade } = await SUPABASE.from('atividades').update({ status: 'concluida', concluida_em: resultado.concluidaEm, resultado }).eq('id', atividadeId).eq('destinatario_id', usuario.id);
            if (erroAtividade) throw erroAtividade;
        }
        return { ...resultado, id: data.id };
    }

    throw new Error(`A função ${endpoint} ainda não foi migrada para o Supabase.`);
}

function converterAtividade(atividade) {
    return { ...atividade, _id: atividade.id, quizId: atividade.quiz_id, remetenteEmail: atividade.remetente_email, enviadaEm: atividade.enviada_em, concluidaEm: atividade.concluida_em };
}
