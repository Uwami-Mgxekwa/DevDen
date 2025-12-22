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
            
            // Add icon based on type
            const icons = {
                success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.64 21H20.36A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none"><path d="M12 16V12M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            };
            
            toast.innerHTML = `
                ${icons[type] || icons.info}
                <span class="toast-message">${message}</span>
            `;
            
            document.body.appendChild(toast);
            
            // Animate in
            setTimeout(() => toast.classList.add('show'), 10);
            
            // Remove after 4 seconds
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 4000);
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