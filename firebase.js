// Firebase web configuration for Seratimas Enterprise.
// This config identifies the Firebase project; Firestore Security Rules
// and Firebase Authentication protect the actual data.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDvV69xLgixEvftB6LdyR2uErcj1ALfU8c',
  authDomain: 'seratimas-enterprise.firebaseapp.com',
  projectId: 'seratimas-enterprise',
  storageBucket: 'seratimas-enterprise.firebasestorage.app',
  messagingSenderId: '877326239900',
  appId: '1:877326239900:web:7d6beffc1fba4ac83a0559',
  measurementId: 'G-6ZC0LYYYTR'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
