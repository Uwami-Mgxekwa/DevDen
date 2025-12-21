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
            const badgeCards = document.querySelectorAll('.badge-card');
            
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
        
        // ===== UPDATE STATISTICS =====
        function updateStats() {
            const earnedBadges = document.querySelectorAll('.badge-card.earned').length;
            const totalBadges = document.querySelectorAll('.badge-card').length;
            const progressPercent = totalBadges > 0 ? Math.round((earnedBadges / totalBadges) * 100) : 0;
            
            // Update DOM
            const earnedCountEl = document.getElementById('earnedCount');
            const totalCountEl = document.getElementById('totalCount');
            const progressPercentEl = document.getElementById('progressPercent');
            
            if (earnedCountEl) earnedCountEl.textContent = earnedBadges;
            if (totalCountEl) totalCountEl.textContent = totalBadges;
            if (progressPercentEl) progressPercentEl.textContent = progressPercent + '%';
        }
        
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
        async function loadUserBadges() {
            try {
                // Back4App configuration
                const BACK4APP_CONFIG = {
                    applicationId: '3DpA1rFa6NLxqibZA6at0aktNsqPzwBU2r50JyAf',
                    javascriptKey: 'sqrojNjFKJjbsgwu9C1VbnJiWYthwUsjP05IAcEm',
                    serverURL: 'https://parseapi.back4app.com'
                };

                // Get user session
                const session = window.DevDen.session.getSession();
                if (!session || !session.sessionToken) {
                    console.log('No user session found');
                    return;
                }

                const headers = {
                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                    'X-Parse-Session-Token': session.sessionToken,
                    'Content-Type': 'application/json'
                };

                // Fetch user's badge data and progress
                const [badgeDefinitionsResponse, userBadgesResponse, userStatsResponse] = await Promise.all([
                    // Get all available badge definitions
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/BadgeDefinition`, { headers }),
                    // Get user's earned badges
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/UserBadge?where=${encodeURIComponent(JSON.stringify({userId: session.userId}))}`, { headers }),
                    // Get user statistics for progress calculation
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/UserStats?where=${encodeURIComponent(JSON.stringify({userId: session.userId}))}`, { headers })
                ]);

                const badgeDefinitions = await badgeDefinitionsResponse.json();
                const userBadges = await userBadgesResponse.json();
                const userStats = await userStatsResponse.json();

                // Process and render badges
                renderBadges(badgeDefinitions.results || [], userBadges.results || [], userStats.results?.[0] || {});

            } catch (error) {
                console.error('Error loading badges:', error);
                // Keep existing hardcoded badges if API fails
                updateStats();
            }
        }
        
        loadUserBadges();

        // ===== RENDER BADGES FROM API DATA =====
        function renderBadges(badgeDefinitions, userBadges, userStats) {
            const badgesGrid = document.getElementById('badgesGrid');
            if (!badgesGrid) return;

            // Create a map of earned badges for quick lookup (using badge name for fallback)
            const earnedBadgesMap = new Map();
            userBadges.forEach(badge => {
                // Try to match by badgeId first, then by badge name
                earnedBadgesMap.set(badge.badgeId, badge);
                if (badge.badgeName) {
                    earnedBadgesMap.set(badge.badgeName, badge);
                }
            });

            // Clear existing badges
            badgesGrid.innerHTML = '';

            // If no badge definitions from API, create default badge set
            if (badgeDefinitions.length === 0) {
                badgeDefinitions = getDefaultBadgeDefinitions();
            }

            // Render each badge
            badgeDefinitions.forEach(badgeDef => {
                // Check if badge is earned by ID or name
                const isEarnedById = earnedBadgesMap.has(badgeDef.objectId);
                const isEarnedByName = earnedBadgesMap.has(badgeDef.name);
                const isEarned = isEarnedById || isEarnedByName;
                
                const earnedBadge = earnedBadgesMap.get(badgeDef.objectId) || earnedBadgesMap.get(badgeDef.name);
                
                const badgeCard = createBadgeCard(badgeDef, isEarned, earnedBadge, userStats);
                badgesGrid.appendChild(badgeCard);
            });

            // Update statistics
            updateStats();
        }

        // ===== GET DEFAULT BADGE DEFINITIONS =====
        function getDefaultBadgeDefinitions() {
            return [
                {
                    objectId: 'welcome-badge',
                    name: 'Welcome Aboard',
                    description: 'Created your DevDen account',
                    category: 'welcome',
                    type: 'account_creation',
                    requirements: {}
                },
                {
                    objectId: 'first-post-badge',
                    name: 'First Post',
                    description: 'Made your first forum post',
                    category: 'forum',
                    type: 'posts',
                    requirements: { posts: 1 }
                },
                {
                    objectId: 'contributor-badge',
                    name: 'Contributor',
                    description: 'Posted 10 forum replies',
                    category: 'contribution',
                    type: 'replies',
                    requirements: { replies: 10 }
                },
                {
                    objectId: 'helper-badge',
                    name: 'Helper',
                    description: 'Received 5 upvotes on your answers',
                    category: 'helper',
                    type: 'upvotes',
                    requirements: { upvotes: 5 }
                },
                {
                    objectId: 'event-attendee-badge',
                    name: 'Event Attendee',
                    description: 'Attended your first DevDen event',
                    category: 'events',
                    type: 'events',
                    requirements: { events: 1 }
                },
                {
                    objectId: 'project-launcher-badge',
                    name: 'Project Launcher',
                    description: 'Shared your first project',
                    category: 'projects',
                    type: 'projects',
                    requirements: { projects: 1 }
                },
                {
                    objectId: 'code-reviewer-badge',
                    name: 'Code Reviewer',
                    description: 'Reviewed 5 community projects',
                    category: 'code',
                    type: 'reviews',
                    requirements: { reviews: 5 }
                },
                {
                    objectId: 'early-adopter-badge',
                    name: 'Early Adopter',
                    description: 'Joined DevDen in the first month',
                    category: 'star',
                    type: 'early_adopter',
                    requirements: {}
                },
                {
                    objectId: 'active-member-badge',
                    name: 'Active Member',
                    description: 'Be active for 30 consecutive days',
                    category: 'contribution',
                    type: 'days_active',
                    requirements: { days: 30 }
                },
                {
                    objectId: 'mentor-badge',
                    name: 'Mentor',
                    description: 'Receive 50 upvotes on your answers',
                    category: 'helper',
                    type: 'upvotes',
                    requirements: { upvotes: 50 }
                },
                {
                    objectId: 'prolific-writer-badge',
                    name: 'Prolific Writer',
                    description: 'Create 50 forum posts',
                    category: 'forum',
                    type: 'posts',
                    requirements: { posts: 50 }
                },
                {
                    objectId: 'resource-creator-badge',
                    name: 'Resource Creator',
                    description: 'Upload 10 learning resources',
                    category: 'contribution',
                    type: 'resources',
                    requirements: { resources: 10 }
                },
                {
                    objectId: 'event-organizer-badge',
                    name: 'Event Organizer',
                    description: 'Host 3 community events',
                    category: 'events',
                    type: 'events_hosted',
                    requirements: { events_hosted: 3 }
                }
            ];
        }

        // ===== CREATE BADGE CARD ELEMENT =====
        function createBadgeCard(badgeDef, isEarned, earnedBadge, userStats) {
            const card = document.createElement('div');
            card.className = `badge-card ${isEarned ? 'earned' : 'locked'}`;
            card.setAttribute('data-category', isEarned ? 'earned' : 'locked');

            const iconColor = isEarned ? 'var(--emerald)' : 'var(--text-secondary)';
            const iconOpacity = isEarned ? '0.2' : '0.1';

            let progressHTML = '';
            let lockIconHTML = '';

            if (!isEarned) {
                // Calculate progress based on badge requirements
                const progress = calculateBadgeProgress(badgeDef, userStats);
                
                lockIconHTML = `
                    <div class="lock-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 10V6a5 5 0 0110 0v4m-12 0h14a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1v-7a1 1 0 011-1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                `;

                progressHTML = `
                    <div class="badge-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                        </div>
                        <span class="progress-text">${progress.current}/${progress.required} ${progress.unit}</span>
                    </div>
                `;
            } else {
                const earnedDate = new Date(earnedBadge.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                progressHTML = `<div class="badge-date">Earned on ${earnedDate}</div>`;
            }

            card.innerHTML = `
                <div class="badge-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="24" cy="24" r="20" fill="${iconColor}" opacity="${iconOpacity}"/>
                        ${badgeDef.iconPath || getDefaultIconPath(badgeDef.category)}
                    </svg>
                </div>
                ${lockIconHTML}
                <h3 class="badge-title">${badgeDef.name}</h3>
                <p class="badge-description">${badgeDef.description}</p>
                ${progressHTML}
            `;

            // Add click event
            card.addEventListener('click', function() {
                if (isEarned) {
                    showBadgeDetails(this);
                } else {
                    showBadgeProgress(this);
                }
            });

            return card;
        }

        // ===== CALCULATE BADGE PROGRESS =====
        function calculateBadgeProgress(badgeDef, userStats) {
            const requirements = badgeDef.requirements || {};
            let current = 0;
            let required = 1;
            let unit = 'actions';

            switch (badgeDef.type) {
                case 'account_creation':
                    // Welcome badge - should be earned immediately on signup
                    current = 1;
                    required = 1;
                    unit = 'account';
                    break;
                case 'posts':
                    current = userStats.totalPosts || 0;
                    required = requirements.posts || 1;
                    unit = 'posts';
                    break;
                case 'replies':
                    current = userStats.totalReplies || 0;
                    required = requirements.replies || 1;
                    unit = 'replies';
                    break;
                case 'upvotes':
                    current = userStats.totalUpvotes || 0;
                    required = requirements.upvotes || 1;
                    unit = 'upvotes';
                    break;
                case 'projects':
                    current = userStats.totalProjects || 0;
                    required = requirements.projects || 1;
                    unit = 'projects';
                    break;
                case 'events':
                    current = userStats.eventsAttended || 0;
                    required = requirements.events || 1;
                    unit = 'events';
                    break;
                case 'days_active':
                    current = userStats.consecutiveDays || 0;
                    required = requirements.days || 1;
                    unit = 'days';
                    break;
                case 'resources':
                    current = userStats.resourcesShared || 0;
                    required = requirements.resources || 1;
                    unit = 'resources';
                    break;
                case 'reviews':
                    current = userStats.projectReviews || 0;
                    required = requirements.reviews || 1;
                    unit = 'reviews';
                    break;
                case 'events_hosted':
                    current = userStats.eventsHosted || 0;
                    required = requirements.events_hosted || 1;
                    unit = 'events hosted';
                    break;
                case 'early_adopter':
                    // Check if user joined in first month (this would be set manually)
                    current = userStats.isEarlyAdopter ? 1 : 0;
                    required = 1;
                    unit = 'qualification';
                    break;
                default:
                    current = 0;
                    required = 1;
                    unit = 'actions';
            }

            const percentage = Math.min(Math.round((current / required) * 100), 100);

            return {
                current: Math.min(current, required),
                required,
                percentage,
                unit
            };
        }

        // ===== GET DEFAULT ICON PATH =====
        function getDefaultIconPath(category) {
            const iconPaths = {
                'welcome': '<path d="M24 14v10m0 4h.01M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
                'forum': '<path d="M8 12h32M8 24h32M8 36h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
                'contribution': '<path d="M12 20l10 10 16-16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
                'helper': '<path d="M24 28c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0 0v12m-8-4h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
                'events': '<path d="M32 12h4v32H12V12h4m0-4h16v8H16V8zm8 16h8m-8 8h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
                'projects': '<path d="M24 8v8m0 8v16m8-24l-8 8-8-8m16 16l-8 8-8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
                'code': '<path d="M16 18l-6 6 6 6m16-12l6 6-6 6M28 12l-8 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
                'star': '<path d="M24 8l4.95 10.05L40 20l-8 7.8 1.9 11.2L24 33l-9.9 6 1.9-11.2L8 20l11.05-1.95L24 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
                'default': '<path d="M24 8c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16S32.837 8 24 8zm0 22v-8m0-4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
            };
            
            return iconPaths[category] || iconPaths['default'];
        }
        
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