document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const feedbackMsg = document.getElementById('feedbackMsg');

    // Core Login Logic
    const handleLogin = async (e) => {
        e.preventDefault();

        // reset state
        hideError();
        setLoading(true);

        // Get values
        const identifier = document.getElementById('identifier').value.trim();
        const password = document.getElementById('password').value;

        // Basic Validation
        if (!identifier || !password) {
            showError('Please enter both ID/Email and Password.');
            setLoading(false);
            return;
        }

        try {
            // Using global apiFetch from app.js
            // Ensure app.js is loaded prior
            const data = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ identifier, password }),
            });

            // If success, store auth and redirect
            // Assuming setAuth is in app.js
            if (typeof setAuth === 'function') {
                setAuth(data);
            } else {
                // Fallback if app.js not loaded correctly
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
            }

            // Success Visuals
            loginBtn.innerHTML = '<span class="btn-content">Success!</span>';
            loginBtn.style.background = '#10b981'; // Green

            // Redirect
            setTimeout(() => {
                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                } else {
                    window.location.href = data.role === 'admin'
                        ? '/pages/admin/dashboard.html'
                        : '/pages/student/dashboard.html';
                }
            }, 800);

        } catch (error) {
            console.error(error);
            showError(error.message || 'Invalid credentials. Please try again.');
            setLoading(false);
            shakeCard();
        }
    };

    // UI Helpers
    function setLoading(isLoading) {
        if (isLoading) {
            loginBtn.classList.add('loading');
        } else {
            loginBtn.classList.remove('loading');
        }
    }

    function showError(msg) {
        feedbackMsg.textContent = msg;
        feedbackMsg.classList.add('show');
    }

    function hideError() {
        feedbackMsg.classList.remove('show');
    }

    function shakeCard() {
        const card = document.querySelector('.glass-card');
        card.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 400,
            easing: 'ease-in-out'
        });
    }

    // Event Listeners
    loginForm.addEventListener('submit', handleLogin);

    // Input Focus Effects (for extra polish if needed, though CSS handles mostly)
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (feedbackMsg.classList.contains('show')) hideError();
        });
    });
});
