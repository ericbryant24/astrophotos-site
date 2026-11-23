// Store gallery state
const galleryState = {
    items: [],
    currentSort: 'date'
};

/**
 * Sort gallery items based on criteria
 * @param {Array} items - Array of gallery items
 * @param {string} sortBy - Sort criteria ('date' or 'name')
 * @returns {Array} - Sorted array of items
 */
function sortGalleryItems(items, sortBy) {
    const sortedItems = [...items];
    
    if (sortBy === 'date') {
        // Sort by date descending (newest first)
        sortedItems.sort((a, b) => {
            // If dates are available, use them
            if (a.date && b.date) {
                return new Date(b.date) - new Date(a.date);
            }
            // Fallback to name
            return a.name.localeCompare(b.name);
        });
    } else if (sortBy === 'name') {
        // Sort alphabetically by name
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return sortedItems;
}

/**
 * Filter gallery items by tag
 * @param {string} tag - Tag to filter by
 */
function filterGalleryByTag(tag) {
    if (!tag) return;
    
    const gallery = document.getElementById('combined-gallery');
    const items = gallery.querySelectorAll('.gallery-item');
    let found = false;
    
    items.forEach(item => {
        const itemTags = item.getAttribute('data-tags');
        if (itemTags && itemTags.includes(tag)) {
            item.style.display = '';
            found = true;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show tag filter indicator
    showTagFilterIndicator(tag, found);
}

/**
 * Displays tag filter indicator above gallery
 * @param {string} tag - The active tag filter
 * @param {boolean} found - Whether any items matched the tag
 */
function showTagFilterIndicator(tag, found) {
    // Remove existing indicator if present
    const existingIndicator = document.getElementById('tag-filter-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create new indicator
    const indicator = document.createElement('div');
    indicator.id = 'tag-filter-indicator';
    indicator.className = 'tag-filter-indicator';
    
    if (found) {
        indicator.innerHTML = `
            <span>Filtered by tag: <span class="active-tag">${tag}</span></span>
            <button class="clear-filter-button" onclick="clearTagFilter()">Clear Filter</button>
        `;
    } else {
        indicator.innerHTML = `
            <span>No images found for tag: <span class="active-tag">${tag}</span></span>
            <button class="clear-filter-button" onclick="clearTagFilter()">Clear Filter</button>
        `;
    }
    
    // Insert indicator in container
    const container = document.getElementById('tag-filter-container');
    container.innerHTML = '';
    container.appendChild(indicator);
}

/**
 * Clears active tag filter
 */
function clearTagFilter() {
    // Update URL
    removeUrlParam('tag');
    
    // Show all items
    const gallery = document.getElementById('combined-gallery');
    const items = gallery.querySelectorAll('.gallery-item');
    items.forEach(item => {
        item.style.display = '';
    });
    
    // Remove indicator
    const container = document.getElementById('tag-filter-container');
    container.innerHTML = '';
}

/**
 * Renders gallery items to the DOM
 * @param {Array} mediaItems - Gallery items to render
 */
function renderGallery(mediaItems) {
    mediaItems = sortGalleryItems(mediaItems, galleryState.currentSort);
    const gallery = document.getElementById('combined-gallery');
    gallery.innerHTML = '';
    
    if (mediaItems.length === 0) {
        gallery.innerHTML = `
            <div class="error-message">
                No media items found in the storage container.
            </div>
        `;
        return;
    }

    // Store items in global state
    galleryState.items = mediaItems;
    window.galleryItems = mediaItems; // Keep for compatibility with existing code
    
    mediaItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'gallery-item';
        itemElement.setAttribute('data-type', item.type);
        itemElement.setAttribute('data-description', item.description);
        itemElement.setAttribute('data-tags', item.tags ? item.tags.join(',') : '');
        
        const mediaTypeIcon = item.type === 'photo' ? 
            createPhotoIcon() : 
            createVideoIcon();
        
        itemElement.innerHTML = `
            <div class="media-type">${mediaTypeIcon}</div>
            ${item.type === 'video' ? 
                createVideoPreview(item) : 
                `<img src="${item.url}" alt="${item.name}" loading="lazy">`
            }
            <div class="caption">${item.name}</div>
        `;
        
        gallery.appendChild(itemElement);
        
        // Open the lightbox on click
        itemElement.addEventListener('click', function() {
            openLightbox(item);
        });
    });
}

/**
 * Creates SVG icon for photo media type
 * @returns {string} - SVG HTML
 */
function createPhotoIcon() {
    return `<svg class="media-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
    </svg>`;
}

/**
 * Creates SVG icon for video media type
 * @returns {string} - SVG HTML
 */
function createVideoIcon() {
    return `<svg class="media-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"></polygon>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>`;
}

/**
 * Creates video preview HTML
 * @param {Object} item - Video item data
 * @returns {string} - HTML for video preview
 */
function createVideoPreview(item) {
    const thumbUrl = item.url.substring(0, item.url.lastIndexOf('.')) + '_thumb.png';
    
    return `<img src="${thumbUrl}" alt="${item.name}" loading="lazy">
        <div class="play-button-overlay">
            <svg class="play-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <polygon points="5,3 19,12 5,21" fill="currentColor"></polygon>
            </svg>
        </div>`;
}

/**
 * Sets up sort button event listeners
 */
function initSortButtons() {
    document.querySelectorAll('.sort-button').forEach(button => {
        button.addEventListener('click', function() {
            const sortBy = this.getAttribute('data-sort');
            
            // Update active button
            document.querySelectorAll('.sort-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update sort preference
            galleryState.currentSort = sortBy;
            
            // Re-sort and render gallery
            renderGallery(galleryState.items);
            
            // If we're currently filtering by tag, reapply the filter
            const tagFilter = getUrlParam('tag');
            if (tagFilter) {
                setTimeout(() => {
                    filterGalleryByTag(tagFilter);
                }, 100);
            }
        });
    });
}

/**
 * Filters gallery by tag then closes lightbox
 * @param {string} tag - Tag to filter by
 */
function filterByTag(tag) {
    setUrlParam('tag', tag);
    
    // Close lightbox first if open
    if (document.getElementById('lightbox').classList.contains('active')) {
        closeLightbox();
    }
    
    // Apply filter after a short delay
    setTimeout(() => {
        filterGalleryByTag(tag);
    }, 300);
}
