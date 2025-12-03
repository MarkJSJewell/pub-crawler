// auth.js - Firebase Authentication Module

// Firebase Configuration
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

// Netlify Backend URL
const BACKEND_URL = 'https://charming-puppy-e4d8d0.netlify.app/.netlify/functions';

// Check authentication on page load
firebase.auth().onAuthStateChanged((user) => {
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!user && !isLoginPage) {
        console.log('Not authenticated, redirecting to login...');
        window.location.href = 'login.html';
    } else if (user && isLoginPage) {
        console.log('Already authenticated, redirecting to app...');
        window.location.href = 'index.html';
    } else if (user) {
        console.log('Logged in as:', user.email);
        initializeApp();
    }
});

// Get Firebase auth token
async function getAuthToken() {
    const user = firebase.auth().currentUser;
    if (!user) {
        throw new Error('User not authenticated');
    }
    return await user.getIdToken();
}

// Sign out function
function signOut() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}

// Initialize app - FETCH API KEY FROM BACKEND
async function initializeApp() {
    console.log('App initialized with authenticated user');
    const user = firebase.auth().currentUser;
    if (user) {
        // Show user email
        const emailSpan = document.getElementById('user-email');
        if (emailSpan) {
            emailSpan.textContent = user.email;
        }
        
        // Fetch API key and initialize
        await fetchApiKeyAndInitialize();
    }
}

// Fetch API key from backend
async function fetchApiKeyAndInitialize() {
    const statusDiv = document.getElementById('api-status');
    
    try {
        if (statusDiv) {
            statusDiv.className = '';
            statusDiv.style.display = 'block';
            statusDiv.textContent = 'Connecting to Google Maps...';
        }
        
        const token = await getAuthToken();
        
        console.log('Fetching API key from backend...');
        const response = await fetch(`${BACKEND_URL}/get-api-key`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get API key: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.apiKey) {
            throw new Error('No API key returned from backend');
        }

        console.log('✓ API key received from backend');
        
        // Store globally
        window.apiKey = data.apiKey;
        
        // Load Google Maps
        await loadGoogleMaps(data.apiKey);
        
        if (statusDiv) {
            statusDiv.className = 'success';
            statusDiv.textContent = '✓ Google Maps connected! You can now search for pubs.';
        }
        
    } catch (error) {
        console.error('Error:', error);
        if (statusDiv) {
            statusDiv.className = 'error';
            statusDiv.textContent = '✗ Failed to connect: ' + error.message;
        }
    }
}

// Load Google Maps
function loadGoogleMaps(apiKey) {
    return new Promise((resolve, reject) => {
        console.log('Loading Google Maps API...');
        
        window.initGoogleMapsCallback = function() {
            console.log('Google Maps loaded');
            window.googleMapsLoaded = true;
            if (typeof initializeGoogleMaps === 'function') {
                initializeGoogleMaps();
            }
            resolve();
        };
        
        window.gm_authFailure = function() {
            reject(new Error('Google Maps authentication failed'));
        };
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMapsCallback`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
    });
}