// Touch state variables
let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let touchEndX = 0;
let isDragging = false;
let initialTransform = 0;
let currentTranslate = 0;
let isScrollingVertically = false;
let windowWidth = window.innerWidth;

/**
 * Initialize mobile swipe functionality
 */
function initMobileSwipe() {
    const lightbox = document.getElementById('lightbox');
    
    windowWidth = window.innerWidth;
    
    // Use passive: true for vertical scrolls, but false for horizontal (which we might want to prevent)
    lightbox.addEventListener('touchstart', handleTouchStart, { passive: false });
    lightbox.addEventListener('touchmove', handleTouchMove, { passive: false });
    lightbox.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Ensure close button is always clickable
    const closeButton = document.querySelector('.close-lightbox');
    closeButton.addEventListener('touchstart', (e) => {
        e.stopPropagation();
    });
    
    // Update window width on resize
    window.addEventListener('resize', () => {
        windowWidth = window.innerWidth;
    });
}

/**
 * Handle touch start event
 * @param {TouchEvent} e - Touch event
 */
function handleTouchStart(e) {
    if (window.innerWidth > 600) return;
    
    // Don't start swiping if we're trying to click the close button
    if (e.target.closest('.close-lightbox')) return;
    
    // Set initial touch positions
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchCurrentX = touchStartX;
    
    // Don't prevent default here to allow scrolling to start normally
    isDragging = true;
    initialTransform = currentTranslate;
    
    // Preload adjacent slides
    preloadAdjacentSlides();
}

/**
 * Handle touch move event
 * @param {TouchEvent} e - Touch event
 */
function handleTouchMove(e) {
    if (!isDragging || window.innerWidth > 600) return;
    
    // If trying to operate close button, ignore move event
    if (e.target.closest('.close-lightbox')) return;
    
    const touchCurrentY = e.touches[0].clientY;
    touchCurrentX = e.touches[0].clientX;
    
    const deltaX = touchCurrentX - touchStartX;
    const deltaY = touchCurrentY - touchStartY;
    
    // Determine if this is primarily a vertical scroll or horizontal swipe
    if (!isScrollingVertically && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
        isScrollingVertically = true;
    }
    
    // If we're scrolling vertically, don't interfere
    if (isScrollingVertically) {
        return;
    }
    
    // If clearly swiping horizontally and not scrolling vertically
    if (Math.abs(deltaX) > 10) {
        e.preventDefault(); // Only prevent default for horizontal swipes
        
        // Calculate how far to translate the slider
        const slider = document.getElementById('lightbox-slider');
        
        // Resistance at the edges
        let dragOffset = deltaX;
        if ((lightboxState.currentImageIndex === 0 && deltaX > 0) || 
            (lightboxState.currentImageIndex === galleryState.items.length - 1 && deltaX < 0)) {
            dragOffset = deltaX * 0.3; // Apply resistance
        }
        
        currentTranslate = initialTransform + dragOffset;
        slider.style.transform = `translateX(${currentTranslate}px)`;
    }
}

/**
 * Handle touch end event
 * @param {TouchEvent} e - Touch event
 */
function handleTouchEnd(e) {
    if (!isDragging || window.innerWidth > 600) return;
    
    isDragging = false;
    touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const slider = document.getElementById('lightbox-slider');
    
    // Threshold to determine if we should navigate or snap back
    const threshold = windowWidth * 0.2; // 20% of screen width
    
    if (deltaX > threshold && lightboxState.currentImageIndex > 0) {
        // Swipe right - go to previous image
        slider.style.transition = 'transform 0.3s ease-out';
        slider.style.transform = `translateX(${windowWidth}px)`;
        
        setTimeout(() => {
            navigateImages(-1);
            slider.style.transition = 'none';
            slider.style.transform = 'translateX(0)';
            currentTranslate = 0;
            
            // Re-enable transition after reset
            setTimeout(() => {
                slider.style.transition = 'transform 0.3s ease-out';
            }, 50);
        }, 300);
    } else if (deltaX < -threshold && lightboxState.currentImageIndex < galleryState.items.length - 1) {
        // Swipe left - go to next image
        slider.style.transition = 'transform 0.3s ease-out';
        slider.style.transform = `translateX(${-windowWidth}px)`;
        
        setTimeout(() => {
            navigateImages(1);
            slider.style.transition = 'none';
            slider.style.transform = 'translateX(0)';
            currentTranslate = 0;
            
            // Re-enable transition after reset
            setTimeout(() => {
                slider.style.transition = 'transform 0.3s ease-out';
            }, 50);
        }, 300);
    } else {
        // Snap back to current image
        slider.style.transition = 'transform 0.3s ease-out';
        slider.style.transform = 'translateX(0)';
        currentTranslate = 0;
    }
}