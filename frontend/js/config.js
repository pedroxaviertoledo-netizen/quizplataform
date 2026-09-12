window.SUPABASE_CONFIG = window.SUPABASE_CONFIG || {
    url: 'https://xvakdcanppdgpwkwxjrl.supabase.co',
    anonKey: 'sb_publishable__dqFtO5TMNDKjAiMOJYIMA_P__sHyqQ'
};

window.supabaseReady = window.supabaseReady || new Promise((resolve, reject) => {
    const inicializar = () => {
        const { url, anonKey } = window.SUPABASE_CONFIG;
        if (!window.supabase?.createClient || !url || !anonKey) {
            reject(new Error('Configuração do Supabase incompleta.'));
            return;
        }
        window.supabaseClient = window.supabase.createClient(url, anonKey);
        resolve(window.supabaseClient);
    };

    if (window.supabase?.createClient) {
        inicializar();
        return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = inicializar;
    script.onerror = () => reject(new Error('Não foi possível carregar o SDK do Supabase.'));
    document.head.appendChild(script);
});

window.toggleDarkMode = function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (typeof configurarCabecalho === 'function') configurarCabecalho();
    console.log("Modo escuro acionado com sucesso!");
};

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    document.querySelectorAll('.theme-toggle').forEach((botao) => {
        botao.textContent = document.body.classList.contains('dark-mode') ? '☀' : '☾';
        botao.title = 'Alternar tema';
        botao.setAttribute('aria-label', 'Alternar tema claro e escuro');
    });
    document.querySelectorAll('.navbar, nav').forEach((nav) => {
        const links = nav.querySelector('.nav-links');
        if (!links || nav.querySelector('.menu-toggle')) return;
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'menu-toggle';
        botao.setAttribute('aria-label', 'Abrir menu de navegação');
        botao.setAttribute('aria-expanded', 'false');
        botao.innerHTML = '<span></span><span></span><span></span>';
        nav.insertBefore(botao, links);
        botao.addEventListener('click', () => {
            const aberto = nav.classList.toggle('menu-open');
            botao.setAttribute('aria-expanded', String(aberto));
            botao.setAttribute('aria-label', aberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
        });
        links.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('menu-open')));
    });
});
