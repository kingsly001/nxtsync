// Floating Label Logic & Login Handler
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.modern-input');

    inputs.forEach(input => {
        if (input.value) input.classList.add('has-value');

        input.addEventListener('focus', () => input.parentElement.classList.add('focused'));
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
            if (input.value) input.classList.add('has-value');
            else input.classList.remove('has-value');
        });
        input.addEventListener('change', () => {
            if (input.value) input.classList.add('has-value');
        });
    });

    const loginForm = document.getElementById('loginForm');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentId = document.getElementById('studentId').value;
        const password = document.getElementById('password').value;

        // Loading State
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loader"></span> Logging in...';
        submitBtn.classList.add('loading');

        try {
            const data = await apiFetch('/auth/student/login', {
                method: 'POST',
                body: JSON.stringify({ studentId, password }),
            });

            setAuth(data);
            window.location.href = 'pages/student/dashboard.html';
        } catch (error) {
            alert(error.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            submitBtn.classList.remove('loading');
        }
    });
});
