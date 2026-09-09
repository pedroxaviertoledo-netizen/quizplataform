const studyKey = `quiz-platform-estudos-${localStorage.getItem('token') || 'local'}`;
const studyData = JSON.parse(localStorage.getItem(studyKey) || '{"cards":[],"notes":[],"manual":""}');
let currentCard = 0;
let cardFlipped = false;

function saveStudyData() { localStorage.setItem(studyKey, JSON.stringify(studyData)); }
function updateStudyStats() {
    document.getElementById('studyCardCount').textContent = studyData.cards.length;
    document.getElementById('studyNoteCount').textContent = studyData.notes.length;
}
function renderFlashcard() {
    const view = document.getElementById('flashcardView');
    const card = studyData.cards[currentCard];
    document.getElementById('flashcardPosition').textContent = studyData.cards.length ? `${currentCard + 1} / ${studyData.cards.length}` : '0 / 0';
    ['previousCard', 'flipCard', 'nextCard'].forEach((id) => { document.getElementById(id).disabled = !studyData.cards.length; });
    if (!card) { view.innerHTML = '<p class="empty-state">Crie seu primeiro cartão para começar.</p>'; return; }
    view.classList.toggle('is-flipped', cardFlipped);
    view.innerHTML = `<div class="flashcard-face"><span>${cardFlipped ? 'RESPOSTA' : 'FRENTE'}</span><strong>${cardFlipped ? card.back : card.front}</strong></div>`;
}
function renderNotes() {
    document.getElementById('notesList').innerHTML = studyData.notes.length ? studyData.notes.map((note, index) => `<article class="study-note"><div><h3>${note.title}</h3><p>${note.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p></div><button type="button" data-note="${index}" aria-label="Excluir anotação">×</button></article>`).join('') : '<p class="empty-state">Suas anotações salvas aparecerão aqui.</p>';
    document.querySelectorAll('[data-note]').forEach((button) => button.addEventListener('click', () => { studyData.notes.splice(Number(button.dataset.note), 1); saveStudyData(); renderNotes(); updateStudyStats(); }));
}

document.getElementById('flashcardForm').addEventListener('submit', (event) => { event.preventDefault(); studyData.cards.push({ front: document.getElementById('cardFront').value.trim(), back: document.getElementById('cardBack').value.trim() }); event.target.reset(); currentCard = studyData.cards.length - 1; cardFlipped = false; saveStudyData(); renderFlashcard(); updateStudyStats(); });
document.getElementById('flipCard').addEventListener('click', () => { cardFlipped = !cardFlipped; renderFlashcard(); });
document.getElementById('previousCard').addEventListener('click', () => { if (currentCard > 0) currentCard--; cardFlipped = false; renderFlashcard(); });
document.getElementById('nextCard').addEventListener('click', () => { if (currentCard < studyData.cards.length - 1) currentCard++; cardFlipped = false; renderFlashcard(); });
document.getElementById('noteForm').addEventListener('submit', (event) => { event.preventDefault(); studyData.notes.unshift({ title: document.getElementById('noteTitle').value.trim(), content: document.getElementById('noteContent').value.trim() }); event.target.reset(); saveStudyData(); renderNotes(); updateStudyStats(); });
const manualNotes = document.getElementById('manualNotes');
manualNotes.value = studyData.manual;
manualNotes.addEventListener('input', () => { studyData.manual = manualNotes.value; saveStudyData(); document.getElementById('manualSaved').textContent = 'Salvo agora'; clearTimeout(window.manualSaveLabel); window.manualSaveLabel = setTimeout(() => { document.getElementById('manualSaved').textContent = 'Salvo automaticamente'; }, 1200); });
renderFlashcard(); renderNotes(); updateStudyStats();
