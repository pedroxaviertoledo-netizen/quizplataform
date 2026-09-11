window.SUPABASE_CONFIG = window.SUPABASE_CONFIG || {
    url: 'https://xvakdcanppdgpwkwxjrl.supabase.co',
    anonKey: 'sb_publishable__dqFtO5TMNDKjAiMOJYIMA_P__sHyqQ'
};

window.supabaseClient = null;

if (window.supabase?.createClient) {
    const { url, anonKey } = window.SUPABASE_CONFIG;
    if (url && anonKey) {
        window.supabaseClient = window.supabase.createClient(url, anonKey);
    }
}

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
