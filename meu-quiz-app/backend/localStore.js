const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDirectory = path.join(__dirname, '.data');
const dataFile = path.join(dataDirectory, 'local-db.json');

function ensureStore() {
    fs.mkdirSync(dataDirectory, { recursive: true });
    if (!fs.existsSync(dataFile)) {
        fs.writeFileSync(dataFile, JSON.stringify({ users: [], quizzes: [] }, null, 2));
    }
}

function readStore() {
    ensureStore();
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function writeStore(data) {
    ensureStore();
    const temporaryFile = `${dataFile}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(data, null, 2));
    fs.renameSync(temporaryFile, dataFile);
}

function createId() {
    return crypto.randomBytes(12).toString('hex');
}

function addUser(user) {
    const data = readStore();
    const newUser = { _id: createId(), pontos: 0, ...user };
    data.users.push(newUser);
    writeStore(data);
    return newUser;
}

function findUserByEmail(email) {
    return readStore().users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function findUserById(id) {
    return readStore().users.find((user) => user._id === id);
}

function updateUserPoints(id, points) {
    const data = readStore();
    const user = data.users.find((item) => item._id === id);
    if (!user) return null;
    user.pontos += points;
    writeStore(data);
    return user;
}

function addQuizzes(quizzes) {
    const data = readStore();
    data.quizzes.push(...quizzes.map((quiz) => ({ _id: createId(), ativo: true, ...quiz })));
    writeStore(data);
}

function listQuizzes() {
    return readStore().quizzes.filter((quiz) => quiz.ativo);
}

function findQuizById(id) {
    return listQuizzes().find((quiz) => quiz._id === id);
}

function findQuizByCode(codigo) {
    return listQuizzes().find((quiz) => quiz.codigo === codigo.toUpperCase());
}

module.exports = {
    addQuizzes,
    addUser,
    createId,
    findQuizByCode,
    findQuizById,
    findUserByEmail,
    findUserById,
    listQuizzes,
    readStore,
    writeStore,
    updateUserPoints
};
