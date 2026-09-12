const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const seedUserId = process.env.SUPABASE_SEED_USER_ID;

if (!supabaseUrl || !serviceRoleKey || !seedUserId) {
    throw new Error('Defina SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e SUPABASE_SEED_USER_ID.');
}

const localDb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'local-db.json'), 'utf8'));

function uuidFromId(id) {
    const bytes = crypto.createHash('md5').update(String(id)).digest();
    bytes[6] = (bytes[6] & 0x0f) | 0x30;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = bytes.toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function publicarQuizzes() {
    const quizzes = localDb.quizzes.map((quiz) => ({
        id: uuidFromId(quiz._id),
        titulo: quiz.titulo,
        categoria: quiz.categoria,
        codigo: quiz.codigo,
        criador: seedUserId,
        perguntas: quiz.perguntas || [],
        tempo_por_pergunta: quiz.tempoPorPergunta ?? null,
        mostrar_botao_continuar: quiz.mostrarBotaoContinuar !== false,
        exigir_tela_cheia: quiz.exigirTelaCheia === true,
        materiais: quiz.materiais || [],
        fundo_inicio: quiz.fundoInicio || null,
        fundos_quiz: quiz.fundosQuiz || [],
        ativo: quiz.ativo !== false
    }));
    const resposta = await fetch(`${supabaseUrl}/rest/v1/quizzes?on_conflict=codigo`, {
        method: 'POST',
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(quizzes)
    });
    if (!resposta.ok) throw new Error(`Supabase recusou os quizzes: ${resposta.status} ${await resposta.text()}`);
    console.log(`${quizzes.length} quizzes publicados no Supabase.`);
}

publicarQuizzes().catch((erro) => {
    console.error(erro.message);
    process.exitCode = 1;
});