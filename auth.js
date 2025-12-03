// auth.js - Firebase Authentication Module
// Add this to your existing pub crawler app

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
        // User not logged in, redirect to login
        console.log('Not authenticated, redirecting to login...');
        window.location.href = 'login.html';
    } else if (user && isLoginPage) {
        // User is logged in but on login page, redirect to app
        console.log('Already authenticated, redirecting to app...');
        window.location.href = 'index.html';
    } else if (user) {
        // User is logged in
        console.log('Logged in as:', user.email);
        initializeApp();
    }
});

// Get Firebase auth token for API calls
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

// API Helper Functions

// Search for places near a location
async function searchPlaces(latitude, longitude, radius, type, keyword) {
    try {
        const token = await getAuthToken();
        
        const response = await fetch(`${BACKEND_URL}/search-places`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                location: `${latitude},${longitude}`,
                radius: radius,
                type: type,
                keyword: keyword
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Search places error:', error);
        throw error;
    }
}

// Get place details
async function getPlaceDetails(placeId) {
    try {
        const token = await getAuthToken();
        
        const response = await fetch(`${BACKEND_URL}/place-details`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                place_id: placeId
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Get place details error:', error);
        throw error;
    }
}

// Get directions between places
async function getDirections(origin, destination, waypoints = null, mode = 'walking') {
    try {
        const token = await getAuthToken();
        
        const body = {
            origin: origin,
            destination: destination,
            mode: mode
        };

        if (waypoints) {
            body.waypoints = waypoints;
        }
        
        const response = await fetch(`${BACKEND_URL}/directions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Get directions error:', error);
        throw error;
    }
}

// Initialize app after authentication
function initializeApp() {
    // This function should be called when user is authenticated
    // Add your existing app initialization code here
    console.log('App initialized with authenticated user');
}
