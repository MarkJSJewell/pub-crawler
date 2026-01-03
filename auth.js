/* auth.js - Integrated with Geoapify and Caching */

const GEOAPIFY_KEY = "d03bb74f01814b35968d70860130b3fc"; // Get this from geoapify.com

function initializeAutocomplete() {
    const autocomplete = new autocomplete.GeocoderAutocomplete(
        document.getElementById("autocomplete-container"), 
        GEOAPIFY_KEY, 
        { 
            placeholder: "Enter a location",
            skipIcons: true,
            allowNonVerifiedStreet: true 
        }
    );

    autocomplete.on('select', (location) => {
        if (location) {
            // Set the hidden or global location value for the search form
            window.selectedLocation = location.properties.formatted;
            console.log('Location selected via Geoapify:', window.selectedLocation);
        }
    });
}

// Check authentication state
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Initialize the app and Autocomplete
        initializeApp();
        initializeAutocomplete();
    } else {
        window.location.href = 'login.html';
    }
});

/**
 * CACHING UTILITY
 * Call this before your API fetches to reduce redundant requests.
 */
function getFromCache(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    const now = new Date();
    
    // Check if cache is older than 24 hours
    if (now.getTime() > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    return parsed.value;
}

function setInCache(key, value, ttlSeconds = 86400) {
    const now = new Date();
    const item = {
        value: value,
        expiry: now.getTime() + (ttlSeconds * 1000),
    };
    localStorage.setItem(key, JSON.stringify(item));
}