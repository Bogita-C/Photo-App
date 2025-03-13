import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB4sUsC3AC-kEgpp0TQQ8vT1WKYTvxvGGs",
  authDomain: "photo-app-e4422.firebaseapp.com",
  projectId: "photo-app-e4422",
  storageBucket: "photo-app-e4422.firebasestorage.app",
  messagingSenderId: "720351971228",
  appId: "1:720351971228:web:ff550e16e9593f27a52a59"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
