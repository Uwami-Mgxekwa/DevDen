// DevDen Forum Page - forum.js

(function() {
    'use strict';

    // Back4App configuration
    const BACK4APP_CONFIG = {
        applicationId: '3DpA1rFa6NLxqibZA6at0aktNsqPzwBU2r50JyAf',
        javascriptKey: 'sqrojNjFKJjbsgwu9C1VbnJiWYthwUsjP05IAcEm',
        serverURL: 'https://parseapi.back4app.com'
    };

    let currentFilter = 'all';
    let currentPage = 1;
    let postsPerPage = 10;
    let totalPosts = 0;
    let allPosts = [];
    let currentPost = null;
    let currentUser = null;

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
                
                const newPostModal = document.getElementById('newPostModal');
                const postDetailModal = document.getElementById('postDetailModal');
                
                if (newPostModal.classList.contains('active')) {
                    closeNewPostModal();
                }
                if (postDetailModal.classList.contains('active')) {
                    closePostDetailModal();
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
                currentUser = window.DevDen.session.getSession();
                return true;
            }
            return false;
        }
        
        if (!checkAuthentication()) return;
        
        // ===== FILTER TABS =====
        const filterTabs = document.querySelectorAll('.filter-tab');
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                filterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.getAttribute('data-filter');
                currentPage = 1;
                loadPosts();
            });
        });
        
        // ===== SEARCH INPUT =====
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1;
                loadPosts();
            }, 500);
        });
        
        // ===== NEW POST MODAL =====
        const newPostBtn = document.getElementById('newPostBtn');
        const emptyStateBtn = document.getElementById('emptyStateBtn');
        const newPostModal = document.getElementById('newPostModal');
        const closeNewPostBtn = document.getElementById('closeNewPostBtn');
        const cancelPostBtn = document.getElementById('cancelPostBtn');
        const newPostForm = document.getElementById('newPostForm');
        
        newPostBtn.addEventListener('click', openNewPostModal);
        if (emptyStateBtn) {
            emptyStateBtn.addEventListener('click', openNewPostModal);
        }
        closeNewPostBtn.addEventListener('click', closeNewPostModal);
        cancelPostBtn.addEventListener('click', closeNewPostModal);
        
        newPostModal.addEventListener('click', function(e) {
            if (e.target === newPostModal) {
                closeNewPostModal();
            }
        });
        
        function openNewPostModal() {
            newPostModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        function closeNewPostModal() {
            newPostModal.classList.remove('active');
            document.body.style.overflow = '';
            newPostForm.reset();
        }
        
        // ===== SUBMIT NEW POST =====
        newPostForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('postTitle').value.trim();
            const category = document.getElementById('postCategory').value;
            const content = document.getElementById('postContent').value.trim();
            const tagsInput = document.getElementById('postTags').value.trim();
            const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
            
            if (!title || !category || !content) {
                alert('Please fill in all required fields.');
                return;
            }
            
            try {
                const session = window.DevDen.session.getSession();
                const headers = {
                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                    'X-Parse-Session-Token': session.sessionToken,
                    'Content-Type': 'application/json'
                };
                
                const authorPointer = {
                    __type: 'Pointer',
                    className: '_User',
                    objectId: session.objectId
                };
                
                const postData = {
                    title,
                    category,
                    content,
                    tags,
                    author: authorPointer,
                    commentCount: 0,
                    viewCount: 0
                };
                
                const response = await fetch(`${BACK4APP_CONFIG.serverURL}/classes/Post`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(postData)
                });
                
                if (response.ok) {
                    closeNewPostModal();
                    currentPage = 1;
                    await loadPosts();
                    alert('Post created successfully!');
                } else {
                    const error = await response.json();
                    alert('Failed to create post: ' + (error.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error creating post:', error);
                alert('An error occurred. Please try again.');
            }
        });
        
        // ===== POST DETAIL MODAL =====
        const postDetailModal = document.getElementById('postDetailModal');
        const closeDetailBtn = document.getElementById('closeDetailBtn');
        const newCommentForm = document.getElementById('newCommentForm');
        
        closeDetailBtn.addEventListener('click', closePostDetailModal);
        
        postDetailModal.addEventListener('click', function(e) {
            if (e.target === postDetailModal) {
                closePostDetailModal();
            }
        });
        
        function closePostDetailModal() {
            postDetailModal.classList.remove('active');
            document.body.style.overflow = '';
            currentPost = null;
        }
        
        // ===== SUBMIT NEW COMMENT =====
        newCommentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const content = document.getElementById('commentContent').value.trim();
            
            if (!content || !currentPost) {
                return;
            }
            
            try {
                const session = window.DevDen.session.getSession();
                const headers = {
                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                    'X-Parse-Session-Token': session.sessionToken,
                    'Content-Type': 'application/json'
                };
                
                const authorPointer = {
                    __type: 'Pointer',
                    className: '_User',
                    objectId: session.objectId
                };
                
                const postPointer = {
                    __type: 'Pointer',
                    className: 'Post',
                    objectId: currentPost.objectId
                };
                
                const commentData = {
                    content,
                    author: authorPointer,
                    post: postPointer
                };
                
                const response = await fetch(`${BACK4APP_CONFIG.serverURL}/classes/Comment`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(commentData)
                });
                
                if (response.ok) {
                    document.getElementById('commentContent').value = '';
                    
                    // Update comment count
                    await fetch(`${BACK4APP_CONFIG.serverURL}/classes/Post/${currentPost.objectId}`, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify({
                            commentCount: (currentPost.commentCount || 0) + 1
                        })
                    });
                    
                    // Reload comments
                    await loadPostComments(currentPost.objectId);
                } else {
                    const error = await response.json();
                    alert('Failed to post comment: ' + (error.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error posting comment:', error);
                alert('An error occurred. Please try again.');
            }
        });
        
        // ===== LOAD POSTS =====
        async function loadPosts() {
            try {
                showLoading();
                
                const session = window.DevDen.session.getSession();
                const headers = {
                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                    'Content-Type': 'application/json'
                };
                
                if (session && session.sessionToken) {
                    headers['X-Parse-Session-Token'] = session.sessionToken;
                }
                
                // Build query
                let query = {};
                const searchQuery = searchInput.value.trim();
                
                if (searchQuery) {
                    query = {
                        $or: [
                            { title: { $regex: searchQuery, $options: 'i' } },
                            { content: { $regex: searchQuery, $options: 'i' } }
                        ]
                    };
                }
                
                // Apply filter
                let order = '-createdAt';
                if (currentFilter === 'recent') {
                    order = '-createdAt';
                } else if (currentFilter === 'popular') {
                    order = '-commentCount,-viewCount';
                } else if (currentFilter === 'unanswered') {
                    query.commentCount = 0;
                }
                
                const skip = (currentPage - 1) * postsPerPage;
                
                const response = await fetch(
                    `${BACK4APP_CONFIG.serverURL}/classes/Post?where=${encodeURIComponent(JSON.stringify(query))}&include=author&order=${order}&limit=${postsPerPage}&skip=${skip}&count=1`,
                    { headers }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    allPosts = data.results;
                    totalPosts = data.count;
                    
                    displayPosts(allPosts);
                    updatePagination();
                } else {
                    throw new Error('Failed to load posts');
                }
            } catch (error) {
                console.error('Error loading posts:', error);
                showError();
            }
        }
        
        // ===== DISPLAY POSTS =====
        function displayPosts(posts) {
            const postsList = document.getElementById('postsList');
            const loadingState = document.getElementById('loadingState');
            const emptyState = document.getElementById('emptyState');
            
            loadingState.style.display = 'none';
            
            if (posts.length === 0) {
                postsList.style.display = 'none';
                emptyState.style.display = 'flex';
                document.getElementById('pagination').style.display = 'none';
                return;
            }
            
            emptyState.style.display = 'none';
            postsList.style.display = 'flex';
            postsList.innerHTML = '';
            
            posts.forEach(post => {
                const postCard = createPostCard(post);
                postsList.appendChild(postCard);
            });
            
            document.getElementById('pagination').style.display = 'flex';
        }
        
        // ===== CREATE POST CARD =====
        function createPostCard(post) {
            const card = document.createElement('div');
            card.className = 'post-card';
            
            const author = post.author || {};
            const authorName = author.displayName || author.username || 'Anonymous';
            const authorInitials = getInitials(authorName);
            const timeAgo = getTimeAgo(new Date(post.createdAt));
            
            const tagsHTML = post.tags && post.tags.length > 0 
                ? `<div class="post-tags">${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}</div>`
                : '';
            
            const excerpt = post.content.length > 150 
                ? post.content.substring(0, 150) + '...'
                : post.content;
            
            card.innerHTML = `
                <div class="post-card-header">
                    <div>
                        <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
                    </div>
                    <span class="post-card-category category-${post.category}">${getCategoryLabel(post.category)}</span>
                </div>
                <p class="post-card-excerpt">${escapeHtml(excerpt)}</p>
                ${tagsHTML}
                <div class="post-card-footer">
                    <div class="post-author">
                        <div class="post-avatar">${authorInitials}</div>
                        <div class="post-author-info">
                            <span class="post-author-name">${escapeHtml(authorName)}</span>
                            <span class="post-time">${timeAgo}</span>
                        </div>
                    </div>
                    <div class="post-stats">
                        <span class="post-stat">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            ${post.commentCount || 0}
                        </span>
                        <span class="post-stat">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            ${post.viewCount || 0}
                        </span>
                    </div>
                </div>
            `;
            
            card.addEventListener('click', function() {
                openPostDetail(post);
            });
            
            return card;
        }
        
        // ===== OPEN POST DETAIL =====
        async function openPostDetail(post) {
            currentPost = post;
            
            // Increment view count
            try {
                const session = window.DevDen.session.getSession();
                const headers = {
                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                    'X-Parse-Session-Token': session.sessionToken,
                    'Content-Type': 'application/json'
                };
                
                await fetch(`${BACK4APP_CONFIG.serverURL}/classes/Post/${post.objectId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                        viewCount: (post.viewCount || 0) + 1
                    })
                });
                
                post.viewCount = (post.viewCount || 0) + 1;
            } catch (error) {
                console.error('Error updating view count:', error);
            }
            
            // Update modal content
            const author = post.author || {};
            const authorName = author.displayName || author.username || 'Anonymous';
            const authorInitials = getInitials(authorName);
            const timeAgo = getTimeAgo(new Date(post.createdAt));
            
            document.getElementById('detailPostTitle').textContent = post.title;
            document.getElementById('detailAuthorAvatar').textContent = authorInitials;
            document.getElementById('detailAuthorName').textContent = authorName;
            document.getElementById('detailPostTime').textContent = timeAgo;
            document.getElementById('detailPostContent').textContent = post.content;
            document.getElementById('detailCommentCount').textContent = post.commentCount || 0;
            document.getElementById('detailViewCount').textContent = post.viewCount || 0;
            
            const categoryBadge = document.getElementById('detailPostCategory');
            categoryBadge.textContent = getCategoryLabel(post.category);
            categoryBadge.className = `post-category-badge category-${post.category}`;
            
            const tagsContainer = document.getElementById('detailPostTags');
            tagsContainer.innerHTML = '';
            if (post.tags && post.tags.length > 0) {
                post.tags.forEach(tag => {
                    const tagSpan = document.createElement('span');
                    tagSpan.className = 'post-tag';
                    tagSpan.textContent = tag;
                    tagsContainer.appendChild(tagSpan);
                });
            }
            
            // Load comments
            await loadPostComments(post.objectId);
            
            postDetailModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // ===== LOAD POST COMMENTS =====
        async function loadPostComments(postId) {
            try {
                const session = window.DevDen.session.getSession();
                const headers = {
                    'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
                    'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
                    'Content-Type': 'application/json'
                };
                
                if (session && session.sessionToken) {
                    headers['X-Parse-Session-Token'] = session.sessionToken;
                }
                
                const postPointer = {
                    __type: 'Pointer',
                    className: 'Post',
                    objectId: postId
                };
                
                const response = await fetch(
                    `${BACK4APP_CONFIG.serverURL}/classes/Comment?where=${encodeURIComponent(JSON.stringify({ post: postPointer }))}&include=author&order=createdAt`,
                    { headers }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    displayComments(data.results);
                }
            } catch (error) {
                console.error('Error loading comments:', error);
            }
        }
        
        // ===== DISPLAY COMMENTS =====
        function displayComments(comments) {
            const commentsList = document.getElementById('commentsList');
            const emptyCommentsState = document.getElementById('emptyCommentsState');
            const commentsCount = document.getElementById('commentsCount');
            
            commentsCount.textContent = comments.length;
            
            if (comments.length === 0) {
                commentsList.innerHTML = '';
                emptyCommentsState.style.display = 'block';
                return;
            }
            
            emptyCommentsState.style.display = 'none';
            commentsList.innerHTML = '';
            
            comments.forEach(comment => {
                const commentItem = createCommentItem(comment);
                commentsList.appendChild(commentItem);
            });
        }
        
        // ===== CREATE COMMENT ITEM =====
        function createCommentItem(comment) {
            const item = document.createElement('div');
            item.className = 'comment-item';
            
            const author = comment.author || {};
            const authorName = author.displayName || author.username || 'Anonymous';
            const authorInitials = getInitials(authorName);
            const timeAgo = getTimeAgo(new Date(comment.createdAt));
            
            item.innerHTML = `
                <div class="comment-header">
                    <div class="comment-avatar">${authorInitials}</div>
                    <div class="comment-author-info">
                        <div class="comment-author">${escapeHtml(authorName)}</div>
                        <div class="comment-time">${timeAgo}</div>
                    </div>
                </div>
                <div class="comment-content">${escapeHtml(comment.content)}</div>
            `;
            
            return item;
        }
        
        // ===== LOAD FORUM STATS =====
        async function loadForumStats() {
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
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const [postsResponse, usersResponse, activePostsResponse] = await Promise.all([
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/Post?count=1&limit=0`, { headers }),
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/_User?count=1&limit=0`, { headers }),
                    fetch(`${BACK4APP_CONFIG.serverURL}/classes/Post?where=${encodeURIComponent(JSON.stringify({ createdAt: { $gte: { __type: 'Date', iso: today.toISOString() } } }))}&count=1&limit=0`, { headers })
                ]);
                
                const posts = await postsResponse.json();
                const users = await usersResponse.json();
                const activePosts = await activePostsResponse.json();
                
                document.getElementById('totalPosts').textContent = posts.count || 0;
                document.getElementById('totalMembers').textContent = users.count || 0;
                document.getElementById('activePosts').textContent = activePosts.count || 0;
                
            } catch (error) {
                console.error('Error loading forum stats:', error);
            }
        }
        
        // ===== PAGINATION =====
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                loadPosts();
            }
        });
        
        nextBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(totalPosts / postsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                loadPosts();
            }
        });
        
        function updatePagination() {
            const totalPages = Math.ceil(totalPosts / postsPerPage);
            
            document.getElementById('paginationInfo').textContent = `Page ${currentPage} of ${totalPages}`;
            
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        }
        
        // ===== HELPER FUNCTIONS =====
        function showLoading() {
            document.getElementById('loadingState').style.display = 'flex';
            document.getElementById('postsList').style.display = 'none';
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('pagination').style.display = 'none';
        }
        
        function showError() {
            document.getElementById('loadingState').innerHTML = '<p>Failed to load posts. Please refresh the page.</p>';
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
            if (interval > 1) return Math.floor(interval) + 'y ago';
            
            interval = seconds / 2592000;
            if (interval > 1) return Math.floor(interval) + 'mo ago';
            
            interval = seconds / 86400;
            if (interval > 1) return Math.floor(interval) + 'd ago';
            
            interval = seconds / 3600;
            if (interval > 1) return Math.floor(interval) + 'h ago';
            
            interval = seconds / 60;
            if (interval > 1) return Math.floor(interval) + 'm ago';
            
            return 'Just now';
        }
        
        function getCategoryLabel(category) {
            const labels = {
                'general': 'General',
                'question': 'Question',
                'help': 'Help',
                'showcase': 'Showcase',
                'career': 'Career',
                'news': 'News'
            };
            return labels[category] || category;
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // ===== INITIALIZE =====
        loadForumStats();
        loadPosts();
        
    });
    
})();