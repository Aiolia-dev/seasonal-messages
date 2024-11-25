import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD-4ZFKqnG5rvoYF57AhkEOMxrKM0Cz0D4",
  authDomain: "seasons-test-cf01e.firebaseapp.com",
  projectId: "seasons-test-cf01e",
  storageBucket: "seasons-test-cf01e.firebasestorage.app",
  messagingSenderId: "261898509017",
  appId: "1:261898509017:web:577b5bb3b982299a0fbcc8",
  measurementId: "G-YYWZS4SELE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Enable persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting persistence:', error);
});

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
