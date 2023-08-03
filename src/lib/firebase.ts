import { initializeApp } from 'firebase/app';
import { doc, getFirestore, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { derived, writable } from 'svelte/store';
import type { Readable } from 'svelte/motion';


const firebaseConfig = {
    apiKey: "AIzaSyAcg5Pr-trL5WeRcEZeXAwa0z6Ijq5ieuc",
    authDomain: "svelte-app-ae39b.firebaseapp.com",
    projectId: "svelte-app-ae39b",
    storageBucket: "svelte-app-ae39b.appspot.com",
    messagingSenderId: "777563578353",
    appId: "1:777563578353:web:d80011ec15d20617686e50",
    measurementId: "G-2W0LGZV820"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();


/**
 * @returns a store with the current firebase user
 */

function userStore() {

    let unsubscribe: () => void;

    const { subscribe } = writable(auth?.currentUser ?? null, (set) => {
        unsubscribe = onAuthStateChanged(auth, user => {
            set(user);
        });

        return () => unsubscribe;
    });

    return {
        subscribe
    };
}

export const user = userStore();

/**
 * @param  {string} path document path or reference
 * @returns a store with realtime updates on document data
 */

export function docStore<T>(path: string) {
    let unsubscribe: () => void;

    const docRef = doc(db, path);

    const { subscribe } = writable<T | null>(null, (set) => {
        unsubscribe = onSnapshot(docRef, (snapshot) => {
            set((snapshot.data() as T) ?? null);
        });

        return () => unsubscribe();
    });

    return {
        subscribe,
        ref: docRef,
        id: docRef.id
    };
}


interface UserData {
    username: string;
    bio: string;
    photoURL: string;
    links: any[];
}

export const userData: Readable<UserData | null> = derived(user, ($user, set) => {
    if ($user) {
        return docStore<UserData>(`users/${$user.uid}`).subscribe(set);
    } else {
        set(null);
    }
});