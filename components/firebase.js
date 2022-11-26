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

    let peerConnection1 = new RTCPeerConnection(configuration);
    let peerConnection2 = new RTCPeerConnection(configuration);
    let localStream = await navigator.mediaDevices.getUserMedia(
        {video: true, audio: true});;
    let remoteStream1 = null;
    let remoteStream2 = null;
    let roomDialog = null;
    let roomId = null;

    export async function createRoom() {
        openUserMedia();
        registerPeerConnectionListeners();

        localStream.getTracks().forEach(track => {
            peerConnection1.addTrack(track, localStream);
        });

        console.log("set LOCAL description CREATE room start");
        console.log("set LOCAL description CREATE room end");
        console.log("set LOCAL description CREATE room state is ", peerConnection1.signalingState);

        const candidatesCollection = collection(db, 'callerCandidates');
        console.log("icecandidate ")
        //peerConnection1.onicecandidate = (event) => {
        peerConnection1.addEventListener('icecandidate', event => {
            console.log("icecandidate eventListener triggered")
            if (event.candidate) {
                const json = event.candidate.toJSON();
                //candidatesCollection.add(json);
                console.log("added: ", json)
                addDoc(candidatesCollection, json);
            }
        });

        peerConnection1.addEventListener('track', event => {
            console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
              console.log('Add a track to the remoteStream:', track);
              remoteStream1.addTrack(track);
            });
          });
        
        const offer = await peerConnection1.createOffer();
        await peerConnection1.setLocalDescription(offer);
    
        /* roomRef.collection('rooms').onSnapshot(snapshot => {
            onSnapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    peerConneciton.addIceCandidate(candidate);
                }
            });
        }) */

        // creates room offer 
        const roomWithOffer = {
            'offer': {
                type: offer.type,
                sdp: offer.sdp,
            }
        }

        // room ID reference on database
        // addDoc = doc.set
        const roomRef = await addDoc(collection(db, 'rooms'), roomWithOffer);
        //const roomRef = await db.collection('rooms').add(roomWithOffer)

        roomId = roomRef.id;
        document.querySelector('#currentRoom').innerText = `Current room is ${roomId} - You are the caller!`;
        async function test() {
            const roomRef = doc(db, "rooms", roomId);
            const docSnap = await getDoc(roomRef);
            return docSnap.data()
        }
        console.log("1 CREATE ROOM STATE IS ", peerConnection1.signalingState, test());
        
        peerConnection1.addEventListener('track', event => {
            console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
              console.log('Add a track to the remoteStream:', track);
              remoteStream.addTrack(track);
            });
          });

        const snap = onSnapshot(doc(db, "rooms", roomId), async (doc) => {
            console.log("2 CREATE ROOM STATE IS ", peerConnection1.signalingState, doc);
            console.log("DOC:", doc);
            console.log("DOC.ANSWER", (doc._document.data.value.mapValue.fields.answer != null));
            console.log("PEER CONNECTION", peerConnection1, !peerConnection1.currentRemoteDescription);
            //if (false) {
            if (peerConnection1.currentRemoteDescription && (doc._document.data.value.mapValue.fields.answer != null)) {
                console.log('Set remote description: ', doc._document.data.value.mapValue.fields.answer);
                console.log("someone has joined");
                
                //CONTINUE HERE
                //setRTCDesc();
                //const roomRef = doc(db, "rooms", roomId);
                //const docSnap = await getDoc(roomRef);
                console.log("docSnap data is", doc.data().answer);
                //const rtcSessionDescription = new RTCSessionDescription(doc._document.data.value.mapValue.fields.answer.mapValue.fields)
                console.log("set REMOTE description CREATE room start");
                const rtcSessionDescription = new RTCSessionDescription(doc.data().answer);
                console.log("set REMOTE description CREATE room end");
                console.log("set REMOTE description CREATE room state is ", peerConnection1.signalingState);
                await peerConnection1.setRemoteDescription(rtcSessionDescription);
            }
            /* if (!peerConnection.currentRemoteDescription && doc && doc.answer) {
            console.log('Got remote description: ', doc.answer);
            const rtcSessionDescription = new RTCSessionDescription(doc.answer);
            await peerConnection.setRemoteDescription(rtcSessionDescription);
        } */

        }); 
    }

    export async function joinRoom() {
        const roomId = document.querySelector('#room-id').value;
        console.log('Join room: ', roomId);
        //const roomRef = db.collection('rooms').doc(`${roomId}`);
        //const roomRef = await getDocs(collection(db, 'rooms'));
        const roomRef = doc(db, "rooms", roomId);
        const docSnap = await getDoc(roomRef);

        const calleeCandidatesCollection = collection(db, 'calleeCandidates');
        peerConnection2.addEventListener('icecandidate', event => {
            if (!event.candidate) {
                console.log('Got final candidate!');
                return;
            }
            console.log('Got candidate: ', event.candidate);
            const json = event.candidate.toJSON()
            addDoc(calleeCandidatesCollection, json);
        });

        peerConnection2.addEventListener('track', event => {
            console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
              console.log('Add a track to the remoteStream:', track);
              remoteStream2.addTrack(track);
            });
          });

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

        if(docSnap.exists()) {
            console.log('Got updated room:', typeof docSnap.data());
            const data = docSnap.data();
            console.log(data);
        
            console.log('Create PeerConnection with configuration: ', configuration);
            openUserMedia();
            registerPeerConnectionListeners();
            localStream.getTracks().forEach(track => {
                peerConnection2.addTrack(track, localStream);
              });
        
            // Checks for changes in database when a callee has been added
            /* if (!peerConnection.currentRemoteDescription && docSnap.answer) {
                console.log('Set remote description: ', docSnap.answer);
                const answer = new RTCSessionDescription(docSnap.answer)
                await peerConnection.setRemoteDescription(answer);
            }
         */
    
            const offer = docSnap.data().offer;
            console.log("set REMOTE description JOIN room start");
            await peerConnection2.setRemoteDescription(new RTCSessionDescription(offer));
            console.log("set REMOTE description JOIN room end");
            const answer = await peerConnection2.createAnswer();
            console.log("set LOCAL description JOIN room start");
            await peerConnection2.setLocalDescription(answer);
            console.log("set LOCAL description JOIN room end");

            
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
            console.log("LOLOL GET TROLLED");
        }

    }

    export async function openUserMedia() {
        document.querySelector('#localVideo').srcObject = localStream;
        remoteStream1 = new MediaStream();
        remoteStream2 = new MediaStream();
    }

    export async function attachRemoteStream() {
        document.querySelector('#remoteVideo1').srcObject = remoteStream1;
        document.querySelector('#remoteVideo2').srcObject = remoteStream2;
    }

    // PeerConnection instance
    function registerPeerConnectionListeners() {
        // peerconnection 1
        peerConnection1.addEventListener('icegatheringstatechange', () => {
        console.log(
            `ICE gathering state changed: ${peerConnection1.iceGatheringState}`);
        });
        peerConnection1.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${peerConnection1.connectionState}`);
        });
    
        peerConnection1.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${peerConnection1.signalingState}`);
        });
    
        peerConnection1.addEventListener('iceconnectionstatechange ', () => {
        console.log(
            `ICE connection state change: ${peerConnection1.iceConnectionState}`);
        });

        // peerconnection 2
        peerConnection2.addEventListener('icegatheringstatechange', () => {
        console.log(
            `ICE gathering state changed: ${peerConnection2.iceGatheringState}`);
        });
    
        peerConnection2.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${peerConnection2.connectionState}`);
        });
    
        peerConnection2.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${peerConnection2.signalingState}`);
        });
    
        peerConnection2.addEventListener('iceconnectionstatechange ', () => {
        console.log(
            `ICE connection state change: ${peerConnection2.iceConnectionState}`);
        });
    }
    