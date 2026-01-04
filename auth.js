// auth.js
const firebaseConfig = {
    apiKey: "AIzaSyDllyjsS-uJ5ldC95xo8QQuyu9eNwm5i8U",
    authDomain: "pub-crawler-backend.firebaseapp.com",
    projectId: "pub-crawler-backend",
    storageBucket: "pub-crawler-backend.firebasestorage.app",
    messagingSenderId: "366467560298",
    appId: "1:366467560298:web:390fda941dabefe1d3eb13"
};

firebase.initializeApp(firebaseConfig);
const appCheck = firebase.appCheck();
appCheck.activate('6Ld_OCgsAAAAAAgEbt4nOW6wuO0cJKI9bEo80fae', true);

const BACKEND_URL = 'https://pub-crawler-backend.vercel.app/api';

// [ADDED] Global Google Login function for login.html
window.loginWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            // Successful login, redirect to app
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error(error);
            alert("Login failed: " + error.message);
        });
};

window.signOut = function() {
    firebase.auth().signOut().then(() => window.location.href = 'login.html');
};

// Check Auth State
firebase.auth().onAuthStateChanged((user) => {
    // If we are on the login page and logged in, redirect to index
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
    // If we are on index page
    if (!window.location.pathname.includes('login.html')) {
        if (user) {
            const display = document.getElementById('user-display');
            if(display) {
                display.style.display = 'block';
                document.getElementById('user-email').textContent = user.email.split('@')[0];
            }
            initializeApp();
        } else {
            window.location.href = 'login.html';
        }
    }
});

async function initializeApp() {
    if (window.googleMapsLoaded) return;
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not authenticated');
        const token = await user.getIdToken();
        const response = await fetch(`${BACKEND_URL}/get-api-key`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places,geometry&callback=initGoogleMapsCallback`;
        script.async = true;
        document.head.appendChild(script);
        
        const status = document.getElementById('api-status');
        if(status) status.innerHTML = '<span style="color:#34a853;">✓ Connected</span>';
    } catch (e) {
        console.error(e);
        const status = document.getElementById('api-status');
        if(status) status.innerHTML = '<span style="color:#ea4335;">⚠ Error</span>';
    }
}