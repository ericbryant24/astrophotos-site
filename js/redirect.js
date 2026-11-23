/**
 * Handle URL redirections for preserving query parameters
 * This ensures old direct image links still work 
 */
function handleUrlRedirects() {
    // Check if we're on the index page and there's an image parameter
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        const urlParams = new URLSearchParams(window.location.search);
        const imageParam = urlParams.get('image');
        
        // If there's an image parameter, redirect to gallery with the parameters
        if (imageParam) {
            // Preserve all existing query parameters
            window.location.href = `gallery.html${window.location.search}`;
            return true; // Indicate a redirect is happening
        }
    }
    return false; // No redirect needed
}

// Run this before any other script executes
document.addEventListener('DOMContentLoaded', function() {
    // Only proceed with normal initialization if no redirect happened
    if (!handleUrlRedirects()) {
        // Place any other initialization code here that should run
        // only if no redirect is happening
    }
});