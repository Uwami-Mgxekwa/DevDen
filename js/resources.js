// DevDen Resources Page - resources.js

(function() {
    'use strict';

    // Back4App configuration
    const BACK4APP_CONFIG = {
        applicationId: '3DpA1rFa6NLxqibZA6at0aktNsqPzwBU2r50JyAf',
        javascriptKey: 'sqrojNjFKJjbsgwu9C1VbnJiWYthwUsjP05IAcEm',
        serverURL: 'https://parseapi.back4app.com'
    };

    let currentResources = [];
    let currentFilter = 'all';
    let currentSearchTerm = '';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        
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
            if (e.key === 'Escape') {
                if (navMenu.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
                
                // Also close modals
                closeAllModals();
            }
        });

        // ===== IN-APP NOTIFICATION SYSTEM =====
        function showNotification(message, type = 'info') {
            // Remove existing notifications
            const existingNotifications = document.querySelectorAll('.notification');
            existingNotifications.forEach(notif => notif.remove());
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            
            // Set icon based on type
            let icon = '';
            switch (type) {
                case 'success':
                    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    break;
                case 'error':
                    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    break;
                case 'warning':
                    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    break;
                default:
                    icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            }
            
            notification.innerHTML = `
                <div class="notification-icon">${icon}</div>
                <div class="notification-message">${message}</div>
                <button class="notification-close" onclick="this.parentElement.remove()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            `;
            
            // Add to page
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => notification.classList.add('show'), 10);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }

        // ===== FILTER FUNCTIONALITY =====
        const filterTabs = document.querySelectorAll('.filter-tab');
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active tab
                filterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Update current filter
                currentFilter = filter;
                
                // Filter resources
                filterAndDisplayResources();
            });
        });

        // ===== SEARCH FUNCTIONALITY =====
        const searchInput = document.getElementById('searchInput');
        
        searchInput.addEventListener('input', function() {
            currentSearchTerm = this.value.toLowerCase().trim();
            filterAndDisplayResources();
        });

        // ===== MODAL FUNCTIONALITY =====
        const addResourceBtn = document.getElementById('addResourceBtn');
        const emptyStateBtn = document.getElementById('emptyStateBtn');
        const addResourceModal = document.getElementById('addResourceModal');
        const resourceDetailModal = document.getElementById('resourceDetailModal');
        const closeAddResourceBtn = document.getElementById('closeAddResourceBtn');
        const closeDetailBtn = document.getElementById('closeDetailBtn');
        const cancelAddBtn = document.getElementById('cancelAddBtn');
        const addResourceForm = document.getElementById('addResourceForm');

        // Open add resource modal
        function openAddResourceModal() {
            addResourceModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.getElementById('resourceTitle').focus();
        }

        // Close add resource modal
        function closeAddResourceModal() {
            addResourceModal.classList.remove('active');
            document.body.style.overflow = '';
            addResourceForm.reset();
        }

        // Close resource detail modal
        function closeResourceDetailModal() {
            resourceDetailModal.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Close all modals
        function closeAllModals() {
            closeAddResourceModal();
            closeResourceDetailModal();
        }

        // Event listeners for modal controls
        addResourceBtn.addEventListener('click', openAddResourceModal);
        emptyStateBtn.addEventListener('click', openAddResourceModal);
        closeAddResourceBtn.addEventListener('click', closeAddResourceModal);
        closeDetailBtn.addEventListener('click', closeResourceDetailModal);
        cancelAddBtn.addEventListener('click', closeAddResourceModal);

        // Close modal on background click
        addResourceModal.addEventListener('click', function(e) {
            if (e.target === addResourceModal) {
                closeAddResourceModal();
            }
        });

        resourceDetailModal.addEventListener('click', function(e) {
            if (e.target === resourceDetailModal) {
                closeResourceDetailModal();
            }
        });

        // ===== ADD RESOURCE FORM SUBMISSION =====
        addResourceForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const session = window.DevDen.session.getSession();
            if (!session || !session.sessionToken) {
                showNotification('Session expired. Please log in again.', 'error');
                window.location.href = '../index.html';
                return;
            }

            // Get form data
            const title = document.getElementById('resourceTitle').value.trim();
            const type = document.getElementById('resourceType').value;
            const description = document.getElementById('resourceDescription').value.trim();
            const url = document.getElementById('resourceUrl').value.trim();
            const difficulty = document.getElementById('resourceDifficulty').value;
            const tagsInput = document.getElementById('resourceTags').value.trim();
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

            try {
                const response = await fetch(`${BACK4APP_CONFIG.serverURL}/classes/Resource`, {
                    method: 'POST',
                    headers: {
                        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                        'X-Parse-Session-Token': session.sessionToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        type,
                        description,
                        url,
                        difficulty,
                        tags,
                        userId: session.userId,
                        authorName: session.displayName || session.username || session.email,
                        views: 0,
                        likes: 0,
                        likedBy: []
                    })
                });

                if (response.ok) {
                    showNotification('Resource added successfully!', 'success');
                    closeAddResourceModal();
                    loadResources(); // Reload resources
                } else {
                    const error = await response.json();
                    showNotification('Failed to add resource: ' + (error.error || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Error adding resource:', error);
                showNotification('An error occurred while adding the resource. Please try again.', 'error');
            }
        });

        // ===== LOAD RESOURCES FROM DATABASE =====
        async function loadResources() {
            try {
                const loadingState = document.getElementById('loadingState');
                const resourcesGrid = document.getElementById('resourcesGrid');
                const emptyState = document.getElementById('emptyState');

                // Show loading state
                loadingState.style.display = 'flex';
                resourcesGrid.style.display = 'none';
                emptyState.style.display = 'none';

                const response = await fetch(`${BACK4APP_CONFIG.serverURL}/classes/Resource?order=-createdAt&limit=100`, {
                    headers: {
                        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    currentResources = data.results || [];
                    
                    // Update stats
                    updateResourceStats();
                    
                    // Display resources
                    filterAndDisplayResources();
                } else {
                    throw new Error('Failed to load resources');
                }
            } catch (error) {
                console.error('Error loading resources:', error);
                showNotification('Failed to load resources. Please refresh the page.', 'error');
                
                // Show empty state
                document.getElementById('loadingState').style.display = 'none';
                document.getElementById('emptyState').style.display = 'flex';
            }
        }

        // ===== UPDATE RESOURCE STATS =====
        function updateResourceStats() {
            const totalResources = currentResources.length;
            const tutorials = currentResources.filter(r => r.type === 'tutorial').length;
            const guides = currentResources.filter(r => r.type === 'guide').length;
            const scripts = currentResources.filter(r => r.type === 'script').length;

            document.getElementById('totalResources').textContent = totalResources;
            document.getElementById('totalTutorials').textContent = tutorials;
            document.getElementById('totalGuides').textContent = guides;
            document.getElementById('totalScripts').textContent = scripts;
        }

        // ===== FILTER AND DISPLAY RESOURCES =====
        function filterAndDisplayResources() {
            let filteredResources = currentResources;

            // Apply type filter
            if (currentFilter !== 'all') {
                filteredResources = filteredResources.filter(resource => resource.type === currentFilter);
            }

            // Apply search filter
            if (currentSearchTerm) {
                filteredResources = filteredResources.filter(resource => 
                    resource.title.toLowerCase().includes(currentSearchTerm) ||
                    resource.description.toLowerCase().includes(currentSearchTerm) ||
                    (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm)))
                );
            }

            displayResources(filteredResources);
        }

        // ===== DISPLAY RESOURCES =====
        function displayResources(resources) {
            const loadingState = document.getElementById('loadingState');
            const resourcesGrid = document.getElementById('resourcesGrid');
            const emptyState = document.getElementById('emptyState');

            loadingState.style.display = 'none';

            if (resources.length === 0) {
                resourcesGrid.style.display = 'none';
                emptyState.style.display = 'flex';
                return;
            }

            emptyState.style.display = 'none';
            resourcesGrid.style.display = 'grid';
            resourcesGrid.innerHTML = '';

            resources.forEach(resource => {
                const resourceCard = createResourceCard(resource);
                resourcesGrid.appendChild(resourceCard);
            });
        }

        // ===== CREATE RESOURCE CARD =====
        function createResourceCard(resource) {
            const card = document.createElement('div');
            card.className = 'resource-card';
            card.addEventListener('click', () => openResourceDetail(resource));

            const authorInitials = getInitials(resource.authorName || 'Unknown');
            const timeAgo = getTimeAgo(new Date(resource.createdAt));
            const tagsHTML = resource.tags ? resource.tags.slice(0, 3).map(tag => 
                `<span class="resource-tag">${tag}</span>`
            ).join('') : '';

            card.innerHTML = `
                <div class="resource-card-header">
                    <div class="resource-card-icon icon-${resource.type}">
                        ${getResourceIcon(resource.type)}
                    </div>
                    <div class="resource-card-badges">
                        <span class="resource-type-badge type-${resource.type}">${resource.type}</span>
                        <span class="resource-difficulty-badge difficulty-${resource.difficulty}">${resource.difficulty}</span>
                    </div>
                </div>
                <div class="resource-card-content">
                    <h3 class="resource-card-title">${resource.title}</h3>
                    <p class="resource-card-description">${resource.description}</p>
                    <div class="resource-card-tags">${tagsHTML}</div>
                </div>
                <div class="resource-card-footer">
                    <div class="resource-author">
                        <div class="resource-avatar">${authorInitials}</div>
                        <span class="resource-author-name">${resource.authorName || 'Unknown'}</span>
                    </div>
                    <div class="resource-stats">
                        <div class="resource-stat">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            ${resource.views || 0}
                        </div>
                        <div class="resource-stat">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            ${resource.likes || 0}
                        </div>
                    </div>
                </div>
            `;

            return card;
        }

        // ===== OPEN RESOURCE DETAIL =====
        async function openResourceDetail(resource) {
            // Increment view count
            await incrementResourceViews(resource.objectId);
            
            // Update resource object
            resource.views = (resource.views || 0) + 1;
            
            // Populate modal with resource data
            document.getElementById('detailResourceTitle').textContent = resource.title;
            document.getElementById('detailResourceType').textContent = resource.type;
            document.getElementById('detailResourceType').className = `resource-type-badge type-${resource.type}`;
            document.getElementById('detailResourceDifficulty').textContent = resource.difficulty;
            document.getElementById('detailResourceDifficulty').className = `resource-difficulty-badge difficulty-${resource.difficulty}`;
            
            const authorInitials = getInitials(resource.authorName || 'Unknown');
            document.getElementById('detailAuthorAvatar').textContent = authorInitials;
            document.getElementById('detailAuthorName').textContent = resource.authorName || 'Unknown';
            document.getElementById('detailResourceTime').textContent = getTimeAgo(new Date(resource.createdAt));
            document.getElementById('detailResourceDescription').textContent = resource.description;
            document.getElementById('detailViewCount').textContent = resource.views || 0;
            document.getElementById('detailLikeCount').textContent = resource.likes || 0;
            document.getElementById('visitResourceBtn').href = resource.url;
            
            // Update tags
            const tagsContainer = document.getElementById('detailResourceTags');
            tagsContainer.innerHTML = '';
            if (resource.tags && resource.tags.length > 0) {
                resource.tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'resource-tag';
                    tagElement.textContent = tag;
                    tagsContainer.appendChild(tagElement);
                });
            }
            
            // Setup like button
            const likeBtn = document.getElementById('likeResourceBtn');
            const session = window.DevDen.session.getSession();
            const isLiked = resource.likedBy && resource.likedBy.includes(session.userId);
            
            likeBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="currentColor" stroke-width="2"/>
                </svg>
                ${isLiked ? 'Unlike' : 'Like'}
            `;
            
            likeBtn.onclick = () => toggleResourceLike(resource);
            
            // Load comments
            loadResourceComments(resource.objectId);
            
            // Show modal
            resourceDetailModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // ===== INCREMENT RESOURCE VIEWS =====
        async function incrementResourceViews(resourceId) {
            try {
                await fetch(`${BACK4APP_CONFIG.serverURL}/classes/Resource/${resourceId}`, {
                    method: 'PUT',
                    headers: {
                        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        views: { __op: 'Increment', amount: 1 }
                    })
                });
            } catch (error) {
                console.error('Error incrementing views:', error);
            }
        }

        // ===== TOGGLE RESOURCE LIKE =====
        async function toggleResourceLike(resource) {
            const session = window.DevDen.session.getSession();
            if (!session || !session.sessionToken) {
                showNotification('Please log in to like resources.', 'warning');
                return;
            }

            try {
                const isLiked = resource.likedBy && resource.likedBy.includes(session.userId);
                const likedBy = resource.likedBy || [];
                
                let updateData;
                if (isLiked) {
                    // Unlike
                    updateData = {
                        likes: { __op: 'Increment', amount: -1 },
                        likedBy: { __op: 'Remove', objects: [session.userId] }
                    };
                    resource.likes = Math.max((resource.likes || 0) - 1, 0);
                    resource.likedBy = likedBy.filter(id => id !== session.userId);
                } else {
                    // Like
                    updateData = {
                        likes: { __op: 'Increment', amount: 1 },
                        likedBy: { __op: 'AddUnique', objects: [session.userId] }
                    };
                    resource.likes = (resource.likes || 0) + 1;
                    resource.likedBy = [...likedBy, session.userId];
                }

                const response = await fetch(`${BACK4APP_CONFIG.serverURL}/classes/Resource/${resource.objectId}`, {
                    method: 'PUT',
                    headers: {
                        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                        'X-Parse-Session-Token': session.sessionToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    // Update UI
                    document.getElementById('detailLikeCount').textContent = resource.likes;
                    const likeBtn = document.getElementById('likeResourceBtn');
                    const newIsLiked = !isLiked;
                    
                    likeBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="${newIsLiked ? 'currentColor' : 'none'}" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        ${newIsLiked ? 'Unlike' : 'Like'}
                    `;
                    
                    // Update the resource card in the grid
                    loadResources();
                } else {
                    throw new Error('Failed to update like status');
                }
            } catch (error) {
                console.error('Error toggling like:', error);
                showNotification('Failed to update like status. Please try again.', 'error');
            }
        }

        // ===== LOAD RESOURCE COMMENTS =====
        async function loadResourceComments(resourceId) {
            try {
                const response = await fetch(`${BACK4APP_CONFIG.serverURL}/classes/ResourceComment?where=${encodeURIComponent(JSON.stringify({resourceId: resourceId}))}&order=-createdAt`, {
                    headers: {
                        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const comments = data.results || [];
                    displayComments(comments);
                    document.getElementById('commentsCount').textContent = comments.length;
                } else {
                    throw new Error('Failed to load comments');
                }
            } catch (error) {
                console.error('Error loading comments:', error);
                document.getElementById('commentsList').innerHTML = '<p>Failed to load comments.</p>';
            }
        }

        // ===== DISPLAY COMMENTS =====
        function displayComments(comments) {
            const commentsList = document.getElementById('commentsList');
            const emptyCommentsState = document.getElementById('emptyCommentsState');

            if (comments.length === 0) {
                commentsList.style.display = 'none';
                emptyCommentsState.style.display = 'block';
                return;
            }

            emptyCommentsState.style.display = 'none';
            commentsList.style.display = 'block';
            commentsList.innerHTML = '';

            comments.forEach(comment => {
                const commentElement = createCommentElement(comment);
                commentsList.appendChild(commentElement);
            });
        }

        // ===== CREATE COMMENT ELEMENT =====
        function createCommentElement(comment) {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment-item';

            const authorInitials = getInitials(comment.authorName || 'Unknown');
            const timeAgo = getTimeAgo(new Date(comment.createdAt));

            commentDiv.innerHTML = `
                <div class="comment-header">
                    <div class="comment-avatar">${authorInitials}</div>
                    <div class="comment-author-info">
                        <div class="comment-author">${comment.authorName || 'Unknown'}</div>
                        <div class="comment-time">${timeAgo}</div>
                    </div>
                </div>
                <div class="comment-content">${comment.content}</div>
            `;

            return commentDiv;
        }

        // ===== NEW COMMENT FORM =====
        const newCommentForm = document.getElementById('newCommentForm');
        
        newCommentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const session = window.DevDen.session.getSession();
            if (!session || !session.sessionToken) {
                showNotification('Please log in to comment.', 'warning');
                return;
            }

            const content = document.getElementById('commentContent').value.trim();
            if (!content) return;

            // Get current resource ID from modal
            const resourceTitle = document.getElementById('detailResourceTitle').textContent;
            const currentResource = currentResources.find(r => r.title === resourceTitle);
            
            if (!currentResource) {
                showNotification('Error: Resource not found.', 'error');
                return;
            }

            try {
                const response = await fetch(`${BACK4APP_CONFIG.serverURL}/classes/ResourceComment`, {
                    method: 'POST',
                    headers: {
                        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                        'X-Parse-Session-Token': session.sessionToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        resourceId: currentResource.objectId,
                        userId: session.userId,
                        authorName: session.displayName || session.username || session.email,
                        content: content
                    })
                });

                if (response.ok) {
                    document.getElementById('commentContent').value = '';
                    loadResourceComments(currentResource.objectId);
                    showNotification('Comment added successfully!', 'success');
                } else {
                    throw new Error('Failed to add comment');
                }
            } catch (error) {
                console.error('Error adding comment:', error);
                showNotification('Failed to add comment. Please try again.', 'error');
            }
        });

        // ===== UTILITY FUNCTIONS =====
        function getResourceIcon(type) {
            const icons = {
                tutorial: '📚',
                guide: '📖',
                script: '💻',
                video: '🎥',
                article: '📄',
                documentation: '📋'
            };
            return icons[type] || '📄';
        }

        function getInitials(name) {
            if (!name) return 'U';
            const parts = name.split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return name.substring(0, 2).toUpperCase();
        }

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
        loadResources();
        
    });
    
})();