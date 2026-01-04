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
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase App Check
const appCheck = firebase.appCheck();
appCheck.activate(
    '6Ld_OCgsAAAAAAgEbt4nOW6wuO0cJKI9bEo80fae', 
    true 
);

console.log('Firebase App Check initialized');
const BACKEND_URL = 'https://pub-crawler-backend.vercel.app/api';

// [NEW] Google Login Function
function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            console.log("Logged in with Google:", result.user.email);
            // App state updates handled by onAuthStateChanged
        }).catch((error) => {
            console.error("Login failed:", error.message);
            alert("Login failed: " + error.message);
        });
}

// Check authentication state
firebase.auth().onAuthStateChanged((user) => {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const emailSpan = document.getElementById('user-email');

    if (user) {
        console.log('Logged in as:', user.email);
        if (emailSpan) emailSpan.textContent = user.email.split('@')[0];
        
        // Show Logout, Hide Login
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        
        initializeApp();
    } else {
        console.log('Not logged in');
        if (emailSpan) emailSpan.textContent = '';
        
        // Show Login, Hide Logout
        if (loginBtn) loginBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        
        // Only redirect if explicitly on a protected page (optional logic)
        // window.location.href = 'login.html'; 
    }
});

function signOut() {
    firebase.auth().signOut().then(() => {
        console.log('Signed out');
        window.location.reload();
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}

async function initializeApp() {
    console.log('App initialized with authenticated user');
    if (window.googleMapsLoaded) return;
    try { await fetchApiKeyAndInitialize(); } 
    catch (error) { console.error('Error:', error); }
}

async function fetchApiKeyAndInitialize() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('User not authenticated');
        const token = await user.getIdToken();
        
        const response = await fetch(`${BACKEND_URL}/get-api-key`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error(`Failed to fetch API key`);
        const data = await response.json();
        if (!data.apiKey) throw new Error('No API key received');
        
        await loadGoogleMaps(data.apiKey);
        
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function loadGoogleMaps(apiKey) {
    return new Promise((resolve, reject) => {
        // Callback is already defined in index.html, we just point to it
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMapsCallback`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
    });
}