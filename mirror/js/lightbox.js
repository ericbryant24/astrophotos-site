// Track lightbox state
const lightboxState = {
    currentImageIndex: 0,
    lastNavigationDirection: 0
};

/**
 * Navigate to next or previous image, respecting active filters
 * @param {number} direction - Direction to navigate (-1 for previous, 1 for next)
 */
function navigateImages(direction) {
    // Get only the currently visible items
    const visibleItems = getVisibleGalleryItems();
    
    if (visibleItems.length === 0) {
        return; // No visible items to navigate
    }
    
    // Find the current item's position within the visible items
    const currentItem = galleryState.items[lightboxState.currentImageIndex];
    const currentVisibleIndex = visibleItems.findIndex(item => item.name === currentItem.name);
    
    // Calculate the next visible index
    const nextVisibleIndex = currentVisibleIndex + direction;
    
    // Ensure the next index is valid
    if (nextVisibleIndex >= 0 && nextVisibleIndex < visibleItems.length) {
        // Get the next visible item
        const nextVisibleItem = visibleItems[nextVisibleIndex];
        
        // Find its index in the full gallery items array
        const fullGalleryIndex = galleryState.items.findIndex(item => item.name === nextVisibleItem.name);
        
        // Update state and open lightbox
        lightboxState.lastNavigationDirection = direction;
        lightboxState.currentImageIndex = fullGalleryIndex;
        openLightbox(galleryState.items[fullGalleryIndex], direction);
    }
}
/**
 * Gets the currently visible gallery items (respecting any active filters)
 * @returns {Array} - Array of visible gallery items
 */
function getVisibleGalleryItems() {
    // Check if we have an active tag filter
    const activeTag = getUrlParam('tag');
    
    if (!activeTag) {
        // No filter active, return all items in current sort order
        return galleryState.items;
    }
    
    // Filter items by the active tag
    return galleryState.items.filter(item => {
        return item.tags && item.tags.includes(activeTag);
    });
}
/**
 * Update navigation buttons visibility based on filtered items
 */
function updateNavButtonsVisibility() {
    const visibleItems = getVisibleGalleryItems();
    if (visibleItems.length <= 1) {
        // If only one or no items are visible, hide both buttons
        document.getElementById('prev-button').style.visibility = 'hidden';
        document.getElementById('next-button').style.visibility = 'hidden';
        return;
    }
    
    // Find current position in visible items
    const currentItem = galleryState.items[lightboxState.currentImageIndex];
    const currentVisibleIndex = visibleItems.findIndex(item => item.name === currentItem.name);
    
    // Update buttons based on position
    document.getElementById('prev-button').style.visibility = 
        currentVisibleIndex > 0 ? 'visible' : 'hidden';
    document.getElementById('next-button').style.visibility = 
        currentVisibleIndex < visibleItems.length - 1 ? 'visible' : 'hidden';
}

/**
 * Opens the lightbox with a media item
 * @param {Object} item - The media item to display
 * @param {number} direction - Direction of navigation (optional)
 */
/**
 * Opens the lightbox with a media item
 * @param {Object} item - The media item to display
 * @param {number} direction - Direction of navigation (optional)
 */
function openLightbox(item, direction = 0) {
    const lightbox = document.getElementById('lightbox');
    const slider = document.getElementById('lightbox-slider');
    const currentSlide = document.getElementById('current-slide');
    
    // Reset any active transitions and transforms
    slider.style.transition = 'none';
    slider.style.transform = 'translateX(0)';
    currentTranslate = 0;
    isScrollingVertically = false;
    
    // Ensure lightbox is scrolled to top when opening
    setTimeout(() => {
        lightbox.scrollTop = 0;
    }, 10);
    
    // Find the index of the current item
    lightboxState.currentImageIndex = galleryState.items.findIndex(i => i.name === item.name);
    
    // Setup the current slide with the item's content
    setupSlideContent(currentSlide, item, '');
    
    // For mobile, preload adjacent slides
    if (window.innerWidth <= 600) {
        preloadAdjacentSlides();
    }
    
    // Show lightbox
    document.getElementById('lightbox').classList.add('active');

    updateNavButtonsVisibility();

    // Set min-height to ensure document is tall enough for scrolling
    document.body.style.minHeight = '100vh';

    // Update URL
    setUrlParam('image', item.name.split('/').pop());
    
    // Re-enable transition after reset
    setTimeout(() => {
        slider.style.transition = 'transform 0.3s ease-out';
    }, 50);
    
    // Allow scrolling to work by preventing mobile browsers from capturing events
    document.body.style.overflowY = 'hidden';
    lightbox.style.overflowY = 'scroll';
    
    // Add heart button to lightbox
    if (typeof addHeartButtonToLightbox === 'function') {
        // Remove existing button if it exists
        const existingButton = document.getElementById('lightbox-heart-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Add the heart button
        setTimeout(() => {
            addHeartButtonToLightbox(item);
        }, 100);
    }
}

/**
 * Closes the lightbox
 */
function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    
    // Pause video if playing
    const lightboxVideo = document.querySelector('#current-slide video');
    if (lightboxVideo) {
        lightboxVideo.pause();
    }
    
    // Reset body overflow
    document.body.style.overflowY = '';

    // Update URL
    removeUrlParam('image');
}

