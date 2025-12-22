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
                                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap=