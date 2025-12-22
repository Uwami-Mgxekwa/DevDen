// DevDen PWA Manager - Install Prompt & Offline Storage
// Handles PWA installation, offline data, and background sync

(function() {
    'use strict';

    let deferredPrompt;
    let isInstalled = false;

    // PWA Manager Object
    const PWAManager = {
        
        // Initialize PWA functionality
        init: function() {
            this.registerServiceWorker();
            this.setupInstallPrompt();
            this.initOfflineStorage();
            this.checkOnlineStatus();
            this.setupBackgroundSync();
            
            console.log('DevDen PWA Manager initialized! 🚀');
        },

        // Register Service Worker
        registerServiceWorker: function() {
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                        .then(registration => {
                            console.log('DevDen SW: Registered successfully', registration.scope);
                            
                            // Check for updates
                            registration.addEventListener('updatefound', () => {
                                const newWorker = registration.installing;
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                        this.showUpdateNotification();
                                    }
                                });
                            });
                        })
                        .catch(error => {
                            console.error('DevDen SW: Registration failed', error);
                        });
                });
            }
        },

        // Setup Install Prompt
        setupInstallPrompt: function() {
            // Listen for beforeinstallprompt event
            window.addEventListener('beforeinstallprompt', (e) => {
                console.log('DevDen PWA: Install prompt available');
                
                // Prevent the mini-infobar from appearing
                e.preventDefault();
                
                // Save the event for later use
                deferredPrompt = e;
                
                // Show custom install prompt after a delay
                setTimeout(() => {
                    this.showInstallPrompt();
                }, 3000); // Show after 3 seconds
            });

            // Listen for app installed event
            window.addEventListener('appinstalled', () => {
                console.log('DevDen PWA: App installed successfully!');
                isInstalled = true;
                this.hideInstallPrompt();
                this.showInstalledNotification();
            });

            // Check if already installed
            if (window.matchMedia('(display-mode: standalone)').matches || 
                window.navigator.standalone === true) {
                isInstalled = true;
                console.log('DevDen PWA: Already running as installed app');
            }
        },

        // Show custom install prompt
        showInstallPrompt: function() {
            if (isInstalled || !deferredPrompt) return;

            // Determine the correct path for assets based on current location
            const isInPagesFolder = window.location.pathname.includes('/pages/');
            const assetsPath = isInPagesFolder ? '../assets/' : 'assets/';

            // Create install prompt HTML with DevDen logo
            const promptHTML = `
                <div id="pwa-install-prompt" class="pwa-install-prompt">
                    <div class="pwa-prompt-content">
                        <div class="pwa-prompt-header">
                            <img src="${assetsPath}android-chrome-192x192.png" alt="DevDen" class="pwa-prompt-icon" 
                                 onerror="this.onerror=null; this.src='${assetsPath}devden.PNG';">
                            <div class="pwa-prompt-text">
                                <h3>Install DevDen</h3>
                                <p>Get the full app experience with offline access and faster loading!</p>
                            </div>
                        </div>
                        <div class="pwa-prompt-actions">
                            <button id="pwa-install-btn" class="pwa-btn-install">Install App</button>
                            <button id="pwa-dismiss-btn" class="pwa-btn-dismiss">Not Now</button>
                        </div>
                    </div>
                </div>
            `;

            // Add to page
            document.body.insertAdjacentHTML('beforeend', promptHTML);

            // Add event listeners
            document.getElementById('pwa-install-btn').addEventListener('click', () => {
                this.installApp();
            });

            document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
                this.hideInstallPrompt();
                // Don't show again for 24 hours
                localStorage.setItem('pwa-prompt-dismissed', Date.now());
            });

            // Auto-hide after 10 seconds
            setTimeout(() => {
                this.hideInstallPrompt();
            }, 10000);
        },

        // Install the app
        installApp: function() {
            if (!deferredPrompt) return;

            // Show the install prompt
            deferredPrompt.prompt();

            // Wait for user response
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('DevDen PWA: User accepted install');
                } else {
                    console.log('DevDen PWA: User dismissed install');
                }
                deferredPrompt = null;
            });

            this.hideInstallPrompt();
        },

        // Hide install prompt
        hideInstallPrompt: function() {
            const prompt = document.getElementById('pwa-install-prompt');
            if (prompt) {
                prompt.remove();
            }
        },

        // Show installed notification
        showInstalledNotification: function() {
            if (window.DevDen && window.DevDen.showToast) {
                window.DevDen.showToast('DevDen installed successfully! 🎉', 'success');
            }
        },

        // Show update notification
        showUpdateNotification: function() {
            if (window.DevDen && window.DevDen.showToast) {
                window.DevDen.showToast('New version available! Refresh to update.', 'info');
            }
        },

        // Initialize offline storage (IndexedDB)
        initOfflineStorage: function() {
            if (!('indexedDB' in window)) {
                console.warn('DevDen PWA: IndexedDB not supported');
                return;
            }

            const request = indexedDB.open('DevDenOfflineDB', 1);

            request.onerror = () => {
                console.error('DevDen PWA: IndexedDB error', request.error);
            };

            request.onsuccess = () => {
                console.log('DevDen PWA: IndexedDB initialized');
                this.db = request.result;
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('projects')) {
                    const projectStore = db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
                    projectStore.createIndex('title', 'title', { unique: false });
                    projectStore.createIndex('category', 'category', { unique: false });
                }

                if (!db.objectStoreNames.contains('profile')) {
                    db.createObjectStore('profile', { keyPath: 'id' });
                }

                if (!db.objectStoreNames.contains('forum')) {
                    const forumStore = db.createObjectStore('forum', { keyPath: 'id', autoIncrement: true });
                    forumStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                console.log('DevDen PWA: IndexedDB schema created');
            };
        },

        // Save data offline
        saveOfflineData: function(storeName, data) {
            return new Promise((resolve, reject) => {
                if (!this.db) {
                    reject('Database not initialized');
                    return;
                }

                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                
                // Add timestamp for sync purposes
                data.offlineTimestamp = Date.now();
                data.needsSync = true;

                const request = store.add(data);

                request.onsuccess = () => {
                    console.log(`DevDen PWA: Data saved offline to ${storeName}`);
                    resolve(request.result);
                };

                request.onerror = () => {
                    console.error(`DevDen PWA: Failed to save offline data to ${storeName}`, request.error);
                    reject(request.error);
                };
            });
        },

        // Get offline data
        getOfflineData: function(storeName) {
            return new Promise((resolve, reject) => {
                if (!this.db) {
                    reject('Database not initialized');
                    return;
                }

                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject(request.error);
                };
            });
        },

        // Setup background sync
        setupBackgroundSync: function() {
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                navigator.serviceWorker.ready.then(registration => {
                    // Register background sync for projects
                    registration.sync.register('background-sync-projects');
                    
                    // Register background sync for profile
                    registration.sync.register('background-sync-profile');
                    
                    console.log('DevDen PWA: Background sync registered');
                });
            }
        },

        // Check online status
        checkOnlineStatus: function() {
            let wasOffline = false;
            
            const updateOnlineStatus = () => {
                const isOnline = navigator.onLine;
                document.body.classList.toggle('offline', !isOnline);
                
                if (isOnline && wasOffline) {
                    // Only show "back online" if user was actually offline
                    console.log('DevDen PWA: Back online - triggering sync');
                    this.triggerBackgroundSync();
                    this.showOnlineNotification();
                    wasOffline = false;
                } else if (!isOnline && !wasOffline) {
                    // Only show offline notification once
                    console.log('DevDen PWA: Gone offline');
                    this.showOfflineNotification();
                    wasOffline = true;
                }
            };

            window.addEventListener('online', updateOnlineStatus);
            window.addEventListener('offline', updateOnlineStatus);
            
            // Initial check - don't show notifications on page load
            const isOnline = navigator.onLine;
            document.body.classList.toggle('offline', !isOnline);
            if (!isOnline) {
                wasOffline = true;
            }
        },

        // Trigger background sync
        triggerBackgroundSync: function() {
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.sync.register('background-sync-projects');
                    registration.sync.register('background-sync-profile');
                });
            }
        },

        // Show offline notification
        showOfflineNotification: function() {
            // Remove any existing online notifications first
            this.removeExistingToasts();
            
            if (window.DevDen && window.DevDen.showToast) {
                window.DevDen.showToast('You\'re offline. Changes will sync when back online.', 'warning');
            }
        },

        // Show online notification
        showOnlineNotification: function() {
            // Remove any existing offline notifications first
            this.removeExistingToasts();
            
            if (window.DevDen && window.DevDen.showToast) {
                window.DevDen.showToast('Connection restored. Syncing changes...', 'success');
            }
        },

        // Remove existing toast notifications
        removeExistingToasts: function() {
            const existingToasts = document.querySelectorAll('.toast');
            existingToasts.forEach(toast => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 100);
            });
        }
    };

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        // Check if prompt was recently dismissed (5 minutes for testing)
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (dismissed && (Date.now() - dismissed) < 5 * 60 * 1000) { // 5 minutes instead of 24 hours
            console.log('DevDen PWA: Install prompt recently dismissed');
            return;
        }

        PWAManager.init();
    });

    // Expose PWA Manager globally
    window.DevDenPWA = PWAManager;

})();