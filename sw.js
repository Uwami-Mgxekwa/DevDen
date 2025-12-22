// DevDen Service Worker - PWA Functionality
// Version 1.0.0

const CACHE_NAME = 'devden-v1.0.2';
const OFFLINE_URL = 'pages/offline.html';

// Files to cache for offline functionality
const CACHE_URLS = [
    // Root files
    '/index.html',
    
    // Pages
    '/pages/home.html',
    '/pages/projects.html',
    '/pages/profile.html',
    '/pages/forum.html',
    '/pages/resources.html',
    '/pages/events.html',
    '/pages/badges.html',
    '/pages/settings.html',
    '/pages/about.html',
    '/pages/contact.html',
    '/pages/signup.html',
    '/pages/offline.html',
    
    // CSS Files
    '/css/global.css',
    '/css/index.css',
    '/css/home.css',
    '/css/projects.css',
    '/css/profile.css',
    '/css/forum.css',
    '/css/resources.css',
    '/css/events.css',
    '/css/badges.css',
    '/css/settings.css',
    '/css/about.css',
    '/css/contact.css',
    '/css/signup.css',
    '/css/pwa.css',
    
    // JavaScript Files
    '/js/global.js',
    '/js/index.js',
    '/js/home.js',
    '/js/projects.js',
    '/js/profile.js',
    '/js/forum.js',
    '/js/resources.js',
    '/js/events.js',
    '/js/badges.js',
    '/js/settings.js',
    '/js/about.js',
    '/js/contact.js',
    '/js/signup.js',
    '/js/pwa.js',
    
    // Icons and Assets
    '/assets/favicon.ico',
    '/assets/favicon-32x32.png',
    '/assets/apple-touch-icon-180x180.png',
    '/assets/android-chrome-192x192.png',
    '/assets/android-chrome-512x512.png',
    '/assets/devden.PNG',
    '/assets/site.webmanifest'
];

// Install Event - Cache resources
self.addEventListener('install', event => {
    console.log('DevDen SW: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('DevDen SW: Caching app shell');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                console.log('DevDen SW: Install complete');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('DevDen SW: Install failed', error);
            })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', event => {
    console.log('DevDen SW: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('DevDen SW: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('DevDen SW: Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch Event - Serve cached content when offline
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip external requests (APIs, CDNs, etc.)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    // Handle root URL requests - but don't redirect if already requesting index.html
    if ((event.request.url === self.location.origin + '/' || 
         event.request.url === self.location.origin) &&
        !event.request.url.includes('index.html')) {
        event.respondWith(
            caches.match('/index.html').then(response => {
                if (response) {
                    return response;
                }
                return fetch('/index.html').catch(() => {
                    return caches.match(OFFLINE_URL);
                });
            })
        );
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    console.log('DevDen SW: Serving from cache', event.request.url);
                    return response;
                }
                
                // Try to fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response for caching
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Network failed, try to serve offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        
                        // For other requests, return a generic offline response
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Background Sync - Handle offline actions
self.addEventListener('sync', event => {
    console.log('DevDen SW: Background sync triggered', event.tag);
    
    if (event.tag === 'background-sync-projects') {
        event.waitUntil(syncProjects());
    }
    
    if (event.tag === 'background-sync-profile') {
        event.waitUntil(syncProfile());
    }
});

// Sync offline projects when back online
async function syncProjects() {
    try {
        console.log('DevDen SW: Syncing offline projects...');
        
        // Get offline projects from IndexedDB
        const offlineProjects = await getOfflineData('projects');
        
        if (offlineProjects && offlineProjects.length > 0) {
            // Send to server
            for (const project of offlineProjects) {
                await fetch('/api/projects', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(project)
                });
            }
            
            // Clear offline storage after successful sync
            await clearOfflineData('projects');
            console.log('DevDen SW: Projects synced successfully');
        }
    } catch (error) {
        console.error('DevDen SW: Project sync failed', error);
    }
}

// Sync offline profile changes when back online
async function syncProfile() {
    try {
        console.log('DevDen SW: Syncing offline profile...');
        
        const offlineProfile = await getOfflineData('profile');
        
        if (offlineProfile) {
            await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(offlineProfile)
            });
            
            await clearOfflineData('profile');
            console.log('DevDen SW: Profile synced successfully');
        }
    } catch (error) {
        console.error('DevDen SW: Profile sync failed', error);
    }
}

// Helper functions for IndexedDB operations
async function getOfflineData(storeName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('DevDenOfflineDB', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const getRequest = store.getAll();
            
            getRequest.onsuccess = () => resolve(getRequest.result);
            getRequest.onerror = () => reject(getRequest.error);
        };
        
        request.onerror = () => reject(request.error);
    });
}

async function clearOfflineData(storeName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('DevDenOfflineDB', 1);
        
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const clearRequest = store.clear();
            
            clearRequest.onsuccess = () => resolve();
            clearRequest.onerror = () => reject(clearRequest.error);
        };
        
        request.onerror = () => reject(request.error);
    });
}

// Push notification handling (for future use)
self.addEventListener('push', event => {
    console.log('DevDen SW: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/assets/android-chrome-192x192.png',
        badge: '/assets/favicon-32x32.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Open DevDen',
                icon: '/assets/favicon-32x32.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/favicon-32x32.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('DevDen', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('DevDen SW: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/pages/home.html')
        );
    }
});

console.log('DevDen Service Worker loaded successfully! 🚀');