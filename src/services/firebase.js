import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider, signInWithPopup } from "firebase/auth";

// These will be populated from .env.local
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const githubProvider = app ? new GithubAuthProvider() : null;

if (githubProvider) {
    // Scope to allow reading/writing Gists
    githubProvider.addScope('gist');
} else {
    console.warn("Firebase credentials missing. Authentication features are disabled. Please configure .env.local");
}

export const loginWithGitHub = async () => {
    if (!auth || !githubProvider) {
        throw new Error("Cannot login: Firebase is not configured.");
    }
    try {
        const result = await signInWithPopup(auth, githubProvider);
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;

        return { user, token };
    } catch (error) {
        console.error("Error during GitHub login:", error);
        throw error;
    }
};

export const logout = () => {
    if (auth) return auth.signOut();
};
