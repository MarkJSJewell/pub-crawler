// auth.js

// Initialize Firebase App
firebase.initializeApp(firebaseConfig);

// [FIXED] Initialize Firebase App Check for Compat v10
const appCheck = firebase.appCheck();
appCheck.activate(
    '6Ld_OCgsAAAAAAgEbt4nOW6wuO0cJKI9bEo80fae', 
    true // Enable automatic token refresh
);
console.log('Firebase App Check initialized');

// Initialize the 2025 Places Autocomplete
function initializeAutocomplete() {
    const autocompleteElement = document.getElementById('location-autocomplete');
    if (!autocompleteElement) return;

    // Listener for the new 'gmp-select' event
    autocompleteElement.addEventListener('gmp-select', async (event) => {
        const place = event.detail.place;
        if (!place) return;

        // Fetch required fields for the new Places API
        await place.fetchFields({ fields: ['location', 'displayName', 'formattedAddress'] });
        
        // Store globally to use in your search logic
        window.selectedLocationCoords = place.location;
        console.log('✓ Location selected:', place.displayName);
    });
}

// Check authentication state
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        initializeApp();
    } else {
        window.location.href = 'login.html';
    }
});

// Load Google Maps and trigger initialization
async function fetchApiKeyAndInitialize() {
    // ... existing token fetch logic ...
    const data = await response.json();
    
    // Add 'places' library and ensure 'loading=async' for new features
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places,geometry&loading=async&callback=initGoogleMapsCallback`;
    script.async = true;
    document.head.appendChild(script);
}

window.initGoogleMapsCallback = function() {
    window.googleMapsLoaded = true;
    initializeGoogleMaps(); 
    initializeAutocomplete(); // Trigger the new autocomplete setup
};