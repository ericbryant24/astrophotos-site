// Gallery data now lives in this repository (data/media.json) and the
// image files in media/. Previously these came from Azure Blob Storage.
const CONFIG = {
    dataUrl: 'data/media.json',
    mediaBase: 'media'
};

/**
 * Loads the list of media items for the gallery
 * @returns {Promise<Array>} - Array of media item objects
 */
async function fetchMediaItems() {
    const response = await fetch(CONFIG.dataUrl);
    if (!response.ok) {
        throw new Error(`Error fetching gallery data: ${response.status} ${response.statusText}`);
    }
    const entries = await response.json();
    const mediaItems = [];

    for (const entry of entries) {
        const file = entry.file;
        // Skip thumbnail files
        if (file.includes('_thumb.png')) continue;

        const isVideo = file.match(/\.(mp4|mov|avi|webm|ogg|wmv)$/i);
        const displayName = file.split('/').pop().split('.')[0].replace(/_/g, ' ');

        mediaItems.push({
            name: entry.name || file,
            url: `${CONFIG.mediaBase}/${encodeURIComponent(file)}`,
            description: entry.description || displayName,
            distance_ly: entry.distance_ly ? formatDistance(entry.distance_ly) : '',
            wikipedia_url: entry.wikipedia_url || '',
            erics_notes: entry.erics_notes || '',
            date: entry.date || '',
            tags: (entry.tags || '').split(',').map(tag => tag.trim()).filter(tag => tag),
            type: isVideo ? 'video' : 'photo',
            displayName: displayName
        });
    }

    return mediaItems;
}
