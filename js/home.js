// DevDen Home Page - home.js

(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        
        // ===== HAMBURGER MENU TOGGLE =====
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', function() {
                // Toggle active class on hamburger
                hamburger.classList.toggle('active');
                
                // Toggle active class on nav menu
                navMenu.classList.toggle('active');
                
                // Update aria-expanded for accessibility
                const isExpanded = navMenu.classList.contains('active');
                hamburger.setAttribute('aria-expanded', isExpanded);
                
                // Prevent body scroll when menu is open on mobile
                if (window.innerWidth <= 768) {
                    if (isExpanded) {
                        document.body.style.overflow = 'hidden';
                    } else {
                        document.body.style.overflow = '';
                    }
                }
            });
        }
        
        // ===== CLOSE MENU ON LINK CLICK (Mobile) =====
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
        
        // ===== CLOSE MENU ON WINDOW RESIZE =====
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                // If resized to desktop view, ensure menu is visible
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
        
        // ===== ACTIVE LINK HIGHLIGHT =====
        // Set active class based on current page
        const currentPage = window.location.pathname.split('/').pop() || 'home.html';
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                // Skip if it's just "#"
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Close mobile menu if open
                    if (window.innerWidth <= 768 && navMenu.classList.contains('active')) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                        hamburger.setAttribute('aria-expanded', 'false');
                        document.body.style.overflow = '';
                    }
                    
                    // Smooth scroll to element
                    const headerOffset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // ===== CHECK IF USER IS LOGGED IN =====
        // Redirect to login if not authenticated
        function checkAuthentication() {
            if (window.DevDen && window.DevDen.session) {
                if (!window.DevDen.session.isLoggedIn()) {
                    // User is not logged in, redirect to login page
                    window.location.href = '../index.html';
                }
            }
        }
        
        // Run authentication check
        checkAuthentication();
        
        // ===== NAVBAR SCROLL EFFECT (Optional) =====
        let lastScroll = 0;
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            // Add shadow on scroll
            if (currentScroll > 10) {
                navbar.style.boxShadow = '0 2px 8px var(--shadow)';
            } else {
                navbar.style.boxShadow = 'none';
            }
            
            lastScroll = currentScroll;
        });
        
        // ===== LOAD STATS FROM DATABASE =====
        async function loadStats() {
            try {
                // Back4App configuration (same as login)
                const BACK4APP_CONFIG = {
                    applicationId: '3DpA1rFa6NLxqibZA6at0aktNsqPzwBU2r50JyAf',
                    javascriptKey: 'sqrojNjFKJjbsgwu9C1VbnJiWYthwUsjP05IAcEm',
                    serverURL: 'https://parseapi.back4app.com'
                };

                // Get user session for authenticated requests
                const session = window.DevDen.session.getSession();
                const headers = {
                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                    'Content-Type': 'application/json'
                };

                if (session && session.sessionToken) {
                    headers['X-Parse-Session-Token'] = session.sessionToken;
                }

                // Fetch stats from different collections
                const [usersResponse, discussionsResponse, projectsResponse, eventsResponse] = await Promise.all([
                    // Count users
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/_User?count=1&limit=0`, { headers }),
                    // Count discussions (you'll need to create these classes in Back4App)
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/Discussion?count=1&limit=0`, { headers }),
                    // Count projects
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/Project?count=1&limit=0`, { headers }),
                    // Count events
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/Event?count=1&limit=0`, { headers })
                ]);

                // Parse responses
                const users = await usersResponse.json();
                const discussions = await discussionsResponse.json();
                const projects = await projectsResponse.json();
                const events = await eventsResponse.json();

                // Update stat numbers in the DOM
                const statNumbers = document.querySelectorAll('.stat-number');
                if (statNumbers.length >= 4) {
                    statNumbers[0].textContent = users.count || 0; // Developers
                    statNumbers[1].textContent = discussions.count || 0; // Discussions
                    statNumbers[2].textContent = projects.count || 0; // Projects
                    statNumbers[3].textContent = events.count || 0; // Events
                }

            } catch (error) {
                console.error('Error loading stats:', error);
                // Keep default values if API fails
            }
        }

        // ===== LOAD USER DATA (If needed) =====
        async function loadUserData() {
            if (window.DevDen && window.DevDen.session) {
                const user = window.DevDen.session.getSession();
                
                if (user) {
                    // Update hero title with personalized greeting
                    const heroTitle = document.getElementById('heroTitle');
                    if (heroTitle) {
                        let displayName = user.displayName || user.username || user.email;
                        
                        // If we don't have a good display name, try to fetch user profile
                        if (!user.displayName && user.sessionToken) {
                            try {
                                const BACK4APP_CONFIG = {
                                    applicationId: '3DpA1rFa6NLxqibZA6at0aktNsqPzwBU2r50JyAf',
                                    javascriptKey: 'sqrojNjFKJjbsgwu9C1VbnJiWYthwUsjP05IAcEm',
                                    serverURL: 'https://parseapi.back4app.com'
                                };

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
                                    displayName = userData.displayName || userData.username || user.email;
                                    
                                    // Update session with additional data
                                    const updatedUser = { ...user, displayName: userData.displayName };
                                    window.DevDen.session.setSession(updatedUser);
                                }
                            } catch (error) {
                                console.log('Could not fetch additional user data:', error);
                            }
                        }
                        
                        if (displayName) {
                            // Extract first name if it's an email
                            let firstName = displayName;
                            if (displayName.includes('@')) {
                                firstName = displayName.split('@')[0];
                            }
                            // If username starts with @, remove it
                            if (firstName.startsWith('@')) {
                                firstName = firstName.substring(1);
                            }
                            // Capitalize first letter and clean up
                            firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
                            
                            heroTitle.textContent = `Hi, ${firstName}!`;
                        }
                    }
                    
                    console.log('User logged in:', user.email || user.username);
                }
            }
        }
        
        loadUserData();
        
        // Load stats from database
        loadStats();
        
    });
    
})();