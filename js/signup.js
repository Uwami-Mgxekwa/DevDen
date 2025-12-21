// DevDen Signup - signup.js
// Back4App Configuration
const BACK4APP_CONFIG = {
    applicationId: '3DpA1rFa6NLxqibZA6at0aktNsqPzwBU2r50JyAf',
    javascriptKey: 'sqrojNjFKJjbsgwu9C1VbnJiWYthwUsjP05IAcEm',
    serverURL: 'https://parseapi.back4app.com'
};

// DOM Elements
const signupForm = document.getElementById('signupForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const agreeTermsCheckbox = document.getElementById('agreeTerms');
const signupBtn = document.getElementById('signupBtn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}

// Hide messages
function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Show loading state
function setLoading(isLoading) {
    if (isLoading) {
        signupBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
    } else {
        signupBtn.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate username format
function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

// Validate password strength
function isValidPassword(password) {
    return password.length >= 6;
}

// Sign up user with Back4App
async function signupUser(username, email, password) {
    try {
        const response = await fetch(`${BACK4APP_CONFIG.serverURL}/users`, {
            method: 'POST',
            headers: {
                'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// Handle form submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }

    if (!isValidUsername(username)) {
        showError('Username must be 3-20 characters and contain only letters, numbers, and underscores');
        return;
    }

    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    if (!isValidPassword(password)) {
        showError('Password must be at least 6 characters long');
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    if (!agreeTermsCheckbox.checked) {
        showError('Please agree to the Terms of Service and Privacy Policy');
        return;
    }

    // Attempt signup
    setLoading(true);

    try {
        const userData = await signupUser(username, email, password);
        
        showSuccess('Account created successfully! Redirecting to login...');
        
        // Clear form
        signupForm.reset();
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle specific error messages
        let errorMsg = 'An error occurred during signup. Please try again.';
        
        if (error.message.includes('username')) {
            errorMsg = 'Username is already taken. Please choose a different one.';
        } else if (error.message.includes('email')) {
            errorMsg = 'Email is already registered. Please use a different email or try logging in.';
        } else if (error.message) {
            errorMsg = error.message;
        }
        
        showError(errorMsg);
    } finally {
        setLoading(false);
    }
});

// Real-time validation feedback
usernameInput.addEventListener('input', function() {
    const username = this.value.trim();
    const hint = this.nextElementSibling;
    
    if (username && !isValidUsername(username)) {
        hint.style.color = 'var(--error-color, #e74c3c)';
        hint.textContent = 'Invalid username format';
    } else {
        hint.style.color = 'var(--text-muted, #666)';
        hint.textContent = '3-20 characters, letters, numbers, and underscores only';
    }
});

passwordInput.addEventListener('input', function() {
    const password = this.value;
    const hint = this.nextElementSibling;
    
    if (password && !isValidPassword(password)) {
        hint.style.color = 'var(--error-color, #e74c3c)';
        hint.textContent = 'Password too short';
    } else {
        hint.style.color = 'var(--text-muted, #666)';
        hint.textContent = 'At least 6 characters';
    }
});

confirmPasswordInput.addEventListener('input', function() {
    const password = passwordInput.value;
    const confirmPassword = this.value;
    
    if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = 'var(--error-color, #e74c3c)';
    } else {
        this.style.borderColor = '';
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
                window.location.href = 'home.html';
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
    
    // Focus username input on load
    usernameInput.focus();
});

// Handle Enter key navigation
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        emailInput.focus();
    }
});

emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordInput.focus();
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        confirmPasswordInput.focus();
    }
});

confirmPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        signupForm.dispatchEvent(new Event('submit'));
    }
});