// DevDen Profile Page - profile.js

(function() {
    'use strict';

    // Back4App configuration
    const BACK4APP_CONFIG = {
        applicationId: '3DpA1rFa6NLxqibZA6at0aktNsqPzwBU2r50JyAf',
        javascriptKey: 'sqrojNjFKJjbsgwu9C1VbnJiWYthwUsjP05IAcEm',
        serverURL: 'https://parseapi.back4app.com'
    };

    let currentUser = null;

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
            if (e.key === 'Escape') {
                if (navMenu.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
                
                // Also close modal if open
                const modal = document.getElementById('editProfileModal');
                if (modal.classList.contains('active')) {
                    closeEditModal();
                }
            }
        });
        
        // ===== CHECK AUTHENTICATION =====
        function checkAuthentication() {
            if (window.DevDen && window.DevDen.session) {
                if (!window.DevDen.session.isLoggedIn()) {
                    window.location.href = '../index.html';
                    return false;
                }
                return true;
            }
            return false;
        }
        
        if (!checkAuthentication()) return;
        
        // ===== TAB SWITCHING =====
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                this.classList.add('active');
                const targetContent = document.getElementById(tabName + 'Tab');
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
        
        // ===== EDIT PROFILE MODAL =====
        const editProfileBtn = document.getElementById('editProfileBtn');
        const editProfileModal = document.getElementById('editProfileModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const editProfileForm = document.getElementById('editProfileForm');
        
        editProfileBtn.addEventListener('click', openEditModal);
        closeModalBtn.addEventListener('click', closeEditModal);
        cancelEditBtn.addEventListener('click', closeEditModal);
        
        // Close modal on background click
        editProfileModal.addEventListener('click', function(e) {
            if (e.target === editProfileModal) {
                closeEditModal();
            }
        });
        
        function openEditModal() {
            if (currentUser) {
                // Populate form with current user data
                document.getElementById('editDisplayName').value = currentUser.displayName || '';
                document.getElementById('editBio').value = currentUser.bio || '';
                document.getElementById('editLocation').value = currentUser.location || '';
                document.getElementById('editWebsite').value = currentUser.website || '';
                document.getElementById('editGithub').value = currentUser.github || '';
                document.getElementById('editLinkedin').value = currentUser.linkedin || '';
                document.getElementById('editSkills').value = currentUser.skills ? currentUser.skills.join(', ') : '';
                
                editProfileModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        
        function closeEditModal() {
            editProfileModal.classList.remove('active');
            document.body.style.overflow = '';
            editProfileForm.reset();
        }
        
        // ===== HANDLE PROFILE UPDATE =====
        editProfileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const session = window.DevDen.session.getSession();
            if (!session || !session.sessionToken) {
                showNotification('Session expired. Please log in again.', 'error');
                window.location.href = '../index.html';
                return;
            }
            
            // Get form data
            const displayName = document.getElementById('editDisplayName').value.trim();
            const bio = document.getElementById('editBio').value.trim();
            const location = document.getElementById('editLocation').value.trim();
            const website = document.getElementById('editWebsite').value.trim();
            const github = document.getElementById('editGithub').value.trim();
            const linkedin = document.getElementById('editLinkedin').value.trim();
            const skillsInput = document.getElementById('editSkills').value.trim();
            const skills = skillsInput ? skillsInput.split(',').map(s => s.trim()).filter(s => s) : [];
            
            // Use correct user ID
            const userId = session.userId || session.objectId;
            
            // Update user profile
            try {
                const response = await fetch(`${BACK4APP_CONFIG.serverURL}/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                        'X-Parse-Session-Token': session.sessionToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        displayName,
                        bio,
                        location,
                        website,
                        github,
                        linkedin,
                        skills
                    })
                });
                
                if (response.ok) {
                    const updatedUser = await response.json();
                    
                    // Update session
                    const updatedSession = { ...session, displayName: updatedUser.displayName };
                    window.DevDen.session.setSession(updatedSession);
                    
                    // Reload profile data
                    await loadUserProfile();
                    
                    closeEditModal();
                    
                    // Show success notification
                    showNotification('Profile updated successfully!', 'success');
                } else {
                    const error = await response.json();
                    showNotification('Failed to update profile: ' + (error.error || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                showNotification('An error occurred while updating your profile. Please try again.', 'error');
            }
        });
        
        // ===== LOAD USER PROFILE =====
        async function loadUserProfile() {
            const session = window.DevDen.session.getSession();
            
            if (!session) {
                window.location.href = '../index.html';
                return;
            }
            
            try {
                // Use userId from session (stored during login)
                const userId = session.userId || session.objectId;
                
                if (!userId) {
                    throw new Error('No user ID found in session');
                }
                
                // Fetch user data from Back4App
                const response = await fetch(`${BACK4APP_CONFIG.serverURL}/users/${userId}`, {
                    headers: {
                        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                        'X-Parse-Session-Token': session.sessionToken,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    currentUser = await response.json();
                    
                    // Update UI with user data
                    updateProfileUI(currentUser);
                    
                    // Load user stats
                    await loadUserStats(currentUser.objectId);
                    
                    // Hide loading, show content
                    document.getElementById('loadingState').style.display = 'none';
                    document.getElementById('profileContent').style.display = 'block';
                } else {
                    throw new Error('Failed to load user profile');
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                document.getElementById('loadingState').innerHTML = '<p>Failed to load profile. Please refresh the page.</p>';
            }
        }
        
        // ===== UPDATE PROFILE UI =====
        function updateProfileUI(user) {
            // Avatar initials
            const avatarInitials = document.getElementById('avatarInitials');
            const displayName = user.displayName || user.username || user.email;
            const initials = getInitials(displayName);
            avatarInitials.textContent = initials;
            
            // Profile name
            document.getElementById('profileName').textContent = displayName;
            
            // Username
            const username = user.username || user.email.split('@')[0];
            document.getElementById('profileUsername').textContent = '@' + username;
            
            // Bio
            const bioElement = document.getElementById('profileBio');
            bioElement.textContent = user.bio || 'No bio yet';
            bioElement.style.fontStyle = user.bio ? 'normal' : 'italic';
            
            // Location
            document.getElementById('profileLocation').textContent = user.location || 'South Africa';
            
            // Joined date
            const joinedDate = new Date(user.createdAt);
            const monthYear = joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            document.getElementById('profileJoined').textContent = `Joined ${monthYear}`;
            
            // Verified badge (if user is verified)
            if (user.emailVerified) {
                document.getElementById('profileVerified').style.display = 'inline-flex';
            }
            
            // Skills
            const skillsList = document.getElementById('skillsList');
            skillsList.innerHTML = '';
            if (user.skills && user.skills.length > 0) {
                user.skills.forEach(skill => {
                    const skillTag = document.createElement('span');
                    skillTag.className = 'skill-tag';
                    skillTag.textContent = skill;
                    skillsList.appendChild(skillTag);
                });
            } else {
                skillsList.innerHTML = '<span class="skill-tag">No skills added yet</span>';
            }
            
            // Website
            const websiteLink = document.getElementById('profileWebsite');
            if (user.website) {
                websiteLink.href = user.website;
                websiteLink.textContent = user.website;
                websiteLink.style.pointerEvents = 'auto';
            } else {
                websiteLink.textContent = 'Not specified';
                websiteLink.style.pointerEvents = 'none';
            }
            
            // GitHub
            const githubLink = document.getElementById('profileGithub');
            if (user.github) {
                githubLink.href = `https://github.com/${user.github}`;
                githubLink.textContent = `github.com/${user.github}`;
                githubLink.style.pointerEvents = 'auto';
            } else {
                githubLink.textContent = 'Not specified';
                githubLink.style.pointerEvents = 'none';
            }
            
            // LinkedIn
            const linkedinLink = document.getElementById('profileLinkedin');
            if (user.linkedin) {
                linkedinLink.href = user.linkedin;
                linkedinLink.textContent = user.linkedin;
                linkedinLink.style.pointerEvents = 'auto';
            } else {
                linkedinLink.textContent = 'Not specified';
                linkedinLink.style.pointerEvents = 'none';
            }
        }
        
        // ===== GET INITIALS FROM NAME =====
        function getInitials(name) {
            if (!name) return 'U';
            
            const parts = name.split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return name.substring(0, 2).toUpperCase();
        }
        
        // ===== LOAD USER STATS =====
        async function loadUserStats(userId) {
            try {
                const headers = {
                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                    'Content-Type': 'application/json'
                };
                
                const session = window.DevDen.session.getSession();
                if (session && session.sessionToken) {
                    headers['X-Parse-Session-Token'] = session.sessionToken;
                }
                
                // Create a pointer to the user for queries
                const userPointer = {
                    __type: 'Pointer',
                    className: '_User',
                    objectId: userId
                };
                
                // Fetch counts for different entities
                const [postsResponse, commentsResponse, projectsResponse, badgesResponse] = await Promise.all([
                    // Count posts by user
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/Post?where=${encodeURIComponent(JSON.stringify({ author: userPointer }))}&count=1&limit=0`, { headers }),
                    // Count comments by user
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/Comment?where=${encodeURIComponent(JSON.stringify({ author: userPointer }))}&count=1&limit=0`, { headers }),
                    // Count projects by user
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/Project?where=${encodeURIComponent(JSON.stringify({ author: userPointer }))}&count=1&limit=0`, { headers }),
                    // Count badges earned by user (you'll need to implement badge system)
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/UserBadge?where=${encodeURIComponent(JSON.stringify({ user: userPointer }))}&count=1&limit=0`, { headers })
                ]);
                
                const posts = await postsResponse.json();
                const comments = await commentsResponse.json();
                const projects = await projectsResponse.json();
                const badges = await badgesResponse.json();
                
                // Update stats in UI
                document.getElementById('statPosts').textContent = posts.count || 0;
                document.getElementById('statComments').textContent = comments.count || 0;
                document.getElementById('statProjects').textContent = projects.count || 0;
                document.getElementById('statBadges').textContent = badges.count || 0;
                
            } catch (error) {
                console.error('Error loading stats:', error);
                // Keep default values if API fails
            }
        }
        
        // ===== LOAD USER BADGES =====
        async function loadUserBadges(userId) {
            try {
                const headers = {
                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                    'Content-Type': 'application/json'
                };
                
                const session = window.DevDen.session.getSession();
                if (session && session.sessionToken) {
                    headers['X-Parse-Session-Token'] = session.sessionToken;
                }
                
                // Query using userId field (not user pointer)
                const response = await fetch(
                    `${BACK4APP_CONFIG.serverURL}/classes/UserBadge?where=${encodeURIComponent(JSON.stringify({ userId: userId }))}&include=badgeDefinition`,
                    { headers }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const badgesGrid = document.getElementById('badgesGrid');
                    
                    if (data.results && data.results.length > 0) {
                        badgesGrid.innerHTML = '';
                        
                        data.results.forEach(userBadge => {
                            // Get badge definition or use fallback
                            const badgeName = userBadge.badgeName || 'Unknown Badge';
                            const badgeCard = createBadgeCard({
                                name: badgeName,
                                description: `Earned on ${new Date(userBadge.createdAt).toLocaleDateString()}`,
                                icon: getBadgeIcon(badgeName)
                            });
                            badgesGrid.appendChild(badgeCard);
                        });
                    } else {
                        // Show "no badges" message
                        badgesGrid.innerHTML = '<div class="no-badges"><p>No badges earned yet. Start participating to earn your first badge!</p></div>';
                    }
                } else {
                    console.error('Failed to load badges:', response.status);
                    const badgesGrid = document.getElementById('badgesGrid');
                    badgesGrid.innerHTML = '<div class="no-badges"><p>Unable to load badges at this time.</p></div>';
                }
            } catch (error) {
                console.error('Error loading badges:', error);
                const badgesGrid = document.getElementById('badgesGrid');
                badgesGrid.innerHTML = '<div class="no-badges"><p>Error loading badges.</p></div>';
            }
        }

        // ===== GET BADGE ICON =====
        function getBadgeIcon(badgeName) {
            const icons = {
                'Welcome Aboard': '🎉',
                'First Post': '📝',
                'Contributor': '💬',
                'Helper': '🤝',
                'Event Attendee': '📅',
                'Project Launcher': '🚀',
                'Code Reviewer': '👨‍💻',
                'Early Adopter': '⭐',
                'Active Member': '🔥',
                'Mentor': '🎓',
                'Prolific Writer': '✍️',
                'Resource Creator': '📚',
                'Event Organizer': '🎪'
            };
            return icons[badgeName] || '🏆';
        }
        
        // ===== CREATE BADGE CARD =====
        function createBadgeCard(badge) {
            const card = document.createElement('div');
            card.className = 'badge-card';
            
            card.innerHTML = `
                <div class="badge-icon">${badge.icon || '🏆'}</div>
                <h3 class="badge-name">${badge.name}</h3>
                <p class="badge-description">${badge.description}</p>
            `;
            
            return card;
        }
        
        // ===== LOAD USER ACTIVITY =====
        async function loadUserActivity(userId) {
            try {
                const headers = {
                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                    'Content-Type': 'application/json'
                };
                
                const session = window.DevDen.session.getSession();
                if (session && session.sessionToken) {
                    headers['X-Parse-Session-Token'] = session.sessionToken;
                }
                
                const userPointer = {
                    __type: 'Pointer',
                    className: '_User',
                    objectId: userId
                };
                
                // Fetch recent posts
                const response = await fetch(
                    `${BACK4APP_CONFIG.serverURL}/classes/Post?where=${encodeURIComponent(JSON.stringify({ author: userPointer }))}&order=-createdAt&limit=10`,
                    { headers }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const activityFeed = document.getElementById('activityFeed');
                    
                    if (data.results && data.results.length > 0) {
                        activityFeed.innerHTML = '';
                        
                        data.results.forEach(post => {
                            const activityItem = createActivityItem(post);
                            activityFeed.appendChild(activityItem);
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading activity:', error);
            }
        }
        
        // ===== CREATE ACTIVITY ITEM =====
        function createActivityItem(post) {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            const timeAgo = getTimeAgo(new Date(post.createdAt));
            
            item.innerHTML = `
                <div class="activity-header">
                    <div class="activity-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="activity-info">
                        <h3 class="activity-title">Posted in Forum</h3>
                        <span class="activity-time">${timeAgo}</span>
                    </div>
                </div>
                <div class="activity-content">${post.title}</div>
            `;
            
            return item;
        }
        
        // ===== LOAD USER PROJECTS =====
        async function loadUserProjects(userId) {
            try {
                const headers = {
                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                    'Content-Type': 'application/json'
                };
                
                const session = window.DevDen.session.getSession();
                if (session && session.sessionToken) {
                    headers['X-Parse-Session-Token'] = session.sessionToken;
                }
                
                const userPointer = {
                    __type: 'Pointer',
                    className: '_User',
                    objectId: userId
                };
                
                const response = await fetch(
                    `${BACK4APP_CONFIG.serverURL}/classes/Project?where=${encodeURIComponent(JSON.stringify({ author: userPointer }))}&order=-createdAt`,
                    { headers }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const projectsGrid = document.getElementById('projectsGrid');
                    
                    if (data.results && data.results.length > 0) {
                        projectsGrid.innerHTML = '';
                        
                        data.results.forEach(project => {
                            const projectCard = createProjectCard(project);
                            projectsGrid.appendChild(projectCard);
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading projects:', error);
            }
        }
        
        // ===== CREATE PROJECT CARD =====
        function createProjectCard(project) {
            const card = document.createElement('div');
            card.className = 'project-card';
            
            const tagsHTML = project.tags ? project.tags.map(tag => 
                `<span class="project-tag">${tag}</span>`
            ).join('') : '';
            
            card.innerHTML = `
                <div class="project-header">
                    <h3 class="project-title">${project.title}</h3>
                </div>
                <p class="project-description">${project.description || 'No description'}</p>
                <div class="project-tags">${tagsHTML}</div>
            `;
            
            return card;
        }
        
        // ===== HELPER: GET TIME AGO =====
        function getTimeAgo(date) {
            const seconds = Math.floor((new Date() - date) / 1000);
            
            let interval = seconds / 31536000;
            if (interval > 1) return Math.floor(interval) + ' years ago';
            
            interval = seconds / 2592000;
            if (interval > 1) return Math.floor(interval) + ' months ago';
            
            interval = seconds / 86400;
            if (interval > 1) return Math.floor(interval) + ' days ago';
            
            interval = seconds / 3600;
            if (interval > 1) return Math.floor(interval) + ' hours ago';
            
            interval = seconds / 60;
            if (interval > 1) return Math.floor(interval) + ' minutes ago';
            
            return 'Just now';
        }
        
        // ===== INITIALIZE =====
        loadUserProfile();
        
        // Load additional data when tabs are clicked
        document.querySelector('[data-tab="badges"]').addEventListener('click', function() {
            if (currentUser) {
                loadUserBadges(currentUser.objectId);
            }
        });
        
        document.querySelector('[data-tab="activity"]').addEventListener('click', function() {
            if (currentUser) {
                loadUserActivity(currentUser.objectId);
            }
        });
        
        document.querySelector('[data-tab="projects"]').addEventListener('click', function() {
            if (currentUser) {
                loadUserProjects(currentUser.objectId);
            }
        });
        
    });
    
})();