function preloadAdjacentSlides() {
    // Get visible items respecting filters
    const visibleItems = getVisibleGalleryItems();
    
    // If only one item is visible, no need to preload
    if (visibleItems.length <= 1) return;
    
    // Find current position in visible items
    const currentItem = galleryState.items[lightboxState.currentImageIndex];
    const currentVisibleIndex = visibleItems.findIndex(item => item.name === currentItem.name);
    
    // Determine next item index
    const nextVisibleIndex = Math.min(currentVisibleIndex + 1, visibleItems.length - 1);
    
    // Only preload if there is a different next item
    if (nextVisibleIndex !== currentVisibleIndex) {
        const nextSlide = document.getElementById('next-slide');
        const nextItem = visibleItems[nextVisibleIndex];
        
        // Setup next slide content
        setupSlideContent(nextSlide, nextItem, 'next');
        nextSlide.style.transform = 'translateX(100%)';
    }
}

/**
 * Set up content for a lightbox slide
 * @param {Element} slideElement - The slide DOM element
 * @param {Object} item - Media item data
 * @param {string} prefix - Prefix for element IDs ('' or 'next')
 */
function setupSlideContent(slideElement, item, prefix) {
    // Find elements within the slide
    const imageElement = slideElement.querySelector('.lightbox-media[id$="lightbox-image"]');
    const videoElement = slideElement.querySelector('.lightbox-media[id$="lightbox-video"]');
    const descriptionElement = slideElement.querySelector('.lightbox-description');
    
    if (!imageElement || !videoElement || !descriptionElement) {
        console.error('Required elements not found in slide', slideElement);
        return;
    }
    
    // Hide both media elements initially
    imageElement.style.display = 'none';
    videoElement.style.display = 'none';
    
    // Setup the appropriate media element
    if (item.type === 'video') {
        const sourceElement = videoElement.querySelector('source');
        sourceElement.src = item.url;
        sourceElement.type = `video/${item.url.split('.').pop()}`;
        videoElement.load();
        videoElement.style.display = 'block';
    } else {
        imageElement.src = item.url;
        imageElement.alt = item.displayName;
        imageElement.style.display = 'block';
        
        // Add click event for fullscreen view on images only
        imageElement.style.cursor = 'zoom-in';
        imageElement.onclick = () => openFullscreenView(item);
    }
    
    // Setup description
    descriptionElement.innerHTML = buildDescriptionHTML(item);
}

/**
 * Build HTML for lightbox description
 * @param {Object} item - Media item data
 * @returns {string} - HTML content
 */
function buildDescriptionHTML(item) {
    let html = `<h2>${item.name}</h2>`;

    // Add tags if available
    if (item.tags && item.tags.length > 0) {
        html += `
            <div class="metadata-item">
                <span class="metadata-label">Tags:</span>
                <div class="tags-container">
                    ${item.tags.map(tag => `
                        <a href="?tag=${encodeURIComponent(tag)}" class="tag-link" 
                        onclick="event.preventDefault(); filterByTag('${tag}');">
                            ${tag}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Add description
    html += `<div>${item.description}</div>`;
    
    // Add metadata if available
    if (item.distance_ly || item.wikipedia_url || item.erics_notes) {
        html += '<hr style="border-color: rgba(255,255,255,0.1); margin: 16px 0;">';
        
        if (item.distance_ly) {
            html += `
                <div class="metadata-item">
                    <span class="metadata-label">Distance:</span>
                    <span>${item.distance_ly} light-years</span>
                </div>
            `;
        }
        
        if (item.wikipedia_url) {
            html += `
                <div class="metadata-item">
                    <span class="metadata-label">Wikipedia:</span>
                    <a href="${item.wikipedia_url}" target="_blank">View on Wikipedia</a>
                </div>
            `;
        }
        
        if (item.erics_notes) {
            html += `
                <div class="metadata-item">
                    <span class="metadata-label">Eric's Notes:</span>
                    <span>${item.erics_notes}</span>
                </div>
            `;
        }
    }
    
    return html;
}

/**
 * Sets up keyboard event listeners for lightbox navigation
 */
function initKeyboardNavigation() {
    window.addEventListener('keydown', function(e) {
        if (!document.getElementById('lightbox').classList.contains('active')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                navigateImages(-1);
                break;
            case 'ArrowRight':
                navigateImages(1);
                break;
            case 'Escape':
                closeLightbox();
                break;
        }
    });
}

/**
 * Initialize lightbox click outside to close
 */
function initLightboxCloseOnClickOutside() {
    document.getElementById('lightbox').addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightbox();
        }
    });
}

/**
 * Opens an image in fullscreen view
 * @param {Object} item - The media item data
 */
function openFullscreenView(item) {
    // Build the fullscreen URL with parameters
    const params = new URLSearchParams({
        image: encodeURIComponent(item.url),
        name: encodeURIComponent(item.name),
        return: window.location.href
    });
    
    // Navigate to the fullscreen page
    window.location.href = `fullscreen.html?${params.toString()}`;
}

