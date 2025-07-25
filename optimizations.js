// Performance ve Optimizasyon İyileştirmeleri
// Bu dosya tüm sayfalarda yüklenecek genel optimizasyonları içerir

(function() {
    'use strict';
    
    // Critical CSS loading optimization
    function loadCSSAsync(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        link.onload = function() {
            link.media = 'all';
        };
        document.head.appendChild(link);
    }
    
    // Image lazy loading
    function lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    // Local Storage optimization
    function optimizeLocalStorage() {
        // Storage quota check
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            navigator.storage.estimate().then(estimate => {
                const used = estimate.usage;
                const quota = estimate.quota;
                const usedMB = Math.round(used / 1024 / 1024);
                const quotaMB = Math.round(quota / 1024 / 1024);
                
                console.log(`Storage kullanımı: ${usedMB}MB / ${quotaMB}MB`);
                
                // Clean old data if storage is getting full
                if (used / quota > 0.8) {
                    cleanOldData();
                }
            });
        }
    }
    
    function cleanOldData() {
        // Remove old exam data (older than 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        try {
            const exams = JSON.parse(localStorage.getItem('exams') || '[]');
            const cleanedExams = exams.filter(exam => {
                const examDate = new Date(exam.date);
                return examDate > sixMonthsAgo;
            });
            
            if (cleanedExams.length !== exams.length) {
                localStorage.setItem('exams', JSON.stringify(cleanedExams));
                console.log(`${exams.length - cleanedExams.length} eski sınav verisi temizlendi`);
            }
        } catch (e) {
            console.error('Veri temizleme hatası:', e);
        }
    }
    
    // Performance monitoring
    function monitorPerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perf = performance.getEntriesByType('navigation')[0];
                    if (perf) {
                        const loadTime = perf.loadEventEnd - perf.loadEventStart;
                        const domContentLoadedTime = perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart;
                        
                        console.log(`Sayfa yükleme süresi: ${Math.round(loadTime)}ms`);
                        console.log(`DOM hazır olma süresi: ${Math.round(domContentLoadedTime)}ms`);
                        
                        // Send analytics if needed
                        if (loadTime > 3000) {
                            console.warn('Sayfa yükleme süresi yavaş:', loadTime + 'ms');
                        }
                    }
                }, 0);
            });
        }
    }
    
    // Memory usage optimization
    function optimizeMemory() {
        // Clear event listeners on page unload
        window.addEventListener('beforeunload', () => {
            // Clear timers
            if (window.countdownTimer) {
                clearInterval(window.countdownTimer);
            }
            
            // Clear observers
            if (window.intersectionObserver) {
                window.intersectionObserver.disconnect();
            }
        });
        
        // Debounce scroll events
        let scrollTimer;
        const originalScrollHandler = window.onscroll;
        window.onscroll = function(e) {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                if (originalScrollHandler) {
                    originalScrollHandler.call(this, e);
                }
            }, 16); // ~60fps
        };
    }
    
    // Cache management
    function manageCacheStorage() {
        if ('caches' in window) {
            // Clean old cache versions
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    if (cacheName.startsWith('yks-app-') && cacheName !== 'yks-app-v1.0.0') {
                        caches.delete(cacheName);
                        console.log('Eski cache temizlendi:', cacheName);
                    }
                });
            });
        }
    }
    
    // Network optimization
    function optimizeNetwork() {
        // Preload critical resources
        const criticalResources = [
            '/planlar.css',
            '/dersler.css',
            '/denemeler.css'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = resource;
            document.head.appendChild(link);
        });
        
        // DNS prefetch for external resources
        const externalDomains = [
            'https://cdnjs.cloudflare.com',
            'https://cdn.jsdelivr.net'
        ];
        
        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }
    
    // Touch optimization for mobile
    function optimizeTouch() {
        // Fast click for mobile
        let touchStartTime = 0;
        let touchStartTarget = null;
        
        document.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartTarget = e.target;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            if (touchDuration < 200 && e.target === touchStartTarget) {
                // Fast tap detected
                const clickableElement = e.target.closest('button, a, [onclick], [data-action]');
                if (clickableElement && !clickableElement.disabled) {
                    e.preventDefault();
                    clickableElement.click();
                }
            }
        }, { passive: false });
    }
    
    // Initialize optimizations
    function initialize() {
        // Run optimizations when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runOptimizations);
        } else {
            runOptimizations();
        }
    }
    
    function runOptimizations() {
        try {
            lazyLoadImages();
            optimizeLocalStorage();
            monitorPerformance();
            optimizeMemory();
            manageCacheStorage();
            optimizeNetwork();
            
            // Mobile specific optimizations
            if ('ontouchstart' in window) {
                optimizeTouch();
            }
            
            console.log('🚀 Performans optimizasyonları aktif');
        } catch (error) {
            console.error('Optimizasyon hatası:', error);
        }
    }
    
    // Start optimization
    initialize();
    
    // Export functions for external use
    window.YKSOptimizations = {
        lazyLoadImages,
        optimizeLocalStorage,
        cleanOldData
    };
    
})();
