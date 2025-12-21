// DevDen Global - Dark/Light Mode & Utilities
// This file should be loaded on ALL pages before page-specific scripts

(function() {
    'use strict';

    // Theme Manager
    const ThemeManager = {
        STORAGE_KEY: 'devden_theme',
        DARK_CLASS: 'dark-mode',
        
        // Get saved theme or system preference
        getTheme: function() {
            const savedTheme = localStorage.getItem(this.STORAGE_KEY);
            
            if (savedTheme) {
                return savedTheme;
            }
            
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
            
            return 'light';
        },
        
        // Apply theme to document
        applyTheme: function(theme) {
            if (theme === 'dark') {
                document.documentElement.classList.add(this.DARK_CLASS);
            } else {
                document.documentElement.classList.remove(this.DARK_CLASS);
            }
            
            // Save preference
            localStorage.setItem(this.STORAGE_KEY, theme);
            
            // Update toggle button if it exists
            this.updateToggleButton(theme);
        },
        
        // Toggle between light and dark
        toggleTheme: function() {
            const currentTheme = this.getTheme();
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme);
            return newTheme;
        },
        
        // Update toggle button appearance
        updateToggleButton: function(theme) {
            const toggleBtn = document.getElementById('themeToggle');
            const toggleIcon = document.getElementById('themeIcon');
            
            if (toggleBtn && toggleIcon) {
                const moonIcon = toggleIcon.querySelector('.moon-icon');
                const sunIcon = toggleIcon.querySelector('.sun-icon');
                
                if (moonIcon && sunIcon) {
                    if (theme === 'dark') {
                        moonIcon.style.display = 'none';
                        sunIcon.style.display = 'block';
                        toggleBtn.setAttribute('aria-label', 'Switch to light mode');
                    } else {
                        moonIcon.style.display = 'block';
                        sunIcon.style.display = 'none';
                        toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
                    }
                } else {
                    // Fallback for emoji icons
                    if (theme === 'dark') {
                        toggleIcon.textContent = '☀️';
                        toggleBtn.setAttribute('aria-label', 'Switch to light mode');
                    } else {
                        toggleIcon.textContent = '🌙';
                        toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
                    }
                }
            }
        },
        
        // Initialize theme on page load
        init: function() {
            const theme = this.getTheme();
            this.applyTheme(theme);
            
            // Listen for system theme changes
            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                    // Only auto-switch if user hasn't set a preference
                    if (!localStorage.getItem(this.STORAGE_KEY)) {
                        this.applyTheme(e.matches ? 'dark' : 'light');
                    }
                });
            }
        }
    };
    
    // Apply theme immediately (before page renders to prevent flash)
    ThemeManager.init();
    
    // Session Manager
    const SessionManager = {
        STORAGE_KEY: 'devden_user',
        
        // Get current user session
        getSession: function() {
            const userData = sessionStorage.getItem(this.STORAGE_KEY);
            if (userData) {
                try {
                    return JSON.parse(userData);
                } catch (error) {
                    console.error('Invalid session data:', error);
                    this.clearSession();
                    return null;
                }
            }
            return null;
        },
        
        // Save user session
        setSession: function(userData) {
            sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
        },
        
        // Clear user session
        clearSession: function() {
            sessionStorage.removeItem(this.STORAGE_KEY);
        },
        
        // Check if user is logged in
        isLoggedIn: function() {
            const session = this.getSession();
            return session && session.sessionToken;
        },
        
        // Logout user
        logout: function() {
            this.clearSession();
            // Check if we're in a subdirectory (pages folder)
            const isInPages = window.location.pathname.includes('/pages/');
            window.location.href = isInPages ? '../index.html' : 'index.html';
        }
    };
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        
        // Setup theme toggle button if it exists
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                ThemeManager.toggleTheme();
            });
        }
        
        // Setup logout buttons if they exist
        const logoutButtons = document.querySelectorAll('.logout-btn, #logoutBtn');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to log out?')) {
                    SessionManager.logout();
                }
            });
        });
        
        // Add theme toggle to pages (if not already present)
        addThemeToggleButton();
    });
    
    // Function to add theme toggle button to page
    function addThemeToggleButton() {
        // Check if toggle already exists
        if (document.getElementById('themeToggle')) {
            return;
        }
        
        // Look for a common header/nav location
        const header = document.querySelector('header, nav, .header, .navbar');
        
        if (header) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'themeToggle';
            toggleBtn.className = 'theme-toggle';
            toggleBtn.setAttribute('aria-label', 'Toggle theme');
            
            const icon = document.createElement('span');
            icon.id = 'themeIcon';
            icon.textContent = ThemeManager.getTheme() === 'dark' ? '☀️' : '🌙';
            
            toggleBtn.appendChild(icon);
            header.appendChild(toggleBtn);
        }
    }
    
    // Expose global utilities
    window.DevDen = {
        theme: ThemeManager,
        session: SessionManager,
        
        // Utility: Format date
        formatDate: function(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        
        // Utility: Show toast notification
        showToast: function(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            
            document.body.appendChild(toast);
            
            // Animate in
            setTimeout(() => toast.classList.add('show'), 10);
            
            // Remove after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },
        
        // Utility: Debounce function
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };
    
})();