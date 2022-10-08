import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, doc, query, addDoc, getDocs, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";

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
let app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
let db = getFirestore(app);

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

//------------------------------- webRTC stuff ---------------------------------------//

// Default configuration - Change these if you have a different STUN or TURN server.
const configuration = {
    iceServers: [
    {
        urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        ],
    },
    ],
    iceCandidatePoolSize: 10,
};

let peerConnection = new RTCPeerConnection(configuration);
let localStream = null;
let remoteStream = null;
let roomDialog = null;
let roomId = null;

export async function createRoom() {

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const roomWithOffer = {
        offer: {
            type: offer.type,
            sdp: offer.sdp
        }
    }
    const roomRef = await addDoc(collection(db, 'rooms'), roomWithOffer);

    //const roomRef = await db.collection('rooms').add(roomWithOffer)

    const roomId = roomRef.id;
    document.querySelector('#currentRoom').innerText = `Current room is ${roomId} - You are the caller!`
}

export async function joinRoom() {
    roomId = document.querySelector('#room-id').value;
    console.log("test");
    console.log('Join room: ', roomId);
    //const roomRef = db.collection('rooms').doc(`${roomId}`);
    //const roomRef = await getDocs(collection(db, 'rooms'));

    const unsub = onSnapshot(doc(db, "rooms", roomId), async (doc) => {
        console.log('Got updated room:', doc.data());
        const data = doc.data();
        console.log(data);

        console.log('Create PeerConnection with configuration: ', configuration);
        peerConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners();

        if (!peerConnection.currentRemoteDescription && data.answer) {
            console.log('Set remote description: ', data.answer);
            const answer = new RTCSessionDescription(data.answer)
            await peerConnection.setRemoteDescription(answer);
        }

        const offer = doc.data().offer;
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        console.log(answer)
        await peerConnection.setLocalDescription(answer);

        const roomWithAnswer = {
            answer: {
                type: answer.type,
                sdp: answer.sdp
            }
        }
        //await roomRef.update(roomWithAnswer);
    });

    /* roomRef.onSnapshot(async snapshot => {
        console.log('Got updated room:', snapshot.data());
        const data = snapshot.data();
        if (!peerConnection.currentRemoteDescription && data.answer) {
            console.log('Set remote description: ', data.answer);
            const answer = new RTCSessionDescription(data.answer)
            await peerConnection.setRemoteDescription(answer);
        }
    }); */
}

function registerPeerConnectionListeners() {
    peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log(
          `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });
  
    peerConnection.addEventListener('connectionstatechange', () => {
      console.log(`Connection state change: ${peerConnection.connectionState}`);
    });
  
    peerConnection.addEventListener('signalingstatechange', () => {
      console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });
  
    peerConnection.addEventListener('iceconnectionstatechange ', () => {
      console.log(
          `ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
  }