// API configuration
const CONFIG = {
    storageAccountName: 'astrophotos',
    containerName: 'media',
    baseUrl: 'https://astrophotos.blob.core.windows.net/media',
    subscribeApiUrl: 'https://astro-funcitons.azurewebsites.net/api/Subscribe'
};

/**
 * Get the SAS token for Azure Blob Storage (in this case, empty string since content is public)
 * @returns {Promise<string>} - SAS token
 */
async function getSasToken() {
    // In a real app, this would fetch a valid SAS token from a secure endpoint
    return '';
}

/**
 * Fetches the list of media files from Azure Blob Storage
 * @returns {Promise<Array>} - Array of media item objects
 */
async function fetchMediaItems() {
    try {
        const sasToken = await getSasToken();
        const url = `${CONFIG.baseUrl}?restype=container&comp=list&include=metadata${sasToken}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error fetching files: ${response.status} ${response.statusText}`);
        }
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        const blobs = xmlDoc.getElementsByTagName('Blob');
        const mediaItems = [];
        
        for (let i = 0; i < blobs.length; i++) {
            const nameElement = blobs[i].getElementsByTagName('Name')[0];
            if (!nameElement) continue;

            const name = nameElement.textContent;

            // Skip thumbnail files
            if (name.includes('_thumb.png')) continue;
            
            const url = `${CONFIG.baseUrl}/${name}${sasToken}`;
            
            // Extract metadata
            const metadata = extractMetadata(blobs[i]);
            
            // Determine file type
            const isVideo = name.match(/\.(mp4|mov|avi|webm|ogg|wmv)$/i);
            const type = isVideo ? 'video' : 'photo';
            
            // Create media item object
            mediaItems.push({
                name: metadata.name || name,
                url: url,
                description: metadata.description || name.split('/').pop().split('.')[0].replace(/_/g, ' '),
                distance_ly: metadata.distance_ly,
                wikipedia_url: metadata.wikipedia_url,
                erics_notes: metadata.erics_notes,
                date: metadata.date || '',
                tags: metadata.tags,
                type: type,
                displayName: name.split('/').pop().split('.')[0].replace(/_/g, ' ')
            });
        }
        
        return mediaItems;
    } catch (error) {
        console.error('Error listing blob files:', error);
        throw error;
    }
}

/**
 * Extracts metadata from a blob XML element
 * @param {Element} blobElement - XML blob element
 * @returns {Object} - Extracted metadata object
 */
function extractMetadata(blobElement) {
    const metadata = {
        name: '',
        description: '',
        distance_ly: '',
        wikipedia_url: '',
        erics_notes: '',
        date: '',
        tags: []
    };
    
    const metadataElement = blobElement.getElementsByTagName('Metadata')[0];
    
    if (metadataElement) {
        // Get name
        const nameElement = metadataElement.getElementsByTagName('name')[0];
        if (nameElement) {
            metadata.name = nameElement.textContent;
        }

        // Get description
        const descElement = metadataElement.getElementsByTagName('description')[0];
        if (descElement) {
            metadata.description = descElement.textContent;
        }
        
        // Get distance in light years
        const distanceElement = metadataElement.getElementsByTagName('distance_ly')[0];
        if (distanceElement) {
            metadata.distance_ly = formatDistance(distanceElement.textContent);
        }
        
        // Get Wikipedia URL
        const wikiElement = metadataElement.getElementsByTagName('wikipedia_url')[0];
        if (wikiElement) {
            metadata.wikipedia_url = wikiElement.textContent;
        }
        
        // Get Eric's Notes
        const ericsNotesElement = metadataElement.getElementsByTagName('erics_notes')[0];
        if (ericsNotesElement) {
            metadata.erics_notes = ericsNotesElement.textContent;
        }

        // Get date
        const dateElement = metadataElement.getElementsByTagName('date')[0];
        if (dateElement) {
            metadata.date = dateElement.textContent;
        }

        // Get tags
        const tagsElement = metadataElement.getElementsByTagName('tags')[0];
        if (tagsElement) {
            metadata.tags = tagsElement.textContent.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
    }
    
    return metadata;
}

/**
 * Submit subscription request to API
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Response object
 */
async function subscribeUser(email) {
    const response = await fetch(CONFIG.subscribeApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    });
    
    return {
        ok: response.ok,
        text: await response.text()
    };
}