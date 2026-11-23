/* featured-tags.js - Complete Solution */

// Debug function to help with troubleshooting
function debug(message) {
    console.log(`[Featured Tags] ${message}`);
}

// Add event listeners to the buttons
function setupFeaturedTagEvents() {
    debug('Setting up featured tag button events...');
    
    try {
        document.querySelectorAll('.featured-tag-button').forEach(button => {
            button.addEventListener('click', function() {
                debug(`Button clicked: ${this.getAttribute('data-tag')}`);
                const tag = this.getAttribute('data-tag');
                
                // If already active, clear the filter
                if (this.classList.contains('active')) {
                    debug('Clearing active filter');
                    clearTagFilter();
                    document.querySelectorAll('.featured-tag-button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                } else {
                    // Remove active class from all buttons
                    document.querySelectorAll('.featured-tag-button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Apply filter
                    debug(`Filtering by tag: ${tag}`);
                    filterGalleryByTag(tag);
                    setUrlParam('tag', tag);
                }
            });
        });
        debug('Events set up successfully');
    } catch (error) {
        console.error('[Featured Tags] Error setting up events:', error);
    }
}

// Update button states when tag filter changes
function updateFeaturedTagButtonStates(tag) {
    debug(`Updating button states for tag: ${tag || 'none'}`);
    
    try {
        if (!tag) {
            // Clear all active states
            document.querySelectorAll('.featured-tag-button').forEach(btn => {
                btn.classList.remove('active');
            });
            return;
        }
        
        // Clear all active states first
        document.querySelectorAll('.featured-tag-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Find and activate the matching button
        const matchingButton = document.querySelector(`.featured-tag-button[data-tag="${tag}"]`);
        if (matchingButton) {
            matchingButton.classList.add('active');
            debug(`Activated button for tag: ${tag}`);
        } else {
            debug(`No matching button found for tag: ${tag}`);
        }
    } catch (error) {
        console.error('[Featured Tags] Error updating button states:', error);
    }
}

// Initialize everything on page load
function initFeaturedTags() {
    debug('Initializing featured tags...');
    
    // Add the CSS if it hasn't been added directly
    if (!document.querySelector('link[href*="featured-tags.css"]')) {
        debug('Adding CSS dynamically');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/featured-tags.css';
        document.head.appendChild(link);
    }
    
    // Set up event handlers
    setupFeaturedTagEvents();
    
    // Handle URL parameter
    const tagParam = getUrlParam('tag');
    if (tagParam) {
        debug(`Found tag parameter in URL: ${tagParam}`);
        updateFeaturedTagButtonStates(tagParam);
    }

    // Extend filter functions to update button states
    try {
        // Original show tag filter indicator function
        if (typeof showTagFilterIndicator === 'function') {
            debug('Extending showTagFilterIndicator function');
            const originalShowTagFilterIndicator = showTagFilterIndicator;
            window.showTagFilterIndicator = function(tag, found) {
                // Call the original function
                originalShowTagFilterIndicator(tag, found);
                
                // Update button states
                updateFeaturedTagButtonStates(tag);
            };
        } else {
            debug('showTagFilterIndicator function not found, cannot extend');
        }
        
        // Original clear tag filter function
        if (typeof clearTagFilter === 'function') {
            debug('Extending clearTagFilter function');
            const originalClearTagFilter = clearTagFilter;
            window.clearTagFilter = function() {
                // Call the original function
                originalClearTagFilter();
                
                // Update button states
                updateFeaturedTagButtonStates(null);
            };
        } else {
            debug('clearTagFilter function not found, cannot extend');
        }
    } catch (error) {
        console.error('[Featured Tags] Error extending filter functions:', error);
    }
    
    debug('Initialization complete');
}

// Run once DOM is loaded
if (document.readyState === 'loading') {
    debug('Document still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', function() {
        debug('DOMContentLoaded fired');
        
        // Wait a brief moment to ensure other scripts have run
        setTimeout(initFeaturedTags, 100);
    });
} else {
    debug('Document already loaded, running init directly');
    
    // Wait a brief moment to ensure other scripts have run
    setTimeout(initFeaturedTags, 100);
}

// Force-add the buttons directly after waiting for the page to load fully
// setTimeout(function() {
//     console.log('[Featured Tags] Applying emergency fix...');
    
//     // Find the featured tags buttons container
//     const container = document.querySelector('.featured-tags-buttons');
    
//     if (container) {
//         console.log('[Featured Tags] Found buttons container, forcing button insertion');
        
//         // Clear any existing content
//         container.innerHTML = '';
        
//         // Add each button directly
//         FEATURED_TAGS.forEach(tagInfo => {
//             const customClass = tagInfo.customClass ? ` ${tagInfo.customClass}` : '';
            
//             const buttonHTML = `
//                 <button class="featured-tag-button${customClass}" data-tag="${tagInfo.tag}">
//                     ${tagInfo.icon}
//                     ${tagInfo.tag}
//                 </button>
//             `;
            
//             container.insertAdjacentHTML('beforeend', buttonHTML);
//         });
        
//         // Re-setup the event handlers
//         setupFeaturedTagEvents();
//         console.log('[Featured Tags] Emergency fix applied');
//     } else {
//         console.log('[Featured Tags] Buttons container not found for emergency fix');
//     }
// }, 1000); // Wait 1 second to make sure everything is fully loaded