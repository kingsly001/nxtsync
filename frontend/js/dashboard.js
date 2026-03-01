document.addEventListener('DOMContentLoaded', () => {
    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        // assuming logout() is globally available from app.js
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Load Profile
    if (typeof studentLogic !== 'undefined') {
        studentLogic.loadProfile();
    }
});
