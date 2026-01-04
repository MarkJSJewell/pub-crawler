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

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('user-email').textContent = user.email.split('@')[0];
        initializeApp();
    } else {
        window.location.href = 'login.html';
    }
});

function signOut() {
    firebase.auth().signOut().then(() => window.location.href = 'login.html');
}

async function initializeApp() {
    if (window.googleMapsLoaded) return;
    try {
        const user = firebase.auth().currentUser;
        const token = await user.getIdToken();
        const response = await fetch(`${BACKEND_URL}/get-api-key`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places,geometry&callback=initGoogleMapsCallback`;
        script.async = true;
        document.head.appendChild(script);
        
        document.getElementById('api-status').innerHTML = '<span style="color:#34a853;">✓ Connected</span>';
    } catch (e) {
        document.getElementById('api-status').innerHTML = '<span style="color:#ea4335;">⚠ Connection Failed</span>';
    }
}