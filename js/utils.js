/**
 * Format a distance number with appropriate formatting based on its size
 * @param {string|number} num - The distance to format
 * @returns {string} - The formatted distance
 */
function formatDistance(num) {
    // Make sure we're working with a number
    num = Number(num);
    
    if (isNaN(num)) {
        return "Invalid number";
    }
    
    // Under 10 - 2 decimal precision
    if (Math.abs(num) < 10) {
        return num.toFixed(2);
    }
    
    // Under 1 Million - Add commas
    if (Math.abs(num) < 1000000) {
        return num.toLocaleString('en-US');
    }
    
    // Over 1 Million - round to nearest million and display as '35 Million'
    const millions = Math.round(num / 1000000);
    return `${millions} Million`;
}

/**
 * Gets URL query parameters
 * @param {string} name - Parameter name to get
 * @returns {string|null} - Parameter value or null if not found
 */
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Sets a URL parameter and updates browser history
 * @param {string} name - Parameter name
 * @param {string} value - Parameter value
 */
function setUrlParam(name, value) {
    const newUrl = new URL(window.location);
    newUrl.searchParams.set(name, value);
    window.history.pushState({}, '', newUrl);
}

/**
 * Removes a URL parameter and updates browser history
 * @param {string} name - Parameter name to remove
 */
function removeUrlParam(name) {
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete(name);
    window.history.pushState({}, '', newUrl);
}

function isMobile() {
    return window.innerWidth <= 768;
}