window.SUPABASE_CONFIG = {
    url: 'https://xvakdcanppdgpwkwxjrl.supabase.co',
    anonKey: 'sb_publishable__dqFtO5TMNDKjAiMOJYIMA_P__sHyqQ'
};

window.supabaseReady = window.supabaseReady || new Promise((resolve, reject) => {
    const inicializar = () => {
        if (!window.supabase?.createClient) {
            reject(new Error('Não foi possível carregar o SDK do Supabase.'));
            return;
        }
        window.supabaseClient = window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
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
    console.log("Modo escuro acionado com sucesso!");
};

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});
