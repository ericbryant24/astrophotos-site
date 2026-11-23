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
        initSubscribeForm();
        
        // Initialize hearts functionality if available
        if (typeof initHearts === 'function') {
            initHearts();
        }

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
 * Initialize the subscribe form
 */
function initSubscribeForm() {
    const subscribeForm = document.getElementById('subscribe-form');
    
    subscribeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const submitButton = document.getElementById('submit-button');
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');
        
        // Basic validation
        if (!email || !email.includes('@') || !email.includes('.')) {
            errorMessage.textContent = 'Please enter a valid email address.';
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
            return;
        }
        
        // Reset messages
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        // Disable button while processing
        submitButton.disabled = true;
        submitButton.textContent = 'Subscribing...';
        
        try {
            const response = await subscribeUser(email);
            
            if (response.ok) {
                // Success
                successMessage.textContent = response.text || 'You\'ve been successfully subscribed!';
                successMessage.style.display = 'block';
                
                // Reset form
                subscribeForm.reset();
                
                // Close modal after 3 seconds on success
                setTimeout(() => {
                    closeSubscribeModal();
                }, 3000);
            } else {
                // Error from server
                errorMessage.textContent = response.text || 'There was an error processing your subscription. Please try again.';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            // Network or other error
            console.error('Subscription error:', error);
            errorMessage.textContent = 'Connection error. Please check your network and try again.';
            errorMessage.style.display = 'block';
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = 'Subscribe';
        }
    });
    
    // Close modal when clicking outside
    document.getElementById('subscribe-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSubscribeModal();
        }
    });
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

/**
 * Opens the subscribe modal
 */
function openSubscribeModal() {
    const modal = document.getElementById('subscribe-modal');
    modal.classList.add('active');
    
    // Reset form state
    document.getElementById('subscribe-form').reset();
    document.getElementById('success-message').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('submit-button').disabled = false;
}

/**
 * Closes the subscribe modal
 */
function closeSubscribeModal() {
    const modal = document.getElementById('subscribe-modal');
    modal.classList.remove('active');
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);