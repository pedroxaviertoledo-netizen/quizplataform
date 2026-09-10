// Aplicação principal

class QuizApp {
    constructor() {
        this.appElement = document.getElementById('app');
        this.quizzes = [];
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        switch (this.currentPage) {
            case 'home':
                this.renderHome();
                break;
            case 'login':
                this.renderLogin();
                break;
            case 'register':
                this.renderRegister();
                break;
            case 'dashboard':
                this.renderDashboard();
                break;
            default:
                this.renderHome();
        }
    }

    renderHome() {
        this.appElement.innerHTML = `
            <div class="container">
                <div class="header">
                    <h1>Quiz Plataform</h1>
                    <p>Bem-vindo ao nosso aplicativo de Quiz</p>
                </div>
                <div class="button-group">
                    <button class="btn-primary" onclick="app.navigateTo('login')">Login</button>
                    <button class="btn-secondary" onclick="app.navigateTo('register')">Registrar</button>
                </div>
            </div>
        `;
    }

    renderLogin() {
        this.appElement.innerHTML = `
            <div class="container">
                <div class="header">
                    <h1>Login</h1>
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Senha</label>
                        <input type="password" id="password" required>
                    </div>
                    <div class="button-group">
                        <button type="submit" class="btn-primary">Entrar</button>
                        <button type="button" class="btn-secondary" onclick="app.navigateTo('home')">Voltar</button>
                    </div>
                </form>
            </div>
        `;
    }

    renderRegister() {
        this.appElement.innerHTML = `
            <div class="container">
                <div class="header">
                    <h1>Registrar</h1>
                </div>
                <form id="registerForm">
                    <div class="form-group">
                        <label for="name">Nome</label>
                        <input type="text" id="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Senha</label>
                        <input type="password" id="password" required>
                    </div>
                    <div class="button-group">
                        <button type="submit" class="btn-primary">Registrar</button>
                        <button type="button" class="btn-secondary" onclick="app.navigateTo('home')">Voltar</button>
                    </div>
                </form>
            </div>
        `;
    }

    renderDashboard() {
        this.appElement.innerHTML = `
            <div class="container">
                <div class="header">
                    <h1>Dashboard</h1>
                </div>
                <div id="quizzes"></div>
                <div class="button-group">
                    <button class="btn-secondary" onclick="app.navigateTo('home')">Logout</button>
                </div>
            </div>
        `;
    }

    navigateTo(page) {
        this.currentPage = page;
        this.render();
        this.attachEventListeners();
    }

    attachEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                console.log('Login:', { email, password });
                // Aqui você chamaria auth.login(email, password)
            });
        }

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                console.log('Register:', { name, email, password });
                // Aqui você chamaria auth.register(email, password, name)
            });
        }
    }
}

const app = new QuizApp();
