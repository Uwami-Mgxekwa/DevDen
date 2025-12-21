// DevDen Login - index.js
// Back4App Configuration
const BACK4APP_CONFIG = {
    applicationId: '3DpA1rFa6NLxqibZA6at0aktNsqPzwBU2r50JyAf', // Your Back4App Application ID
    javascriptKey: 'sqrojNjFKJjbsgwu9C1VbnJiWYthwUsjP05IAcEm', // Your Back4App JavaScript Key
    serverURL: 'https://parseapi.back4app.com'
};

// Initialize Parse SDK (if using Parse SDK)
// Parse.initialize(BACK4APP_CONFIG.applicationId, BACK4APP_CONFIG.javascriptKey);
// Parse.serverURL = BACK4APP_CONFIG.serverURL;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');
const errorMessage = document.getElementById('errorMessage');
const forgotPasswordLink = document.getElementById('forgotPassword');

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}

// Show loading state
function setLoading(isLoading) {
    if (isLoading) {
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
    } else {
        loginBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Login with Back4App
async function loginUser(email, password) {
    try {
        const response = await fetch(`${BACK4APP_CONFIG.serverURL}/login`, {
            method: 'POST',
            headers: {
                'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    // Attempt login
    setLoading(true);

    try {
        const userData = await loginUser(email, password);
        
        // Store session data
        sessionStorage.setItem('devden_user', JSON.stringify({
            sessionToken: userData.sessionToken,
            userId: userData.objectId,
            email: userData.email || email,
            username: userData.username
        }));

        // Redirect to home/dashboard
        window.location.href = 'pages/home.html';
        
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Invalid email or password. Please try again.');
    } finally {
        setLoading(false);
    }
});

// Forgot password handler
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    
    if (email && isValidEmail(email)) {
        // Redirect to password reset with email pre-filled
        window.location.href = `reset-password.html?email=${encodeURIComponent(email)}`;
    } else {
        window.location.href = 'reset-password.html';
    }
});

// Check if user is already logged in
function checkExistingSession() {
    const userData = sessionStorage.getItem('devden_user');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user.sessionToken) {
                // User is already logged in, redirect to home
                window.location.href = 'pages/home.html';
            }
        } catch (error) {
            // Invalid session data, clear it
            sessionStorage.removeItem('devden_user');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkExistingSession();
    
    // Focus email input on load
    emailInput.focus();
});

// Handle Enter key in form inputs
emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordInput.focus();
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginForm.dispatchEvent(new Event('submit'));
    }
});