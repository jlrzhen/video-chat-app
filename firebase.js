import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, doc, query, addDoc, getDocs, updateDoc, deleteDoc } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MSG_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export async function addData() {
    try {
    const docRef = await addDoc(collection(db, "users"), {
        first: "Ada",
        last: "Lovelace",
        born: 1815
    });
    console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }

    try {
    const docRef = await addDoc(collection(db, "users"), {
        first: "Alan",
        middle: "Mathison",
        last: "Turing",
        born: 1912
    });
    console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }

    const userSnapshot = await getDocs(collection(db, "users"));
    userSnapshot.forEach((doc) => {
    console.log(doc.data());
    });
}

export async function readData() {
    const q = query(collection(db, "users"))
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty){
        console.log("No entries to be read")
    }

    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });
}

export async function updateData() {
    const q = query(collection(db, "users"))
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty){
        console.log("No entries to be updated")
    } else {
        querySnapshot.forEach((doc) => {
            runUpdate(doc.id)
        });
        console.log("Data has been updated")
    }

    async function runUpdate(id) {
        const docRef = doc(db, "users", id);
        await updateDoc(docRef, {last: "Tesla"});
    }
}

export async function deleteData() {

    const q = query(collection(db, "users"))
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty){
        console.log("No entries to be deleted")
    }

    querySnapshot.forEach((doc) => {
        runDelete(doc.id);
    });

    async function runDelete(id) {
        await deleteDoc(doc(db, "users", id));
        console.log("Delete sub document of: ", id);
    }
}