// auth.js

const firebaseConfig = {
    apiKey: "AIzaSyDllyjsS-uJ5ldC95xo8QQuyu9eNwm5i8U",
    authDomain: "pub-crawler-backend.firebaseapp.com",
    projectId: "pub-crawler-backend",
    storageBucket: "pub-crawler-backend.firebasestorage.app",
    messagingSenderId: "366467560298",
    appId: "1:366467560298:web:390fda941dabefe1d3eb13"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    
    // [CRITICAL] Check if appCheck exists before calling (prevents crash if script missing)
    if (firebase.appCheck) {
        const appCheck = firebase.appCheck();
        appCheck.activate('6Ld_OCgsAAAAAAgEbt4nOW6wuO0cJKI9bEo80fae', true);
        console.log('Firebase App Check initialized');
    } else {
        console.warn('Firebase App Check script not loaded - skipping initialization');
    }
} catch (e) {
    console.error('Firebase Initialization Error:', e);
}

const BACKEND_URL = 'https://pub-crawler-backend.vercel.app/api';

// Global Login Function
window.loginWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            console.log("Logged in:", result.user.email);
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Login Error:", error);
            alert("Login failed: " + error.message);
        });
};

window.signOut = function() {
    firebase.auth().signOut().then(() => window.location.href = 'login.html');
};

// Auth State Observer
firebase.auth().onAuthStateChanged((user) => {
    // Redirect logic
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (user) {
        if (isLoginPage) window.location.href = 'index.html';
        
        // If on index page, update UI
        const emailDisplay = document.getElementById('user-email');
        if (emailDisplay) emailDisplay.textContent = user.email.split('@')[0];
        
        const displayDiv = document.getElementById('user-display');
        if (displayDiv) displayDiv.style.display = 'block';

        if (typeof initializeApp === 'function') initializeApp();
    } else {
        if (!isLoginPage && !window.location.pathname.endsWith('/')) {
             window.location.href = 'login.html';
        }
    }
});

// Main App Init (Only runs on index.html)
async function initializeApp() {
    if (window.googleMapsLoaded) return;
    try {
        const user = firebase.auth().currentUser;
        if (!user) return; // Should be caught by auth observer, but safety first
        
        const token = await user.getIdToken();
        const response = await fetch(`${BACKEND_URL}/get-api-key`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places,geometry&callback=initGoogleMapsCallback`;
            script.async = true;
            document.head.appendChild(script);
        }
        
        const status = document.getElementById('api-status');
        if(status) status.innerHTML = '<span style="color:#34a853;">✓ Connected</span>';
    } catch (e) {
        console.error(e);
        const status = document.getElementById('api-status');
        if(status) status.innerHTML = '<span style="color:#ea4335;">⚠ Connection Error</span>';
    }
}