/**
 * Initialize the application
 */
/**
 * Initialize the application
 */
async function initApp() {
    try {
        // Fetch media items
        const mediaItems = await fetchMediaItems();
        
        // Render gallery with fetched items
        renderGallery(mediaItems);
        
        // Initialize all event listeners and components
        initSortButtons();
        initKeyboardNavigation();
        initLightboxCloseOnClickOutside();
        initMobileSwipe();

        // Handle direct image loading from URL
        handleDirectImageFromUrl();
        
        // Handle tag filter from URL
        handleTagFilterFromUrl();
    } catch (error) {
        console.error('Error initializing gallery:', error);
        document.getElementById('combined-gallery').innerHTML = `
            <div class="error-message">
                There was an error loading gallery items. Please check your connection and try again.
                <br><small>${error.message}</small>
            </div>
        `;
    }
}

/**
 * Handle direct image loading from URL
 */
function handleDirectImageFromUrl() {
    const directImage = getUrlParam('image');
    if (directImage) {
        const item = galleryState.items.find(item => 
            item.name === directImage || 
            item.displayName === directImage ||
            item.name.split('/').pop() === directImage
        );
        
        if (item) {
            openLightbox(item);
        }
    }
}

/**
 * Handle tag filter from URL
 */
function handleTagFilterFromUrl() {
    const tagFilter = getUrlParam('tag');
    if (tagFilter) {
        setTimeout(() => {
            filterGalleryByTag(tagFilter);
        }, 100);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);