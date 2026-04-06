// ==================== MOBILE MENU TOGGLE ====================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const body = document.body;

// Toggle menu on hamburger click
hamburger.addEventListener('click', function (e) {
    e.stopPropagation();
    const isActive = hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isActive);
    body.style.overflow = isActive ? 'hidden' : '';
});

// Support for Enter/Space on hamburger
hamburger.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hamburger.click();
    }
});

// Close menu when clicking on a link (if it's not a dropdown toggle)
navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        // If it's a dropdown toggle in mobile, do not close menu
        const parent = link.parentElement;
        if (window.innerWidth <= 768 && parent.classList.contains('nav-item')) {
            return;
        }

        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
    });
});

// Close menu when clicking outside
document.addEventListener('click', function (e) {
    if (navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
    }
});

// Prevent menu from closing when clicking inside it
navMenu.addEventListener('click', function (e) {
    e.stopPropagation();
});

// ==================== HEADER SCROLL EFFECT ====================
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ==================== INTERSECTION OBSERVER FOR ANIMATIONS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards and benefit items
document.querySelectorAll('.service-card, .benefit-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ==================== ACTIVE NAV LINK ====================
const currentPage = window.location.pathname; // Gets absolute path like /imprenta-puebla/
navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');

    // Check for exact match or if it's a parent folder
    if (linkPage === '/' && (currentPage === '/' || currentPage === '/index.html')) {
        link.classList.add('active');
    } else if (linkPage !== '/' && currentPage.includes(linkPage)) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});

// ==================== MOBILE DROPDOWN LOGIC ====================
const dropdowns = document.querySelectorAll('.nav-item');

dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('.nav-link');

    if (link) {
        link.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                // If it's a dropdown toggle
                // Prevent default if not already open
                if (!dropdown.classList.contains('active-mobile')) {
                    e.preventDefault();
                    e.stopImmediatePropagation(); // Ensure no other handlers interfere

                    // Close other dropdowns
                    dropdowns.forEach(d => {
                        if (d !== dropdown) d.classList.remove('active-mobile');
                    });

                    dropdown.classList.add('active-mobile');
                }
            }
        });
    }
});
// ==================== FAQ ACCORDION LOGIC ====================
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Optional: Close other open items
        document.querySelectorAll('.faq-item').forEach(otherItem => {
            otherItem.classList.remove('active');
        });

        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// ==================== LAZY VIDEO LOADING ====================
/**
 * Lazy load hero video to improve mobile performance
 * - Defers video loading until hero is visible
 * - Skips video on mobile/slow connections (shows poster only)
 * - Maintains autoplay/mute/loop without blocking LCP
 */
(function () {
    const lazyVideo = document.querySelector('.lazy-video');

    if (!lazyVideo) return;

    /**
     * Check if user is on mobile or has data saver enabled
     */
    function shouldSkipVideo() {
        // Check for data saver mode
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

            // Skip video if save-data is enabled
            if (connection && connection.saveData) {
                return true;
            }

            // Skip video on slow connections (2G, slow-2g)
            if (connection && connection.effectiveType) {
                const slowConnections = ['slow-2g', '2g'];
                if (slowConnections.includes(connection.effectiveType)) {
                    return true;
                }
            }
        }

        // Removed strict mobile check to allow lazy loading on visibility
        return false;
    }

    /**
     * Load and play the video
     */
    function loadVideo() {
        const videoSrc = lazyVideo.getAttribute('data-src');
        const source = lazyVideo.querySelector('source');

        if (!videoSrc) return;

        // Set the source
        if (source) {
            source.src = source.getAttribute('data-src') || videoSrc;
        }
        // Only set src if not already set to avoid double loading
        if (!lazyVideo.src) {
            lazyVideo.src = videoSrc;
        }

        // Load and play the video
        lazyVideo.load();

        // Attempt to play (with error handling)
        const playPromise = lazyVideo.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Auto-play was prevented, video will show poster
                console.log('Video autoplay prevented:', error);
            });
        }
    }

    // Skip video loading if on data saver
    if (shouldSkipVideo()) {
        console.log('Video loading skipped (data-saver mode)');
        return;
    }

    // Use Intersection Observer to load video when hero is visible
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadVideo();
                videoObserver.unobserve(lazyVideo);
            }
        });
    }, {
        // Load video when hero is 10% visible
        threshold: 0.1,
        // Start loading slightly before hero is visible
        rootMargin: '50px'
    });

    videoObserver.observe(lazyVideo);

    // Fallback: Load video after page is fully loaded (if not already loaded)
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!lazyVideo.src) {
                loadVideo();
            }
        }, 1000); // Wait 1 second after page load
    });
})();

// ==================== LAZY LOAD TRUSTINDEX WIDGET ====================
(function () {
    const reviewsWidget = document.querySelector('.reviews-widget');
    if (!reviewsWidget) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Create and inject script
                const script = document.createElement('script');
                script.src = 'https://cdn.trustindex.io/loader.js?1572ae962ce5105fb5965de5430';
                script.defer = true;
                script.async = true;
                reviewsWidget.appendChild(script);

                // Stop observing
                observer.unobserve(reviewsWidget);
                // console.log('Trustindex loaded');
            }
        });
    }, {
        rootMargin: '200px' // Load when widget is 200px from viewport
    });

    observer.observe(reviewsWidget);
})();
