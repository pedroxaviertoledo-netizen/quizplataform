window.SUPABASE_CONFIG = {
    url: 'https://xvakdcanppdgpwkwxjrl.supabase.co',
    anonKey: 'sb_publishable__dqFtO5TMNDKjAiMOJYIMA_P__sHyqQ'
};

window.supabaseClient = window.supabase?.createClient
    ? window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey)
    : null;

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
