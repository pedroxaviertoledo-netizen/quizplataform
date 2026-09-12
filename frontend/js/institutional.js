document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.admin-tab').forEach((tab) => tab.addEventListener('click', () => {
        document.querySelectorAll('.admin-tab').forEach((item) => item.classList.toggle('is-active', item === tab));
        document.querySelectorAll('.admin-view').forEach((view) => view.classList.toggle('is-active', view.dataset.view === tab.dataset.tab));
    }));
});
