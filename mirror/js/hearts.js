/**
 * Hearts functionality for astrophotography gallery
 * Uses Azure Storage Tables to store heart data
 */

// Hearts state management
const heartsState = {
    // Map of image names to heart counts
    counts: {},
    // Set of image names that the current user has hearted
    userHearts: new Set()
};

// Get a unique user ID or generate one if not exists
function getUserId() {
    let userId = localStorage.getItem('astrophoto_user_id');
    
    if (!userId) {
        // Generate a random user ID if none exists
        userId = 'user_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('astrophoto_user_id', userId);
    }
    
    return userId;
}

/**
 * Initialize the hearts system
 */
async function initHearts() {
    // Load heart data from Azure
    await loadHeartData();
    
    // Add heart count to all gallery items
    updateGalleryHeartCounts();
    
    // Set up event delegation for heart buttons in gallery
    document.getElementById('combined-gallery').addEventListener('click', function(e) {
        // Find closest heart button if one was clicked
        const heartButton = e.target.closest('.heart-button');
        if (heartButton) {
            e.preventDefault();
            e.stopPropagation();
            
            const imageName = heartButton.getAttribute('data-image');
            toggleHeart(imageName);
        }
    });}

/**
 * Load heart data from Azure Tables
 */
async function loadHeartData() {
    try {
        // Get all heart records from Azure
        const response = await fetch('https://astro-funcitons.azurewebsites.net/api/Hearts', {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching heart data: ${response.status} ${response.statusText}`);
        }
        
        const heartData = await response.json();
        
        // Process the heart data
        processHeartData(heartData);
        
    } catch (error) {
        console.error('Error loading heart data from Azure:', error);
    }
}

/**
 * Process heart data from API response
 * @param {Array} heartData - Array of heart records from Azure
 */
function processHeartData(heartData) {
    // Reset counts
    heartsState.counts = {};
    heartsState.userHearts.clear();
    
    const userId = getUserId();
    
    // Process each heart record
    heartData.forEach(record => {
        const imageName = record.imageName;
        
        // Initialize count if not exists
        if (!heartsState.counts[imageName]) {
            heartsState.counts[imageName] = 0;
        }
        
        // Increment count
        heartsState.counts[imageName]++;
        
        // Check if this heart belongs to the current user
        if (record.userId === userId) {
            heartsState.userHearts.add(imageName);
        }
    });
    
    // Initialize count for all gallery items not in the heart data
    if (galleryState && galleryState.items) {
        galleryState.items.forEach(item => {
            if (!heartsState.counts[item.name]) {
                heartsState.counts[item.name] = 0;
            }
        });
    }
}

/**
 * Update gallery heart counts
 */
function updateGalleryHeartCounts() {
    // Update UI with heart counts
    updateHeartUI();
}

/**
 * Update all heart UI elements
 */
function updateHeartUI() {
    // Update gallery heart buttons
    document.querySelectorAll('.heart-button').forEach(button => {
        const imageName = button.getAttribute('data-image');
        const heartCount = heartsState.counts[imageName] || 0;
        const isHearted = heartsState.userHearts.has(imageName);
        
        // Update count
        const countElement = button.querySelector('.heart-count');
        if (countElement) {
            countElement.textContent = heartCount;
        }
        
        // Update button appearance
        button.classList.toggle('hearted', isHearted);
        
        // Update icon
        const icon = button.querySelector('.heart-icon');
        if (icon) {
            icon.innerHTML = isHearted ? 
                createHeartFilledIcon() : 
                createHeartOutlineIcon();
        }
    });
    
    // Update lightbox heart button if the lightbox is open
    const lightbox = document.getElementById('lightbox');
    if (lightbox.classList.contains('active')) {
        const currentImage = galleryState.items[lightboxState.currentImageIndex];
        if (currentImage) {
            const lightboxHeartButton = document.getElementById('lightbox-heart-button');
            if (lightboxHeartButton) {
                const imageName = currentImage.name;
                const heartCount = heartsState.counts[imageName] || 0;
                const isHearted = heartsState.userHearts.has(imageName);
                
                // Update count
                const countElement = lightboxHeartButton.querySelector('.heart-count');
                if (countElement) {
                    countElement.textContent = heartCount;
                }
                
                // Update button appearance
                lightboxHeartButton.classList.toggle('hearted', isHearted);
                
                // Update icon
                const icon = lightboxHeartButton.querySelector('.heart-icon');
                if (icon) {
                    icon.innerHTML = isHearted ? 
                        createHeartFilledIcon() : 
                        createHeartOutlineIcon();
                }
            }
        }
    }
}

/**
 * Toggle heart status for an image
 * @param {string} imageName - Name of the image to toggle heart for
 */
async function toggleHeart(imageName) {
    if (!imageName) return;
    
    const userId = getUserId();
    const isCurrentlyHearted = heartsState.userHearts.has(imageName);
    
    try {
        if (isCurrentlyHearted) {
            // Remove heart
            const response = await fetch('https://astro-funcitons.azurewebsites.net/api/Hearts', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    imageName: imageName
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error removing heart: ${response.status} ${response.statusText}`);
            }
            
            // Update local state
            heartsState.userHearts.delete(imageName);
            heartsState.counts[imageName] = Math.max(0, (heartsState.counts[imageName] || 0) - 1);
            
        } else {
            // Add heart
            const response = await fetch('https://astro-funcitons.azurewebsites.net/api/Hearts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    imageName: imageName,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error adding heart: ${response.status} ${response.statusText}`);
            }
            
            // Update local state
            heartsState.userHearts.add(imageName);
            heartsState.counts[imageName] = (heartsState.counts[imageName] || 0) + 1;
        }
        
        // Update UI
        updateHeartUI();
        
    } catch (error) {
        console.error('Error toggling heart:', error);
        alert('There was an error updating your heart. Please try again.');
    }
}

/**
 * Creates heart outline icon SVG
 * @returns {string} - Heart outline icon SVG
 */
function createHeartOutlineIcon() {
    return `<svg class="heart-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>`;
}

/**
 * Creates filled heart icon SVG
 * @returns {string} - Filled heart icon SVG
 */
function createHeartFilledIcon() {
    return `<svg class="heart-icon-svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>`;
}

// Function to add heart button to lightbox
function addHeartButtonToLightbox(item) {
    const heartCount = heartsState.counts[item.name] || 0;
    const isHearted = heartsState.userHearts.has(item.name);
    
    const heartButtonHTML = `
        <div id="lightbox-heart-button" class="lightbox-heart-button ${isHearted ? 'hearted' : ''}" data-image="${item.name}">
            <div class="heart-icon">
                ${isHearted ? createHeartFilledIcon() : createHeartOutlineIcon()}
            </div>
            <span class="heart-count">${heartCount}</span>
        </div>
    `;
    
    // Add the heart button to the lightbox
    document.querySelector('.lightbox-content').insertAdjacentHTML('beforeend', heartButtonHTML);
    
    // Add click handler
    document.getElementById('lightbox-heart-button').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const imageName = this.getAttribute('data-image');
        toggleHeart(imageName);
    });
}
