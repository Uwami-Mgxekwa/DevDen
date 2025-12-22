// DevDen Events Page - events.js

(function() {
    'use strict';

    // Back4App Configuration
    const BACK4APP_CONFIG = {
        applicationId: '3DpA1rFa6NLxqibZA6at0aktNsqPzwBU2r50JyAf',
        javascriptKey: 'sqrojNjFKJjbsgwu9C1VbnJiWYthwUsjP05IAcEm',
        serverURL: 'https://parseapi.back4app.com'
    };

    let allEvents = [];
    let currentUser = null;

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
        const typeFilter = document.getElementById('typeFilter');
        const locationFilter = document.getElementById('locationFilter');
        const dateFilter = document.getElementById('dateFilter');

        searchInput.addEventListener('input', debounce(filterEvents, 300));
        typeFilter.addEventListener('change', filterEvents);
        locationFilter.addEventListener('change', filterEvents);
        dateFilter.addEventListener('change', filterEvents);

        // ===== CREATE EVENT MODAL =====
        const createEventBtn = document.getElementById('createEventBtn');
        const createEventModal = document.getElementById('createEventModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelEventBtn = document.getElementById('cancelEventBtn');
        const createEventForm = document.getElementById('createEventForm');

        createEventBtn.addEventListener('click', openCreateEventModal);
        closeModalBtn.addEventListener('click', closeCreateEventModal);
        cancelEventBtn.addEventListener('click', closeCreateEventModal);
        createEventModal.querySelector('.modal-overlay').addEventListener('click', closeCreateEventModal);
        createEventForm.addEventListener('submit', handleCreateEvent);

        // ===== EVENT DETAIL MODAL =====
        const eventDetailModal = document.getElementById('eventDetailModal');
        const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
        
        closeDetailModalBtn.addEventListener('click', closeEventDetailModal);
        eventDetailModal.querySelector('.modal-overlay').addEventListener('click', closeEventDetailModal);

        // ===== LOAD EVENTS =====
        loadEvents();
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

    // ===== LOAD EVENTS FROM DATABASE =====
    async function loadEvents() {
        const eventsGrid = document.getElementById('eventsGrid');
        const emptyState = document.getElementById('emptyState');
        
        try {
            eventsGrid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading events...</p></div>';
            emptyState.style.display = 'none';

            const response = await fetch(`${BACK4APP_CONFIG.serverURL}/classes/Event?order=-eventDate&limit=100`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            allEvents = data.results || [];

            if (allEvents.length === 0) {
                eventsGrid.innerHTML = '';
                emptyState.style.display = 'flex';
            } else {
                displayEvents(allEvents);
            }

        } catch (error) {
            console.error('Error loading events:', error);
            eventsGrid.innerHTML = '';
            emptyState.style.display = 'flex';
            
            // Show some sample events if database is empty
            allEvents = getSampleEvents();
            displayEvents(allEvents);
        }
    }

    // ===== DISPLAY EVENTS =====
    function displayEvents(events) {
        const eventsGrid = document.getElementById('eventsGrid');
        const emptyState = document.getElementById('emptyState');

        if (events.length === 0) {
            eventsGrid.innerHTML = '';
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';
        eventsGrid.innerHTML = events.map(event => createEventCard(event)).join('');

        // Add click listeners to event cards
        const eventCards = eventsGrid.querySelectorAll('.event-card');
        eventCards.forEach((card, index) => {
            card.addEventListener('click', () => openEventDetail(events[index]));
        });
    }

    // ===== CREATE EVENT CARD HTML =====
    function createEventCard(event) {
        const eventDate = new Date(event.eventDate);
        const formattedDate = formatDate(eventDate);
        const formattedTime = event.eventTime || 'TBA';
        const attendeeCount = event.attendees || Math.floor(Math.random() * 50) + 5;

        return `
            <div class="event-card" data-event-id="${event.objectId || ''}">
                <div class="event-card-header">
                    <span class="event-type-badge badge-${event.eventType || 'meetup'}">${event.eventType || 'Meetup'}</span>
                    <h3 class="event-card-title">${escapeHtml(event.title)}</h3>
                </div>
                <div class="event-card-body">
                    <div class="event-info">
                        <div class="event-info-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${formattedDate} at ${formattedTime}</span>
                        </div>
                        <div class="event-info-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${formatLocation(event.location)}</span>
                        </div>
                        ${event.venue ? `
                        <div class="event-info-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${escapeHtml(event.venue)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="event-card-footer">
                    <div class="event-attendees">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>${attendeeCount} attending</span>
                    </div>
                    <span class="event-link-btn">View Details →</span>
                </div>
            </div>
        `;
    }

    // ===== FILTER EVENTS =====
    function filterEvents() {
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        const typeFilter = document.getElementById('typeFilter').value;
        const locationFilter = document.getElementById('locationFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        let filtered = allEvents.filter(event => {
            // Search filter
            const matchesSearch = !searchQuery || 
                event.title.toLowerCase().includes(searchQuery) ||
                (event.description && event.description.toLowerCase().includes(searchQuery)) ||
                (event.venue && event.venue.toLowerCase().includes(searchQuery));

            // Type filter
            const matchesType = typeFilter === 'all' || event.eventType === typeFilter;

            // Location filter
            const matchesLocation = locationFilter === 'all' || event.location === locationFilter;

            // Date filter
            let matchesDate = true;
            if (dateFilter !== 'all') {
                const eventDate = new Date(event.eventDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                switch (dateFilter) {
                    case 'today':
                        const todayEnd = new Date(today);
                        todayEnd.setHours(23, 59, 59, 999);
                        matchesDate = eventDate >= today && eventDate <= todayEnd;
                        break;
                    case 'this-week':
                        const weekEnd = new Date(today);
                        weekEnd.setDate(today.getDate() + 7);
                        matchesDate = eventDate >= today && eventDate <= weekEnd;
                        break;
                    case 'this-month':
                        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        matchesDate = eventDate >= today && eventDate <= monthEnd;
                        break;
                    case 'upcoming':
                        matchesDate = eventDate >= today;
                        break;
                }
            }

            return matchesSearch && matchesType && matchesLocation && matchesDate;
        });

        displayEvents(filtered);
    }

    // ===== MODAL FUNCTIONS =====
    function openCreateEventModal() {
        const modal = document.getElementById('createEventModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Set minimum date to today
        const dateInput = document.getElementById('eventDate');
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    function closeCreateEventModal() {
        const modal = document.getElementById('createEventModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        document.getElementById('createEventForm').reset();
    }

    function openEventDetail(event) {
        const modal = document.getElementById('eventDetailModal');
        const content = document.getElementById('eventDetailContent');
        
        const eventDate = new Date(event.eventDate);
        const formattedDate = formatDate(eventDate);
        const formattedTime = event.eventTime || 'TBA';
        const attendeeCount = event.attendees || Math.floor(Math.random() * 50) + 5;

        content.innerHTML = `
            <div class="event-detail-header">
                <span class="event-type-badge badge-${event.eventType || 'meetup'}">${event.eventType || 'Meetup'}</span>
                <h3 style="font-size: 1.5rem; margin-top: 0.5rem;">${escapeHtml(event.title)}</h3>
            </div>
            
            <div class="event-detail-meta">
                <div class="event-detail-meta-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${formattedDate} at ${formattedTime}</span>
                </div>
                <div class="event-detail-meta-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${formatLocation(event.location)}</span>
                </div>
                ${event.venue ? `
                <div class="event-detail-meta-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${escapeHtml(event.venue)}</span>
                </div>
                ` : ''}
                <div class="event-detail-meta-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${attendeeCount} attending</span>
                </div>
            </div>

            ${event.description ? `
            <div class="event-detail-description">
                <h3>About This Event</h3>
                <p>${escapeHtml(event.description)}</p>
            </div>
            ` : ''}

            <div class="event-detail-actions">
                ${event.registrationLink ? `
                    <a href="${escapeHtml(event.registrationLink)}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="flex: 1; text-align: center; text-decoration: none;">
                        Register Now
                    </a>
                ` : `
                    <button class="btn-primary" style="flex: 1;" onclick="alert('Registration coming soon!')">
                        Register Interest
                    </button>
                `}
                <button class="btn-secondary" style="flex: 1;" onclick="alert('Share feature coming soon!')">
                    Share Event
                </button>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeEventDetailModal() {
        const modal = document.getElementById('eventDetailModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function closeModals() {
        closeCreateEventModal();
        closeEventDetailModal();
    }

    // ===== HANDLE CREATE EVENT =====
    async function handleCreateEvent(e) {
        e.preventDefault();

        const formData = {
            title: document.getElementById('eventTitle').value,
            eventType: document.getElementById('eventType').value,
            location: document.getElementById('eventLocation').value,
            eventDate: new Date(document.getElementById('eventDate').value).toISOString(),
            eventTime: document.getElementById('eventTime').value,
            venue: document.getElementById('eventVenue').value,
            description: document.getElementById('eventDescription').value,
            registrationLink: document.getElementById('eventLink').value,
            createdBy: currentUser ? currentUser.objectId : 'anonymous',
            attendees: 0
        };

        try {
            const response = await fetch(`${BACK4APP_CONFIG.serverURL}/classes/Event`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create event');
            }

            const newEvent = await response.json();
            
            // Add the new event to our list
            allEvents.unshift({ ...formData, objectId: newEvent.objectId });
            
            closeCreateEventModal();
            displayEvents(allEvents);
            
            alert('Event created successfully!');

        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event. Please try again.');
        }
    }

    // ===== UTILITY FUNCTIONS =====
    function formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-ZA', options);
    }

    function formatLocation(location) {
        const locations = {
            'johannesburg': 'Johannesburg',
            'cape-town': 'Cape Town',
            'durban': 'Durban',
            'pretoria': 'Pretoria',
            'port-elizabeth': 'Port Elizabeth',
            'online': 'Online'
        };
        return locations[location] || location;
    }

    function escapeHtml(text) {
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

    // ===== SAMPLE EVENTS (Fallback) =====
    function getSampleEvents() {
        const today = new Date();
        return [
            {
                objectId: 'sample1',
                title: 'React Developer Meetup',
                eventType: 'meetup',
                location: 'johannesburg',
                eventDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                eventTime: '18:00',
                venue: 'WeWork Sandton',
                description: 'Join us for an evening of React discussions, networking, and pizza! We\'ll be covering React 19 features and best practices.',
                registrationLink: 'https://example.com',
                attendees: 45
            },
            {
                objectId: 'sample2',
                title: 'AI & Machine Learning Workshop',
                eventType: 'workshop',
                location: 'cape-town',
                eventDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                eventTime: '09:00',
                venue: 'UCT Innovation Hub',
                description: 'Hands-on workshop covering the fundamentals of machine learning with Python and TensorFlow.',
                registrationLink: 'https://example.com',
                attendees: 30
            },
            {
                objectId: 'sample3',
                title: 'DevOps Conference 2025',
                eventType: 'conference',
                location: 'johannesburg',
                eventDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                eventTime: '08:00',
                venue: 'Sandton Convention Centre',
                description: 'South Africa\'s premier DevOps conference featuring international speakers and local experts.',
                registrationLink: 'https://example.com',
                attendees: 250
            },
            {
                objectId: 'sample4',
                title: 'Hackathon: Build for Good',
                eventType: 'hackathon',
                location: 'durban',
                eventDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                eventTime: '10:00',
                venue: 'Durban ICC',
                description: '48-hour hackathon focused on creating solutions for social impact. Prizes worth R50,000!',
                registrationLink: 'https://example.com',
                attendees: 120
            },
            {
                objectId: 'sample5',
                title: 'Web Development Fundamentals',
                eventType: 'webinar',
                location: 'online',
                eventDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                eventTime: '19:00',
                venue: 'Zoom',
                description: 'Free online webinar covering HTML, CSS, and JavaScript basics for beginners.',
                registrationLink: 'https://example.com',
                attendees: 85
            },
            {
                objectId: 'sample6',
                title: 'Python User Group Monthly Meetup',
                eventType: 'meetup',
                location: 'pretoria',
                eventDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                eventTime: '18:30',
                venue: 'The Innovation Hub',
                description: 'Monthly gathering of Python enthusiasts. This month: async programming and FastAPI.',
                registrationLink: 'https://example.com',
                attendees: 35
            }
        ];
    }

})();