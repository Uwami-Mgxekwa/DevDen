// DevDen Projects Page - projects.js

(function() {
    'use strict';

    // Back4App Configuration
    const BACK4APP_CONFIG = {
        applicationId: '3DpA1rFa6NLxqibZA6at0aktNsqPzwBU2r50JyAf',
        javascriptKey: 'sqrojNjFKJjbsgwu9C1VbnJiWYthwUsjP05IAcEm',
        serverURL: 'https://parseapi.back4app.com'
    };

    let allProjects = [];
    let currentUser = null;
    let currentView = 'grid'; // 'grid' or 'list'
    let likedProjects = new Set(); // Store liked project IDs

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        
        // ===== AUTHENTICATION CHECK =====
        checkAuthentication();

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
        
        // ===== CLOSE MENU ON RESIZE =====
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
                closeModals();
            }
        });

        // ===== SEARCH AND FILTER FUNCTIONALITY =====
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const techFilter = document.getElementById('techFilter');
        const sortFilter = document.getElementById('sortFilter');

        searchInput.addEventListener('input', debounce(filterProjects, 300));
        categoryFilter.addEventListener('change', filterProjects);
        techFilter.addEventListener('change', filterProjects);
        sortFilter.addEventListener('change', filterProjects);

        // ===== VIEW TOGGLE =====
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');

        gridViewBtn.addEventListener('click', () => setView('grid'));
        listViewBtn.addEventListener('click', () => setView('list'));

        // ===== ADD PROJECT MODAL =====
        const addProjectBtn = document.getElementById('addProjectBtn');
        const addProjectModal = document.getElementById('addProjectModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelProjectBtn = document.getElementById('cancelProjectBtn');
        const addProjectForm = document.getElementById('addProjectForm');

        addProjectBtn.addEventListener('click', openAddProjectModal);
        closeModalBtn.addEventListener('click', closeAddProjectModal);
        cancelProjectBtn.addEventListener('click', closeAddProjectModal);
        addProjectModal.querySelector('.modal-overlay').addEventListener('click', closeAddProjectModal);
        addProjectForm.addEventListener('submit', handleAddProject);

        // ===== PROJECT DETAIL MODAL =====
        const projectDetailModal = document.getElementById('projectDetailModal');
        const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
        
        closeDetailModalBtn.addEventListener('click', closeProjectDetailModal);
        projectDetailModal.querySelector('.modal-overlay').addEventListener('click', closeProjectDetailModal);

        // ===== LOAD PROJECTS =====
        loadProjects();
    });

    // ===== AUTHENTICATION FUNCTIONS =====
    function checkAuthentication() {
        if (window.DevDen && window.DevDen.session) {
            if (!window.DevDen.session.isLoggedIn()) {
                window.location.href = '../index.html';
                return;
            }
            currentUser = window.DevDen.session.getSession();
        }
    }

    function getAuthHeaders() {
        const headers = {
            'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
            'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
            'Content-Type': 'application/json'
        };

        if (currentUser && currentUser.sessionToken) {
            headers['X-Parse-Session-Token'] = currentUser.sessionToken;
        }

        return headers;
    }

    // ===== LOAD PROJECTS FROM DATABASE =====
    async function loadProjects() {
        const projectsContainer = document.getElementById('projectsContainer');
        const emptyState = document.getElementById('emptyState');
        
        try {
            projectsContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading projects...</p></div>';
            emptyState.style.display = 'none';

            const response = await fetch(`${BACK4APP_CONFIG.serverURL}/classes/Project?order=-createdAt&limit=100`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }

            const data = await response.json();
            allProjects = data.results || [];

            if (allProjects.length === 0) {
                projectsContainer.innerHTML = '';
                emptyState.style.display = 'flex';
                updateResultsCount(0);
            } else {
                displayProjects(allProjects);
            }

        } catch (error) {
            console.error('Error loading projects:', error);
            projectsContainer.innerHTML = '';
            
            // Show some sample projects if database is empty
            allProjects = getSampleProjects();
            displayProjects(allProjects);
        }
    }

    // ===== DISPLAY PROJECTS =====
    function displayProjects(projects) {
        const projectsContainer = document.getElementById('projectsContainer');
        const emptyState = document.getElementById('emptyState');

        if (projects.length === 0) {
            projectsContainer.innerHTML = '';
            emptyState.style.display = 'flex';
            updateResultsCount(0);
            return;
        }

        emptyState.style.display = 'none';
        projectsContainer.innerHTML = projects.map(project => createProjectCard(project)).join('');
        updateResultsCount(projects.length);

        // Add click listeners to project cards
        const projectCards = projectsContainer.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            card.addEventListener('click', (e) => {
                // Don't open detail if clicking on a link or button
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
                    return;
                }
                openProjectDetail(projects[index]);
            });
        });
    }

    // ===== CREATE PROJECT CARD HTML =====
    function createProjectCard(project) {
        const likes = project.likes || Math.floor(Math.random() * 100) + 5;
        const views = project.views || Math.floor(Math.random() * 500) + 50;
        const technologies = Array.isArray(project.technologies) 
            ? project.technologies 
            : (project.technologies ? project.technologies.split(',').map(t => t.trim()) : []);

        return `
            <div class="project-card" data-project-id="${project.objectId || ''}">
                <div class="project-image">
                    ${project.imageUrl ? 
                        `<img src="${escapeHtml(project.imageUrl)}" alt="${escapeHtml(project.title)}" onerror="this.parentElement.innerHTML='<div class=\\'project-image-placeholder\\'><svg width=\\'64\\' height=\\'64\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\'><path d=\\'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'/></svg></div>'">` :
                        `<div class="project-image-placeholder">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>`
                    }
                </div>
                <div class="project-card-content">
                    <div class="project-card-header">
                        <span class="project-category-badge badge-${project.category || 'other'}">${formatCategory(project.category)}</span>
                        <h3 class="project-card-title">${escapeHtml(project.title)}</h3>
                    </div>
                    <p class="project-card-description">${escapeHtml(project.description)}</p>
                    <div class="project-technologies">
                        ${technologies.slice(0, 4).map(tech => 
                            `<span class="tech-tag">${escapeHtml(tech)}</span>`
                        ).join('')}
                        ${technologies.length > 4 ? `<span class="tech-tag">+${technologies.length - 4}</span>` : ''}
                    </div>
                    <div class="project-card-footer">
                        <div class="project-author">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${escapeHtml(project.authorName || 'Developer')}</span>
                        </div>
                        <div class="project-stats">
                            <div class="project-stat">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>${likes}</span>
                            </div>
                            <div class="project-stat">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>${views}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== FILTER PROJECTS =====
    function filterProjects() {
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const techFilter = document.getElementById('techFilter').value;
        const sortFilter = document.getElementById('sortFilter').value;

        let filtered = allProjects.filter(project => {
            // Search filter
            const matchesSearch = !searchQuery || 
                project.title.toLowerCase().includes(searchQuery) ||
                (project.description && project.description.toLowerCase().includes(searchQuery)) ||
                (project.technologies && project.technologies.toLowerCase().includes(searchQuery));

            // Category filter
            const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;

            // Technology filter
            const matchesTech = techFilter === 'all' || 
                (project.technologies && project.technologies.toLowerCase().includes(techFilter.toLowerCase()));

            return matchesSearch && matchesCategory && matchesTech;
        });

        // Sort projects
        filtered.sort((a, b) => {
            switch (sortFilter) {
                case 'recent':
                    return new Date(b.createdAt || b.created) - new Date(a.createdAt || a.created);
                case 'oldest':
                    return new Date(a.createdAt || a.created) - new Date(b.createdAt || b.created);
                case 'likes':
                    return (b.likes || 0) - (a.likes || 0);
                case 'views':
                    return (b.views || 0) - (a.views || 0);
                default:
                    return 0;
            }
        });

        displayProjects(filtered);
    }

    // ===== VIEW TOGGLE =====
    function setView(view) {
        currentView = view;
        const projectsContainer = document.getElementById('projectsContainer');
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');

        if (view === 'grid') {
            projectsContainer.className = 'projects-grid';
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        } else {
            projectsContainer.className = 'projects-list';
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
        }
    }

    // ===== UPDATE RESULTS COUNT =====
    function updateResultsCount(count) {
        const resultsCount = document.getElementById('resultsCount');
        resultsCount.textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
    }

    // ===== MODAL FUNCTIONS =====
    function openAddProjectModal() {
        const modal = document.getElementById('addProjectModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeAddProjectModal() {
        const modal = document.getElementById('addProjectModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        document.getElementById('addProjectForm').reset();
    }

    function openProjectDetail(project) {
        const modal = document.getElementById('projectDetailModal');
        const content = document.getElementById('projectDetailContent');
        
        const likes = project.likes || Math.floor(Math.random() * 100) + 5;
        const views = project.views || Math.floor(Math.random() * 500) + 50;
        const technologies = Array.isArray(project.technologies) 
            ? project.technologies 
            : (project.technologies ? project.technologies.split(',').map(t => t.trim()) : []);
        
        const isLiked = likedProjects.has(project.objectId);

        content.innerHTML = `
            ${project.imageUrl ? 
                `<img src="${escapeHtml(project.imageUrl)}" alt="${escapeHtml(project.title)}" class="project-detail-image" onerror="this.style.display='none'">` :
                `<div class="project-detail-image">
                    <div class="project-image-placeholder" style="height: 100%;">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>`
            }
            
            <div class="project-detail-header">
                <span class="project-category-badge badge-${project.category || 'other'}">${formatCategory(project.category)}</span>
                <h3 style="font-size: 1.75rem; margin-top: 0.5rem; font-weight: 600;">${escapeHtml(project.title)}</h3>
            </div>
            
            <div class="project-detail-meta">
                <div class="project-detail-meta-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${escapeHtml(project.authorName || 'Developer')}</span>
                </div>
                <div class="project-detail-meta-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${likes} likes</span>
                </div>
                <div class="project-detail-meta-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${views} views</span>
                </div>
                ${project.status ? `
                <div class="project-detail-meta-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>${formatStatus(project.status)}</span>
                </div>
                ` : ''}
            </div>

            <div class="project-detail-section">
                <h3>About This Project</h3>
                <p>${escapeHtml(project.description)}</p>
            </div>

            ${technologies.length > 0 ? `
            <div class="project-detail-section">
                <h3>Technologies Used</h3>
                <div class="project-technologies">
                    ${technologies.map(tech => 
                        `<span class="tech-tag">${escapeHtml(tech)}</span>`
                    ).join('')}
                </div>
            </div>
            ` : ''}

            <div class="project-detail-actions">
                ${project.githubUrl ? `
                    <a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn-link btn-github">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        View on GitHub
                    </a>
                ` : ''}
                ${project.demoUrl ? `
                    <a href="${escapeHtml(project.demoUrl)}" target="_blank" rel="noopener noreferrer" class="btn-link btn-demo">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Live Demo
                    </a>
                ` : ''}
                <button class="btn-link btn-like ${isLiked ? 'liked' : ''}" onclick="window.projectsPage.toggleLike('${project.objectId}')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    ${isLiked ? 'Liked' : 'Like'}
                </button>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeProjectDetailModal() {
        const modal = document.getElementById('projectDetailModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function closeModals() {
        closeAddProjectModal();
        closeProjectDetailModal();
    }

    // ===== HANDLE ADD PROJECT =====
    async function handleAddProject(e) {
        e.preventDefault();

        const technologies = document.getElementById('projectTechnologies').value
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        const formData = {
            title: document.getElementById('projectTitle').value,
            description: document.getElementById('projectDescription').value,
            category: document.getElementById('projectCategory').value,
            status: document.getElementById('projectStatus').value,
            technologies: technologies,
            githubUrl: document.getElementById('projectGithub').value,
            demoUrl: document.getElementById('projectDemo').value,
            imageUrl: document.getElementById('projectImage').value,
            authorId: currentUser ? currentUser.objectId : 'anonymous',
            authorName: currentUser ? (currentUser.displayName || currentUser.username || currentUser.email) : 'Anonymous',
            likes: 0,
            views: 0
        };

        try {
            const response = await fetch(`${BACK4APP_CONFIG.serverURL}/classes/Project`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create project');
            }

            const newProject = await response.json();
            
            // Add the new project to our list
            allProjects.unshift({ ...formData, objectId: newProject.objectId, createdAt: new Date().toISOString() });
            
            closeAddProjectModal();
            displayProjects(allProjects);
            
            alert('Project added successfully!');

        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to add project. Please try again.');
        }
    }

    // ===== TOGGLE LIKE =====
    function toggleLike(projectId) {
        if (likedProjects.has(projectId)) {
            likedProjects.delete(projectId);
        } else {
            likedProjects.add(projectId);
        }
        
        // Find and update the project
        const project = allProjects.find(p => p.objectId === projectId);
        if (project) {
            openProjectDetail(project);
        }
    }

    // Expose toggleLike to global scope for onclick handler
    window.projectsPage = { toggleLike };

    // ===== UTILITY FUNCTIONS =====
    function formatCategory(category) {
        const categories = {
            'web': 'Web Development',
            'mobile': 'Mobile Apps',
            'ai-ml': 'AI & ML',
            'game': 'Game Dev',
            'data': 'Data Science',
            'iot': 'IoT',
            'blockchain': 'Blockchain',
            'other': 'Other'
        };
        return categories[category] || 'Other';
    }

    function formatStatus(status) {
        const statuses = {
            'in-progress': 'In Progress',
            'completed': 'Completed',
            'maintenance': 'Maintenance'
        };
        return statuses[status] || status;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function debounce(func, wait) {
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

    // ===== SAMPLE PROJECTS (Fallback) =====
    function getSampleProjects() {
        return [
            {
                objectId: 'sample1',
                title: 'TaskMaster Pro',
                description: 'A comprehensive task management application built with React and Firebase. Features include real-time collaboration, drag-and-drop task organization, and advanced filtering options.',
                category: 'web',
                status: 'completed',
                technologies: ['React', 'Firebase', 'Tailwind CSS', 'Redux'],
                githubUrl: 'https://github.com',
                demoUrl: 'https://example.com',
                imageUrl: '',
                authorName: 'John Developer',
                likes: 45,
                views: 320,
                created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                objectId: 'sample2',
                title: 'Weather Forecast App',