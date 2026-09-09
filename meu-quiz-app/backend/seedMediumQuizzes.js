const bancosDePerguntas = require('./mediumDifficultQuestionBanks');

const titulos = [
    ['Desafio Médio de Matemática I', 'Matemática'],
    ['Desafio Médio de Matemática II', 'Matemática'],
    ['Desafio Médio de Português I', 'Português'],
    ['Desafio Médio de Português II', 'Português'],
    ['Desafio Médio de História I', 'História'],
    ['Desafio Médio de História II', 'História'],
    ['Desafio Médio de Geografia I', 'Geografia'],
    ['Desafio Médio de Geografia II', 'Geografia'],
    ['Desafio Médio de Ciências I', 'Ciências'],
    ['Desafio Médio de Ciências II', 'Ciências'],
    ['Desafio Médio de Biologia I', 'Biologia'],
    ['Desafio Médio de Biologia II', 'Biologia'],
    ['Desafio Médio de Física I', 'Física'],
    ['Desafio Médio de Física II', 'Física'],
    ['Desafio Médio de Química I', 'Química'],
    ['Desafio Médio de Química II', 'Química'],
    ['Desafio Médio de Inglês I', 'Inglês'],
    ['Desafio Médio de Inglês II', 'Inglês'],
    ['Desafio Médio de Literatura I', 'Literatura'],
    ['Desafio Médio de Literatura II', 'Literatura'],
    ['Desafio Médio de Tecnologia I', 'Tecnologia'],
    ['Desafio Médio de Tecnologia II', 'Tecnologia'],
    ['Desafio Médio de Artes I', 'Artes'],
    ['Desafio Médio de Artes II', 'Artes'],
    ['Desafio Médio de Filosofia I', 'Filosofia'],
    ['Desafio Médio de Filosofia II', 'Filosofia'],
    ['Desafio Médio de Educação Financeira I', 'Educação Financeira'],
    ['Desafio Médio de Educação Financeira II', 'Educação Financeira'],
    ['Desafio Médio de Saúde I', 'Saúde'],
    ['Desafio Médio de Saúde II', 'Saúde'],
    ['Desafio Médio de Meio Ambiente I', 'Meio Ambiente'],
    ['Desafio Médio de Meio Ambiente II', 'Meio Ambiente'],
    ['Desafio Médio de Conhecimentos Gerais I', 'Conhecimentos Gerais'],
    ['Desafio Médio de Conhecimentos Gerais II', 'Conhecimentos Gerais'],
    ['Desafio Médio de Raciocínio I', 'Raciocínio'],
    ['Desafio Médio de Raciocínio II', 'Raciocínio'],
    ['Desafio Médio de Revisão Escolar I', 'Revisão Escolar'],
    ['Desafio Médio de Revisão Escolar II', 'Revisão Escolar'],
    ['Desafio Médio de Cultura e Sociedade I', 'Cultura e Sociedade'],
    ['Desafio Médio de Cultura e Sociedade II', 'Cultura e Sociedade']
];

function prepararPerguntas(banco, indice) {
    const perguntas = banco.slice(0, 10).map((pergunta) => ({ ...pergunta, opcoes: [...pergunta.opcoes] }));
    if (indice % 2 === 0) return perguntas;

    return perguntas.reverse().map((pergunta) => {
        const opcoes = pergunta.opcoes.map((_, opcaoIndice) => pergunta.opcoes[(opcaoIndice + 1) % pergunta.opcoes.length]);
        return {
            ...pergunta,
            opcoes,
            respostaCorreta: (pergunta.respostaCorreta + pergunta.opcoes.length - 1) % pergunta.opcoes.length
        };
    });
}

function garantirQuizzesMedios(readData, writeData, createId) {
    const data = readData();
    if (data.catalogoQuizzesAtualizado === 'media-dificil-v6-40-segundos-perguntas-distintas') return 0;
    const categoriasDisponiveis = Object.entries(bancosDePerguntas);
    const novos = titulos.map(([titulo, categoria], indice) => {
            const banco = bancosDePerguntas[categoria] || categoriasDisponiveis[indice % categoriasDisponiveis.length][1];
            return {
                _id: createId(),
                titulo,
                categoria,
                dificuldade: 'media-dificil',
                codigo: Math.random().toString(36).slice(2, 8).toUpperCase(),
                perguntas: prepararPerguntas(banco, indice).map((pergunta) => ({ ...pergunta, tempoSegundos: 40 })),
                tempoPorPergunta: 40,
                mostrarBotaoContinuar: true,
                exigirTelaCheia: true,
                materiais: [],
                fundoInicio: null,
                fundosQuiz: [],
                ativo: true,
                criador: 'sistema'
            };
        });

    data.quizzes = novos;
    data.catalogoQuizzesAtualizado = 'media-dificil-v6-40-segundos-perguntas-distintas';
    writeData(data);
    return novos.length;
}

module.exports = { garantirQuizzesMedios };
