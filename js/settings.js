// DevDen Settings Page - settings.js

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        
        // ===== HAMBURGER MENU TOGGLE =====
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', function() {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
                const isExpanded = navMenu.classList.contains('active');
                hamburger.setAttribute('aria-expanded', isExpanded);
                
                if (window.innerWidth <= 768) {
                    document.body.style.overflow = isExpanded ? 'hidden' : '';
                }
            });
        }
        
        // Close menu on link click (Mobile)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Close menu on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
        
        // Close menu on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
        
        // ===== THEME TOGGLE INTEGRATION =====
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        
        // Set initial radio state based on current theme
        function updateThemeRadios() {
            if (window.DevDen && window.DevDen.theme) {
                const currentTheme = window.DevDen.theme.getTheme();
                themeRadios.forEach(radio => {
                    if (radio.value === currentTheme) {
                        radio.checked = true;
                    }
                });
            }
        }
        
        updateThemeRadios();
        
        // Handle theme radio changes
        themeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked && window.DevDen && window.DevDen.theme) {
                    window.DevDen.theme.applyTheme(this.value);
                    showNotification('Theme updated successfully', 'success');
                }
            });
        });
        
        // ===== PROFILE SETTINGS =====
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        const displayNameInput = document.getElementById('displayName');
        const usernameInput = document.getElementById('username');
        const bioInput = document.getElementById('bio');
        const locationInput = document.getElementById('location');
        
        // Load user profile data
        function loadProfileData() {
            if (window.DevDen && window.DevDen.session) {
                const user = window.DevDen.session.getSession();
                if (user) {
                    // Load saved data from localStorage if exists
                    const savedProfile = localStorage.getItem('devden_profile');
                    if (savedProfile) {
                        try {
                            const profile = JSON.parse(savedProfile);
                            if (displayNameInput) displayNameInput.value = profile.displayName || '';
                            if (usernameInput) usernameInput.value = profile.username || '';
                            if (bioInput) bioInput.value = profile.bio || '';
                            if (locationInput) locationInput.value = profile.location || '';
                        } catch (e) {
                            console.error('Error loading profile:', e);
                        }
                    }
                }
            }
        }
        
        loadProfileData();
        
        // Save profile settings
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', async function() {
                const profileData = {
                    displayName: displayNameInput.value.trim(),
                    username: usernameInput.value.trim(),
                    bio: bioInput.value.trim(),
                    location: locationInput.value.trim()
                };
                
                // Validation
                if (!profileData.displayName) {
                    showNotification('Display name is required', 'error');
                    return;
                }
                
                if (!profileData.username) {
                    showNotification('Username is required', 'error');
                    return;
                }
                
                // Show loading state
                saveProfileBtn.disabled = true;
                saveProfileBtn.textContent = 'Saving...';
                
                try {
                    // Save to localStorage (replace with API call in production)
                    localStorage.setItem('devden_profile', JSON.stringify(profileData));
                    
                    // Simulate API delay
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    showNotification('Profile updated successfully', 'success');
                } catch (error) {
                    console.error('Error saving profile:', error);
                    showNotification('Failed to update profile', 'error');
                } finally {
                    saveProfileBtn.disabled = false;
                    saveProfileBtn.textContent = 'Save Profile';
                }
            });
        }
        
        // ===== ACCOUNT & SECURITY =====
        const updateAccountBtn = document.getElementById('updateAccountBtn');
        const emailInput = document.getElementById('email');
        const currentPasswordInput = document.getElementById('currentPassword');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        // Load email
        function loadAccountData() {
            if (window.DevDen && window.DevDen.session) {
                const user = window.DevDen.session.getSession();
                if (user && emailInput) {
                    emailInput.value = user.email || '';
                }
            }
        }
        
        loadAccountData();
        
        // Update account
        if (updateAccountBtn) {
            updateAccountBtn.addEventListener('click', async function() {
                const email = emailInput.value.trim();
                const currentPassword = currentPasswordInput.value;
                const newPassword = newPasswordInput.value;
                const confirmPassword = confirmPasswordInput.value;
                
                // Validation
                if (!email) {
                    showNotification('Email is required', 'error');
                    return;
                }
                
                if (newPassword || confirmPassword) {
                    if (!currentPassword) {
                        showNotification('Current password is required to change password', 'error');
                        return;
                    }
                    
                    if (newPassword.length < 6) {
                        showNotification('New password must be at least 6 characters', 'error');
                        return;
                    }
                    
                    if (newPassword !== confirmPassword) {
                        showNotification('Passwords do not match', 'error');
                        return;
                    }
                }
                
                updateAccountBtn.disabled = true;
                updateAccountBtn.textContent = 'Updating...';
                
                try {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    showNotification('Account updated successfully', 'success');
                    
                    // Clear password fields
                    currentPasswordInput.value = '';
                    newPasswordInput.value = '';
                    confirmPasswordInput.value = '';
                } catch (error) {
                    console.error('Error updating account:', error);
                    showNotification('Failed to update account', 'error');
                } finally {
                    updateAccountBtn.disabled = false;
                    updateAccountBtn.textContent = 'Update Account';
                }
            });
        }
        
        // ===== NOTIFICATION SETTINGS =====
        const saveNotificationsBtn = document.getElementById('saveNotificationsBtn');
        const notificationToggles = {
            email: document.getElementById('emailNotif'),
            forum: document.getElementById('forumNotif'),
            event: document.getElementById('eventNotif'),
            badge: document.getElementById('badgeNotif')
        };
        
        // Load notification preferences
        function loadNotificationPreferences() {
            const savedPrefs = localStorage.getItem('devden_notifications');
            if (savedPrefs) {
                try {
                    const prefs = JSON.parse(savedPrefs);
                    Object.keys(notificationToggles).forEach(key => {
                        if (notificationToggles[key] && prefs[key] !== undefined) {
                            notificationToggles[key].checked = prefs[key];
                        }
                    });
                } catch (e) {
                    console.error('Error loading notification preferences:', e);
                }
            }
        }
        
        loadNotificationPreferences();
        
        // Save notification preferences
        if (saveNotificationsBtn) {
            saveNotificationsBtn.addEventListener('click', async function() {
                const preferences = {};
                Object.keys(notificationToggles).forEach(key => {
                    if (notificationToggles[key]) {
                        preferences[key] = notificationToggles[key].checked;
                    }
                });
                
                saveNotificationsBtn.disabled = true;
                saveNotificationsBtn.textContent = 'Saving...';
                
                try {
                    localStorage.setItem('devden_notifications', JSON.stringify(preferences));
                    await new Promise(resolve => setTimeout(resolve, 500));
                    showNotification('Notification preferences saved', 'success');
                } catch (error) {
                    console.error('Error saving preferences:', error);
                    showNotification('Failed to save preferences', 'error');
                } finally {
                    saveNotificationsBtn.disabled = false;
                    saveNotificationsBtn.textContent = 'Save Preferences';
                }
            });
        }
        
        // ===== PRIVACY SETTINGS =====
        const savePrivacyBtn = document.getElementById('savePrivacyBtn');
        const privacyToggles = {
            profilePublic: document.getElementById('profilePublic'),
            showEmail: document.getElementById('showEmail'),
            showProjects: document.getElementById('showProjects')
        };
        
        // Load privacy preferences
        function loadPrivacyPreferences() {
            const savedPrefs = localStorage.getItem('devden_privacy');
            if (savedPrefs) {
                try {
                    const prefs = JSON.parse(savedPrefs);
                    Object.keys(privacyToggles).forEach(key => {
                        if (privacyToggles[key] && prefs[key] !== undefined) {
                            privacyToggles[key].checked = prefs[key];
                        }
                    });
                } catch (e) {
                    console.error('Error loading privacy preferences:', e);
                }
            }
        }
        
        loadPrivacyPreferences();
        
        // Save privacy settings
        if (savePrivacyBtn) {
            savePrivacyBtn.addEventListener('click', async function() {
                const preferences = {};
                Object.keys(privacyToggles).forEach(key => {
                    if (privacyToggles[key]) {
                        preferences[key] = privacyToggles[key].checked;
                    }
                });
                
                savePrivacyBtn.disabled = true;
                savePrivacyBtn.textContent = 'Saving...';
                
                try {
                    localStorage.setItem('devden_privacy', JSON.stringify(preferences));
                    await new Promise(resolve => setTimeout(resolve, 500));
                    showNotification('Privacy settings saved', 'success');
                } catch (error) {
                    console.error('Error saving privacy settings:', error);
                    showNotification('Failed to save settings', 'error');
                } finally {
                    savePrivacyBtn.disabled = false;
                    savePrivacyBtn.textContent = 'Save Privacy Settings';
                }
            });
        }
        
        // ===== DELETE ACCOUNT =====
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', function() {
                const confirmation = confirm(
                    'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
                );
                
                if (confirmation) {
                    const doubleConfirm = prompt(
                        'Type "DELETE" to confirm account deletion:'
                    );
                    
                    if (doubleConfirm === 'DELETE') {
                        // Clear all data
                        if (window.DevDen && window.DevDen.session) {
                            window.DevDen.session.clearSession();
                        }
                        localStorage.clear();
                        
                        showNotification('Account deleted successfully', 'success');
                        
                        // Redirect to login after short delay
                        setTimeout(() => {
                            window.location.href = '../index.html';
                        }, 1500);
                    } else {
                        showNotification('Account deletion cancelled', 'info');
                    }
                }
            });
        }
        
        // ===== NOTIFICATION HELPER =====
        function showNotification(message, type = 'info') {
            if (window.DevDen && window.DevDen.showToast) {
                window.DevDen.showToast(message, type);
            } else {
                // Fallback if global function not available
                alert(message);
            }
        }
        
        // ===== CHECK AUTHENTICATION =====
        function checkAuthentication() {
            if (window.DevDen && window.DevDen.session) {
                if (!window.DevDen.session.isLoggedIn()) {
                    window.location.href = '../index.html';
                }
            }
        }
        
        checkAuthentication();
        
    });
    
})();