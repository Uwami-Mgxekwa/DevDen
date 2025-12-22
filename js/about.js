// DevDen About Page - about.js

(function() {
    'use strict';

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
        
        // ===== FAQ ACCORDION =====
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', function() {
                // Check if this item is already active
                const isActive = item.classList.contains('active');
                
                // Close all items
                faqItems.forEach(faqItem => {
                    faqItem.classList.remove('active');
                });
                
                // If this item wasn't active, open it
                if (!isActive) {
                    item.classList.add('active');
                }
            });
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
        
        // ===== NAVBAR SCROLL EFFECT =====
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 10) {
                navbar.style.boxShadow = '0 2px 8px var(--shadow)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        });
        
        // ===== SCROLL REVEAL ANIMATION =====
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        };
        
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        // Observe sections
        const sections = document.querySelectorAll('.mission-section, .features-section, .partnership-section, .values-section, .faq-section, .cta-section');
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
        
        // ===== FEATURE BOXES STAGGERED ANIMATION =====
        const featureBoxes = document.querySelectorAll('.feature-box');
        featureBoxes.forEach((box, index) => {
            box.style.opacity = '0';
            box.style.transform = 'translateY(20px)';
            box.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(box);
        });
        
        // ===== VALUE CARDS STAGGERED ANIMATION =====
        const valueCards = document.querySelectorAll('.value-card');
        valueCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(card);
        });
        
        // ===== TRACK PAGE VIEW (Optional Analytics) =====
        function trackPageView() {
            if (window.DevDen && window.DevDen.session) {
                const user = window.DevDen.session.getSession();
                
                if (user) {
                    console.log('About page viewed by:', user.email || user.username);
                    
                    // You could send analytics here
                    // Example: Send to Back4App or analytics service
                    // trackEvent('page_view', { page: 'about', userId: user.objectId });
                }
            }
        }
        
        trackPageView();
        
        // ===== BRELINX LINK TRACKING =====
        const brelinxLinks = document.querySelectorAll('a[href*="brelinx.com"]');
        brelinxLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Track that user clicked on Brelinx link
                console.log('Brelinx link clicked from About page');
                
                // Optional: Send tracking event
                // trackEvent('external_link_click', { destination: 'brelinx', source: 'about_page' });
            });
        });
        
        // ===== KEYBOARD NAVIGATION FOR FAQ =====
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach((question, index) => {
            question.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextQuestion = faqQuestions[index + 1];
                    if (nextQuestion) nextQuestion.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevQuestion = faqQuestions[index - 1];
                    if (prevQuestion) prevQuestion.focus();
                }
            });
        });
        
        // ===== COPY TO CLIPBOARD FOR EMAIL (Optional Enhancement) =====
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        emailLinks.forEach(link => {
            link.addEventListener('contextmenu', function(e) {
                // Optional: Add copy to clipboard functionality on right-click
                // This is just a console log for now
                console.log('Email link right-clicked:', this.href);
            });
        });
        
    });
    
})();