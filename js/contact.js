// DevDen Contact Page - contact.js

(function() {
    'use strict';

    // Back4App Configuration
    const BACK4APP_CONFIG = {
        applicationId: '3DpA1rFa6NLxqibZA6at0aktNsqPzwBU2r50JyAf',
        javascriptKey: 'sqrojNjFKJjbsgwu9C1VbnJiWYthwUsjP05IAcEm',
        serverURL: 'https://parseapi.back4app.com'
    };

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
        
        // ===== CLOSE MENU ON LINK CLICK =====
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
        
        // ===== WINDOW RESIZE HANDLER =====
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            }, 250);
        });
        
        // ===== CLOSE MENU ON ESC KEY =====
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
        
        // ===== AUTHENTICATION CHECK =====
        function checkAuthentication() {
            if (window.DevDen && window.DevDen.session) {
                if (!window.DevDen.session.isLoggedIn()) {
                    window.location.href = '../index.html';
                }
            }
        }
        
        checkAuthentication();
        
        // ===== CONTACT TYPE SELECTION =====
        const optionCards = document.querySelectorAll('.option-card');
        const contactTypeInput = document.getElementById('contactType');
        const formTitle = document.getElementById('formTitle');
        const formSubtitle = document.getElementById('formSubtitle');
        const priorityGroup = document.getElementById('priorityGroup');
        const browserGroup = document.getElementById('browserGroup');
        
        const formTitles = {
            support: 'Send us a Message',
            bug: 'Report a Bug',
            feature: 'Request a Feature'
        };
        
        const formSubtitles = {
            support: 'Fill out the form below and we\'ll get back to you as soon as possible.',
            bug: 'Help us fix issues by providing detailed information about the bug you encountered.',
            feature: 'Share your ideas for new features or improvements you\'d like to see.'
        };
        
        optionCards.forEach(card => {
            card.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                
                // Remove active class from all cards
                optionCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                this.classList.add('active');
                
                // Update hidden input
                contactTypeInput.value = type;
                
                // Update form title and subtitle
                formTitle.textContent = formTitles[type];
                formSubtitle.textContent = formSubtitles[type];
                
                // Show/hide bug-specific fields
                if (type === 'bug') {
                    priorityGroup.style.display = 'block';
                    browserGroup.style.display = 'block';
                } else {
                    priorityGroup.style.display = 'none';
                    browserGroup.style.display = 'none';
                }
                
                // Scroll to form
                document.querySelector('.form-container').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            });
        });
        
        // ===== AUTO-DETECT BROWSER INFO =====
        const browserInput = document.getElementById('browser');
        if (browserInput) {
            const userAgent = navigator.userAgent;
            let browserInfo = '';
            
            // Detect browser
            if (userAgent.indexOf('Firefox') > -1) {
                browserInfo = 'Firefox';
            } else if (userAgent.indexOf('Chrome') > -1) {
                browserInfo = 'Chrome';
            } else if (userAgent.indexOf('Safari') > -1) {
                browserInfo = 'Safari';
            } else if (userAgent.indexOf('Edge') > -1) {
                browserInfo = 'Edge';
            } else {
                browserInfo = 'Unknown Browser';
            }
            
            // Detect OS
            let os = '';
            if (userAgent.indexOf('Win') > -1) os = 'Windows';
            else if (userAgent.indexOf('Mac') > -1) os = 'macOS';
            else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
            else if (userAgent.indexOf('Android') > -1) os = 'Android';
            else if (userAgent.indexOf('iOS') > -1) os = 'iOS';
            else os = 'Unknown OS';
            
            browserInput.value = `${browserInfo} on ${os}`;
        }
        
        // ===== FILE INPUT HANDLER =====
        const fileInput = document.getElementById('attachment');
        const fileName = document.getElementById('fileName');
        
        if (fileInput && fileName) {
            fileInput.addEventListener('change', function() {
                if (this.files && this.files.length > 0) {
                    const file = this.files[0];
                    fileName.textContent = file.name;
                    
                    // Validate file size (5MB max)
                    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
                    if (file.size > maxSize) {
                        showFieldError('attachment', 'File size must be less than 5MB');
                        this.value = '';
                        fileName.textContent = 'Choose file';
                    } else {
                        clearFieldError('attachment');
                    }
                } else {
                    fileName.textContent = 'Choose file';
                }
            });
        }
        
        // ===== CHARACTER COUNTER =====
        const messageTextarea = document.getElementById('message');
        const charCount = document.getElementById('charCount');
        
        if (messageTextarea && charCount) {
            messageTextarea.addEventListener('input', function() {
                const length = this.value.length;
                const maxLength = 1000;
                charCount.textContent = `${length} / ${maxLength}`;
                
                if (length > maxLength) {
                    charCount.style.color = 'var(--error)';
                } else {
                    charCount.style.color = 'var(--text-secondary)';
                }
            });
        }
        
        // ===== FORM VALIDATION =====
        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        function showFieldError(fieldName, message) {
            const input = document.getElementById(fieldName);
            const error = document.getElementById(`${fieldName}Error`);
            
            if (input && error) {
                input.classList.add('error');
                error.textContent = message;
                error.classList.add('show');
            }
        }
        
        function clearFieldError(fieldName) {
            const input = document.getElementById(fieldName);
            const error = document.getElementById(`${fieldName}Error`);
            
            if (input && error) {
                input.classList.remove('error');
                error.textContent = '';
                error.classList.remove('show');
            }
        }
        
        function validateForm() {
            let isValid = true;
            
            // Clear all errors
            ['name', 'email', 'subject', 'message', 'attachment'].forEach(clearFieldError);
            
            // Validate name
            const name = document.getElementById('name').value.trim();
            if (name.length < 2) {
                showFieldError('name', 'Name must be at least 2 characters');
                isValid = false;
            }
            
            // Validate email
            const email = document.getElementById('email').value.trim();
            if (!validateEmail(email)) {
                showFieldError('email', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate subject
            const subject = document.getElementById('subject').value.trim();
            if (subject.length < 5) {
                showFieldError('subject', 'Subject must be at least 5 characters');
                isValid = false;
            }
            
            // Validate message
            const message = document.getElementById('message').value.trim();
            if (message.length < 20) {
                showFieldError('message', 'Message must be at least 20 characters');
                isValid = false;
            }
            if (message.length > 1000) {
                showFieldError('message', 'Message must not exceed 1000 characters');
                isValid = false;
            }
            
            return isValid;
        }
        
        // ===== FORM SUBMISSION =====
        const contactForm = document.getElementById('contactForm');
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        const errorMessageText = document.getElementById('errorMessageText');
        
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Show loading state
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';
            
            try {
                // Get form data
                const formData = {
                    name: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    subject: document.getElementById('subject').value.trim(),
                    message: document.getElementById('message').value.trim(),
                    contactType: document.getElementById('contactType').value,
                    priority: document.getElementById('priority').value,
                    browserInfo: document.getElementById('browser').value,
                    createdAt: new Date().toISOString()
                };
                
                // Get user session
                const session = window.DevDen.session.getSession();
                if (session) {
                    formData.userId = session.objectId;
                    formData.userEmail = session.email;
                }
                
                // Create headers
                const headers = {
                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                    'Content-Type': 'application/json'
                };
                
                if (session && session.sessionToken) {
                    headers['X-Parse-Session-Token'] = session.sessionToken;
                }
                
                // Send to Back4App
                const response = await fetch(`${BACK4APP_CONFIG.serverURL}/classes/ContactMessage`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to submit contact form');
                }
                
                const result = await response.json();
                console.log('Contact message submitted:', result);
                
                // Show success message
                successMessage.style.display = 'flex';
                
                // Reset form
                contactForm.reset();
                fileName.textContent = 'Choose file';
                charCount.textContent = '0 / 1000';
                
                // Remove active state from option cards
                optionCards.forEach(c => c.classList.remove('active'));
                
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
            } catch (error) {
                console.error('Error submitting contact form:', error);
                
                // Show error message
                errorMessageText.textContent = 'There was an error sending your message. Please try again or contact us directly at support@devden.co.za';
                errorMessage.style.display = 'flex';
                
                // Scroll to error message
                errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
            }
        });
        
        // ===== AUTO-FILL USER DATA =====
        async function autoFillUserData() {
            if (window.DevDen && window.DevDen.session) {
                const user = window.DevDen.session.getSession();
                
                if (user) {
                    // Fill email field
                    const emailInput = document.getElementById('email');
                    if (emailInput && user.email) {
                        emailInput.value = user.email;
                    }
                    
                    // Try to get display name
                    const nameInput = document.getElementById('name');
                    if (nameInput && user.sessionToken) {
                        try {
                            const response = await fetch(`${BACK4APP_CONFIG.serverURL}/users/me`, {
                                headers: {
                                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                                    'X-Parse-Session-Token': user.sessionToken,
                                    'Content-Type': 'application/json'
                                }
                            });
                            
                            if (response.ok) {
                                const userData = await response.json();
                                const displayName = userData.displayName || userData.username || user.username;
                                if (displayName) {
                                    nameInput.value = displayName;
                                }
                            }
                        } catch (error) {
                            console.log('Could not fetch user data:', error);
                        }
                    }
                }
            }
        }
        
        autoFillUserData();
        
        // ===== NAVBAR SCROLL EFFECT =====
        const navbar = document.querySelector('.navbar');
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 10) {
                navbar.style.boxShadow = '0 2px 8px var(--shadow)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        });
        
    });
    
})();