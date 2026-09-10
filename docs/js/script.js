const quizData = [
    {
        question: "Qual é a capital da França?",
        options: ["Londres", "Paris", "Berlim", "Madri"],
        correct: 1
    },
    {
        question: "Qual é o maior planeta do sistema solar?",
        options: ["Marte", "Saturno", "Júpiter", "Netuno"],
        correct: 2
    },
    {
        question: "Qual é a linguagem de programação mais usada para web?",
        options: ["Python", "JavaScript", "Java", "C++"],
        correct: 1
    },
    {
        question: "Quantos continentes existem?",
        options: ["5", "6", "7", "8"],
        correct: 2
    },
    {
        question: "Qual é o elemento químico com símbolo Au?",
        options: ["Prata", "Ouro", "Alumínio", "Argônio"],
        correct: 1
    }
];

let currentQuestion = 0;
let score = 0;
let selectedAnswers = [];

function initQuiz() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="quiz-container">
            <h1>🎯 Quiz Plataform</h1>
            <button onclick="startQuiz()">Começar Quiz</button>
        </div>
    `;
}

function startQuiz() {
    currentQuestion = 0;
    score = 0;
    selectedAnswers = [];
    loadQuestion();
}

function loadQuestion() {
    const app = document.getElementById('app');
    const question = quizData[currentQuestion];
    
    let optionsHTML = '';
    question.options.forEach((option, index) => {
        optionsHTML += `
            <div class="option" onclick="selectOption(${index})" id="option-${index}">
                ${option}
            </div>
        `;
    });
    
    app.innerHTML = `
        <div class="quiz-container">
            <h1>🎯 Quiz Plataform</h1>
            <div class="question">
                <p>Pergunta ${currentQuestion + 1}/${quizData.length}</p>
                <p>${question.question}</p>
                <div class="options">
                    ${optionsHTML}
                </div>
            </div>
            <button onclick="nextQuestion()" id="nextBtn" disabled>Próxima Pergunta</button>
        </div>
    `;
}

function selectOption(index) {
    // Remove todas as seleções
    document.querySelectorAll('.option').forEach(el => el.classList.remove('selected'));
    // Adiciona seleção ao clicado
    document.getElementById(`option-${index}`).classList.add('selected');
    selectedAnswers[currentQuestion] = index;
    document.getElementById('nextBtn').disabled = false;
}

function nextQuestion() {
    const question = quizData[currentQuestion];
    if (selectedAnswers[currentQuestion] === question.correct) {
        score++;
    }
    
    currentQuestion++;
    
    if (currentQuestion < quizData.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    const app = document.getElementById('app');
    const percentage = Math.round((score / quizData.length) * 100);
    let message = '';
    
    if (percentage === 100) {
        message = '🏆 Perfeito! Você é um mestre!';
    } else if (percentage >= 80) {
        message = '⭐ Excelente desempenho!';
    } else if (percentage >= 60) {
        message = '👍 Bom trabalho!';
    } else {
        message = '📚 Tente novamente!';
    }
    
    app.innerHTML = `
        <div class="quiz-container results">
            <h1>🎯 Quiz Plataform</h1>
            <h2>${message}</h2>
            <div class="score">${score}/${quizData.length}</div>
            <p>Você acertou ${percentage}% das questões</p>
            <button onclick="initQuiz()">Fazer Quiz Novamente</button>
        </div>
    `;
}

// Inicializa o quiz quando a página carrega
document.addEventListener('DOMContentLoaded', initQuiz);