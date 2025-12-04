// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDllyjsS-uJ5ldC95xo8QQuyu9eNwm5i8U",
    authDomain: "pub-crawler-backend.firebaseapp.com",
    projectId: "pub-crawler-backend",
    storageBucket: "pub-crawler-backend.firebasestorage.app",
    messagingSenderId: "366467560298",
    appId: "1:366467560298:web:390fda941dabefe1d3eb13",
    measurementId: "G-JV1KV04E9F"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Backend URL for serverless functions
const BACKEND_URL = 'https://pub-crawler-backend.vercel.app/api';

console.log('Script starting...');

// Check authentication state
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('Logged in as:', user.email);
        
        // Extract username (part before @)
        const username = user.email.split('@')[0];
        const userEmailElement = document.getElementById('user-email');
        if (userEmailElement) {
            userEmailElement.textContent = username;
        }
        
        // Initialize the app with the authenticated user
        initializeApp();
    } else {
        // Not logged in, redirect to login page
        console.log('Not logged in, redirecting...');
        window.location.href = 'login.html';
    }
});

function signOut() {
    firebase.auth().signOut().then(() => {
        console.log('Signed out successfully');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}

// Initialize the app after authentication
async function initializeApp() {
    console.log('App initialized with authenticated user');
    
    // Check if Google Maps is already loaded
    if (window.googleMapsLoaded) {
        console.log('Google Maps already loaded');
        return;
    }
    
    try {
        // Fetch API key from backend
        await fetchApiKeyAndInitialize();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('api-status').innerHTML = 
            '<span style="color: #ea4335;">⚠ Failed to connect. Please refresh the page.</span>';
    }
}

async function fetchApiKeyAndInitialize() {
    try {
        console.log('Fetching API key from backend...');
        
        // Get Firebase auth token
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }
        const token = await user.getIdToken();
        
        // Fetch API key from backend
        const response = await fetch(`${BACKEND_URL}/get-api-key`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch API key: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.apiKey) {
            throw new Error('No API key received from backend');
        }
        
        console.log('✓ API key received from backend');
        
        // Load Google Maps with the API key
        await loadGoogleMaps(data.apiKey);
        
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function loadGoogleMaps(apiKey) {
    return new Promise((resolve, reject) => {
        console.log('Loading Google Maps API...');
        
        // Create callback function
        window.initGoogleMapsCallback = function() {
            console.log('Google Maps loaded');
            window.googleMapsLoaded = true;
            
            // Initialize Google Maps services (geocoder, directions, etc.)
            if (typeof initializeGoogleMaps === 'function') {
                initializeGoogleMaps();
            }
            
            document.getElementById('api-status').innerHTML = 
                '<span style="color: #34a853;">✓ Google Maps connected!</span>';
            resolve();
        };
        
        // Create script tag
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMapsCallback`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        
        document.head.appendChild(script);
    });
}
