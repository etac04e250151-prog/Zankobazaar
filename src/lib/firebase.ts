// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBwpHFMN5aHOmIHuFcCudy_nl6z8myo4Bg",
  authDomain: "zankobazaar-ff361.firebaseapp.com",
  projectId: "zankobazaar-ff361",
  storageBucket: "zankobazaar-ff361.firebasestorage.app",
  messagingSenderId: "138701281842",
  appId: "1:138701281842:web:485bfd4d755d307cb13a2b",
  measurementId: "G-1J1121Y10S"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Authentication
export const auth = getAuth(app);

// Cloud Firestore Database
export const db = getFirestore(app);

// Safe Analytics initialization
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (err) {
        // Analytics non-blocking
      }
    }
  }).catch(() => {
    // Ignore analytics unsupported warning
  });
}
