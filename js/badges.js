// DevDen Badges Page - badges.js

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
        
        // ===== FILTER FUNCTIONALITY =====
        const filterTabs = document.querySelectorAll('.filter-tab');
        const badgeCards = document.querySelectorAll('.badge-card');
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active tab
                filterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Filter badges
                filterBadges(filter);
            });
        });
        
        function filterBadges(filter) {
            badgeCards.forEach(card => {
                if (filter === 'all') {
                    card.classList.remove('hidden');
                    card.style.display = '';
                } else if (filter === 'earned') {
                    if (card.classList.contains('earned')) {
                        card.classList.remove('hidden');
                        card.style.display = '';
                    } else {
                        card.classList.add('hidden');
                        card.style.display = 'none';
                    }
                } else if (filter === 'locked') {
                    if (card.classList.contains('locked')) {
                        card.classList.remove('hidden');
                        card.style.display = '';
                    } else {
                        card.classList.add('hidden');
                        card.style.display = 'none';
                    }
                }
            });
            
            // Update stats after filtering
            updateStats();
        }
        
        // ===== UPDATE STATISTICS =====
        function updateStats() {
            const earnedBadges = document.querySelectorAll('.badge-card.earned').length;
            const totalBadges = badgeCards.length;
            const progressPercent = Math.round((earnedBadges / totalBadges) * 100);
            
            // Update DOM
            const earnedCountEl = document.getElementById('earnedCount');
            const totalCountEl = document.getElementById('totalCount');
            const progressPercentEl = document.getElementById('progressPercent');
            
            if (earnedCountEl) earnedCountEl.textContent = earnedBadges;
            if (totalCountEl) totalCountEl.textContent = totalBadges;
            if (progressPercentEl) progressPercentEl.textContent = progressPercent + '%';
        }
        
        // Initialize stats
        updateStats();
        
        // ===== BADGE CARD INTERACTIONS =====
        badgeCards.forEach(card => {
            card.addEventListener('click', function() {
                if (this.classList.contains('earned')) {
                    showBadgeDetails(this);
                } else {
                    showBadgeProgress(this);
                }
            });
        });
        
        function showBadgeDetails(card) {
            const title = card.querySelector('.badge-title').textContent;
            const description = card.querySelector('.badge-description').textContent;
            const date = card.querySelector('.badge-date')?.textContent || '';
            
            if (window.DevDen && window.DevDen.showToast) {
                window.DevDen.showToast(`${title}: ${description}`, 'success');
            }
        }
        
        function showBadgeProgress(card) {
            const title = card.querySelector('.badge-title').textContent;
            const progressText = card.querySelector('.progress-text')?.textContent;
            
            if (progressText && window.DevDen && window.DevDen.showToast) {
                window.DevDen.showToast(`${title}: ${progressText}`, 'info');
            }
        }
        
        // ===== ANIMATE STATS ON SCROLL =====
        const statBoxes = document.querySelectorAll('.stat-box');
        
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    animateStatBox(entry.target);
                    entry.target.dataset.animated = 'true';
                }
            });
        }, observerOptions);
        
        statBoxes.forEach(box => observer.observe(box));
        
        function animateStatBox(box) {
            const valueEl = box.querySelector('.stat-value');
            const targetValue = valueEl.textContent;
            
            // Check if it's a percentage
            const isPercentage = targetValue.includes('%');
            const numericValue = parseInt(targetValue);
            
            if (!isNaN(numericValue)) {
                let currentValue = 0;
                const increment = Math.ceil(numericValue / 30);
                const duration = 1000;
                const stepTime = duration / (numericValue / increment);
                
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= numericValue) {
                        valueEl.textContent = isPercentage ? numericValue + '%' : numericValue;
                        clearInterval(timer);
                    } else {
                        valueEl.textContent = isPercentage ? currentValue + '%' : currentValue;
                    }
                }, stepTime);
            }
        }
        
        // ===== LOAD USER BADGES DATA =====
        function loadUserBadges() {
            // In production, fetch from API
            // For now, badges are hardcoded in HTML
            
            const savedBadges = localStorage.getItem('devden_badges');
            if (savedBadges) {
                try {
                    const badgeData = JSON.parse(savedBadges);
                    console.log('User badges loaded:', badgeData);
                    // You can update the DOM based on saved badge data
                } catch (e) {
                    console.error('Error loading badge data:', e);
                }
            }
        }
        
        loadUserBadges();
        
        // ===== SAVE BADGE PROGRESS =====
        function saveBadgeProgress() {
            const badgeProgress = {
                earned: [],
                progress: {}
            };
            
            // Collect earned badges
            document.querySelectorAll('.badge-card.earned').forEach(card => {
                const title = card.querySelector('.badge-title').textContent;
                const date = card.querySelector('.badge-date')?.textContent;
                badgeProgress.earned.push({
                    title: title,
                    earnedDate: date
                });
            });
            
            // Collect progress for locked badges
            document.querySelectorAll('.badge-card.locked').forEach(card => {
                const title = card.querySelector('.badge-title').textContent;
                const progressText = card.querySelector('.progress-text')?.textContent;
                if (progressText) {
                    badgeProgress.progress[title] = progressText;
                }
            });
            
            localStorage.setItem('devden_badges', JSON.stringify(badgeProgress));
        }
        
        // Save badge progress periodically
        setInterval(saveBadgeProgress, 30000); // Save every 30 seconds
        
        // ===== BADGE UNLOCK SIMULATION =====
        // This would be triggered by actual user actions in production
        function unlockBadge(badgeTitle) {
            const cards = document.querySelectorAll('.badge-card.locked');
            
            cards.forEach(card => {
                const title = card.querySelector('.badge-title').textContent;
                if (title === badgeTitle) {
                    // Remove locked state
                    card.classList.remove('locked');
                    card.classList.add('earned');
                    
                    // Remove lock icon
                    const lockIcon = card.querySelector('.lock-icon');
                    if (lockIcon) lockIcon.remove();
                    
                    // Replace progress with date
                    const progressEl = card.querySelector('.badge-progress');
                    if (progressEl) {
                        const today = new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                        progressEl.outerHTML = `<div class="badge-date">Earned on ${today}</div>`;
                    }
                    
                    // Show notification
                    if (window.DevDen && window.DevDen.showToast) {
                        window.DevDen.showToast(`🎉 Badge Unlocked: ${badgeTitle}!`, 'success');
                    }
                    
                    // Update stats
                    updateStats();
                    
                    // Save progress
                    saveBadgeProgress();
                }
            });
        }
        
        // Example: Unlock a badge after 5 seconds (for demo purposes)
        // setTimeout(() => {
        //     unlockBadge('Active Member');
        // }, 5000);
        
        // ===== PROGRESS BAR ANIMATION =====
        const progressBars = document.querySelectorAll('.progress-fill');
        
        const progressObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    const width = entry.target.style.width;
                    entry.target.style.width = '0%';
                    
                    setTimeout(() => {
                        entry.target.style.width = width;
                    }, 100);
                    
                    entry.target.dataset.animated = 'true';
                }
            });
        }, observerOptions);
        
        progressBars.forEach(bar => progressObserver.observe(bar));
        
        // ===== CHECK AUTHENTICATION =====
        function checkAuthentication() {
            if (window.DevDen && window.DevDen.session) {
                if (!window.DevDen.session.isLoggedIn()) {
                    window.location.href = '../index.html';
                }
            }
        }
        
        checkAuthentication();
        
        // ===== EXPORT FUNCTIONS FOR GLOBAL ACCESS =====
        window.BadgeSystem = {
            unlockBadge: unlockBadge,
            updateStats: updateStats,
            filterBadges: filterBadges
        };
        
    });
    
})();