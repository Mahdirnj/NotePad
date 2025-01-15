import { auth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    const signupForm = document.getElementById('signup-form');
    const googleSignUpBtn = document.getElementById('google-signup');

    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.classList.add(currentTheme + '-theme');
    themeSwitch.checked = currentTheme === 'dark';

    // Theme toggle functionality
    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // Signup form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (!validatePassword(password)) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up
                const user = userCredential.user;
                console.log('User signed up:', user);
                // You might want to update the user's display name here
                window.location.href = 'notes.html';
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Signup error:', errorCode, errorMessage);
                alert('Signup failed. Please try again.');
            });
    });

    // Google Sign-Up
    googleSignUpBtn.addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                console.log('User signed up with Google:', user);
                window.location.href = 'notes.html';
            }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Google Sign-Up error:', errorCode, errorMessage);
            alert('Google Sign-Up failed. Please try again.');
        });
    });
});

function validatePassword(password) {
    return password.length >= 8;
}

