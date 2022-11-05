    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
    import { collection, doc, query, addDoc, getDocs, updateDoc, deleteDoc, onSnapshot, getDoc } from "firebase/firestore";

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
                sdp: offer.sdp,
            }
        }

        // room ID reference on database
        // addDoc = doc.set
        const roomRef = await addDoc(collection(db, 'rooms'), roomWithOffer);

        //const roomRef = await db.collection('rooms').add(roomWithOffer)

        const roomId = roomRef.id;
        document.querySelector('#currentRoom').innerText = `Current room is ${roomId} - You are the caller!`

        const snap = onSnapshot(doc(db, "rooms", roomId), async (doc) => {
            console.log("DOC:", doc)
            console.log("DOC.ANSWER", (doc._document.data.value.mapValue.fields.answer != null))
            console.log("PEER CONNECTION", peerConnection, !peerConnection.currentRemoteDescription)
            if (peerConnection.currentRemoteDescription && (doc._document.data.value.mapValue.fields.answer != null)) {
                console.log('Set remote description: ', doc._document.data.value.mapValue.fields.answer);
                console.log("someone has joined");
                //CONTINUE HERE
                //const rtcSessionDescription = new RTCSessionDescription(doc._document.data.value.mapValue.fields.answer.mapValue.fields)
                //await peerConnection.setRemoteDescription(rtcSessionDescription);
            }

            /* if (!peerConnection.currentRemoteDescription && doc && doc.answer) {
                console.log('Got remote description: ', doc.answer);
                const rtcSessionDescription = new RTCSessionDescription(doc.answer);
                await peerConnection.setRemoteDescription(rtcSessionDescription);
            } */

        }); 
    }

    export async function joinRoom() {
        roomId = document.querySelector('#room-id').value;
        console.log("test");
        console.log('Join room: ', roomId);
        //const roomRef = db.collection('rooms').doc(`${roomId}`);
        //const roomRef = await getDocs(collection(db, 'rooms'));

        async function runUpdate(roomWithAnswer) {
            const roomRef = doc(db, "rooms", roomId);
            await updateDoc(roomRef, roomWithAnswer);

            //KEEP CODE, USING TO TEST UPDATEDOC
            /* const q = query(collection(db, "rooms"))
            console.log("Q TEST" , q)
            const roomRef = await getDocs(q)
            roomRef.forEach(async (doc) => {
                if(doc.id === roomId) {
                    await updateDoc(doc, {"trollo":123});
                    const data123 = doc.data()
                    console.log("ROOMREF DATA OFFER", data123.offer);
                    console.log("ROOMREF DATA", JSON.stringify(data123));
                }
            }); */
        }

        const roomRef = doc(db, "rooms", roomId);
        const docSnap = await getDoc(roomRef);
        
        if(docSnap.exists()) {
            console.log('Got updated room:', typeof docSnap.data());
            const data = docSnap.data();
            console.log(data);
        
            console.log('Create PeerConnection with configuration: ', configuration);
            peerConnection = new RTCPeerConnection(configuration);
            registerPeerConnectionListeners();
        
            // Checks for changes in database when a callee has been added
            if (!peerConnection.currentRemoteDescription && docSnap.answer) {
                console.log('Set remote description: ', docSnap.answer);
                const answer = new RTCSessionDescription(docSnap.answer)
                await peerConnection.setRemoteDescription(answer);
            }
        
            const offer = docSnap.data().offer;
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            console.log(answer)
            await peerConnection.setLocalDescription(answer);
            
            // Joins a room by entering the correct ID
            const roomWithAnswer = {
                answer: {
                    type: answer.type,
                    sdp: answer.sdp
                }
            }
                
            //await roomRef.update(roomWithAnswer);
            runUpdate(roomWithAnswer);
        } else {
            console.log("LOLOL GET TROLLED")
        }
        
        
    }

    // PeerConnection instance
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