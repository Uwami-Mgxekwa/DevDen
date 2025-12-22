// DevDen Service Worker - PWA Functionality
// Version 1.0.0

const CACHE_NAME = 'devden-v1.0.4';
const OFFLINE_URL = '/DevDen/pages/offline.html';

// Files to cache for offline functionality
const CACHE_URLS = [
    // Root files
    '/DevDen/index.html',
    
    // Pages
    '/DevDen/pages/home.html',
    '/DevDen/pages/projects.html',
    '/DevDen/pages/profile.html',
    '/DevDen/pages/forum.html',
    '/DevDen/pages/resources.html',
    '/DevDen/pages/events.html',
    '/DevDen/pages/badges.html',
    '/DevDen/pages/settings.html',
    '/DevDen/pages/about.html',
    '/DevDen/pages/contact.html',
    '/DevDen/pages/signup.html',
    '/DevDen/pages/offline.html',
    
    // CSS Files
    '/DevDen/css/global.css',
    '/DevDen/css/index.css',
    '/DevDen/css/home.css',
    '/DevDen/css/projects.css',
    '/DevDen/css/profile.css',
    '/DevDen/css/forum.css',
    '/DevDen/css/resources.css',
    '/DevDen/css/events.css',
    '/DevDen/css/badges.css',
    '/DevDen/css/settings.css',
    '/DevDen/css/about.css',
    '/DevDen/css/contact.css',
    '/DevDen/css/signup.css',
    '/DevDen/css/pwa.css',
    
    // JavaScript Files
    '/DevDen/js/global.js',
    '/DevDen/js/index.js',
    '/DevDen/js/home.js',
    '/DevDen/js/projects.js',
    '/DevDen/js/profile.js',
    '/DevDen/js/forum.js',
    '/DevDen/js/resources.js',
    '/DevDen/js/events.js',
    '/DevDen/js/badges.js',
    '/DevDen/js/settings.js',
    '/DevDen/js/about.js',
    '/DevDen/js/contact.js',
    '/DevDen/js/signup.js',
    '/DevDen/js/pwa.js',
    
    // Icons and Assets
    '/DevDen/assets/favicon.ico',
    '/DevDen/assets/favicon-32x32.png',
    '/DevDen/assets/apple-touch-icon-180x180.png',
    '/DevDen/assets/android-chrome-192x192.png',
    '/DevDen/assets/android-chrome-512x512.png',
    '/DevDen/assets/devden.PNG',
    '/DevDen/assets/site.webmanifest'
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
    
    // TEMPORARILY DISABLE ROOT URL HANDLING TO STOP REFRESH LOOP
    // TODO: Fix this properly later
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
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