    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
    import { collection, doc, query, addDoc, setDoc, getDocs, updateDoc, deleteDoc, onSnapshot, getDoc } from "firebase/firestore";
    import { startWebcam } from "./webcam.js";

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

    //-------------------------------- WebRTC room ---------------------------------------------

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

    let peerConnection = null;
    let localStream = null;
    let personalStream = null;
    let remoteStream = null;
    let roomDialog = null;
    let roomId = null;

    export async function createRoom() {
        document.querySelector("#createRoomButton").disabled = true //added line
        document.querySelector("#joinRoomButton").disabled = true //added line
        //const roomRef = await db.collection('rooms').doc();
        const collectionRef = collection(db, 'rooms'); // modified
        const roomRef = await addDoc(collectionRef, {}); // modified

        console.log('Create PeerConnection with configuration: ', configuration);
        peerConnection = new RTCPeerConnection(configuration);

        registerPeerConnectionListeners();

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        // Code for collecting ICE candidates below
        //const callerCandidatesCollection = roomRef.collection('callerCandidates');
        console.log(roomRef.id)
        const callerCandidatesCollection = collection(db, `rooms/${roomRef.id}/callerCandidates`); // modified
        peerConnection.addEventListener('icecandidate', event => {
            if (!event.candidate) {
            console.log('Got final candidate!');
            return;
            }
            console.log('Got candidate: ', event.candidate);
            //callerCandidatesCollection.add(event.candidate.toJSON());
            addDoc(callerCandidatesCollection, event.candidate.toJSON()); // modified
        });
        // Code for collecting ICE candidates above

        // Code for creating a room below
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        console.log('Created offer:', offer);

        const roomWithOffer = {
            'offer': {
            type: offer.type,
            sdp: offer.sdp,
            },
        };
        //await roomRef.set(roomWithOffer);
        await setDoc(roomRef, roomWithOffer); // modified
        roomId = roomRef.id;
        console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
        document.querySelector(
            '#currentRoom').innerText = `Current room is ${roomRef.id} - You are the caller!`;
        // Code for creating a room above

        peerConnection.addEventListener('track', event => {
            console.log('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
            console.log('Add a track to the remoteStream:', track);
            remoteStream.addTrack(track);
            });
        });

        // Listening for remote session description below
        //roomRef.onSnapshot(async snapshot => {
        const snap = onSnapshot(doc(db, "rooms", roomId), async (doc) => {
            const data = doc.data();
            if (!peerConnection.currentRemoteDescription && data && data.answer) {
                console.log('Got remote description: ', data.answer);
                const rtcSessionDescription = new RTCSessionDescription(data.answer);
                console.log("rtcSessionDescription is ", rtcSessionDescription) // temp logging REMOVE
                await peerConnection.setRemoteDescription(rtcSessionDescription);
            }
        });
        // Listening for remote session description above

        // Listen for remote ICE candidates below
        //roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
        const snap2 = onSnapshot(collection(db, `rooms/${roomRef.id}/calleeCandidates`), (snapshot) => { // modified
            snapshot.docChanges().forEach(async change => {
            if (change.type === 'added') {
                let data = change.doc.data();
                console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
            });
        });
        // Listen for remote ICE candidates above
    }

    //export async function joinRoom(roomId) {
    export async function joinRoom() {
        const roomId = document.querySelector('#room-id').value; //added this line
        //const roomRef = db.collection('rooms').doc(`${roomId}`);
        //const roomSnapshot = await roomRef.get();
        const roomRef = doc(db, "rooms", roomId);
        const docSnap = await getDoc(roomRef);
        console.log('Got room:', docSnap.exists());

        if (docSnap.exists()) {
            console.log('Create PeerConnection with configuration: ', configuration);
            peerConnection = new RTCPeerConnection(configuration);
            registerPeerConnectionListeners();
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });

            // Code for collecting ICE candidates below
            //const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
            const calleeCandidatesCollection = collection(db, `rooms/${roomRef.id}/calleeCandidates`); // modified
            peerConnection.addEventListener('icecandidate', event => {
                if (!event.candidate) {
                    console.log('Got final candidate!');
                    return;
                }
                console.log('Got candidate: ', event.candidate);
                //calleeCandidatesCollection.add(event.candidate.toJSON());
                addDoc(calleeCandidatesCollection, event.candidate.toJSON()); // modified
            });
            // Code for collecting ICE candidates above

            peerConnection.addEventListener('track', event => {
                console.log('Got remote track:', event.streams[0]);
                event.streams[0].getTracks().forEach(track => {
                    console.log('Add a track to the remoteStream:', track);
                    remoteStream.addTrack(track);
                });
            });

            // Code for creating SDP answer below
            const offer = docSnap.data().offer;
            console.log('Got offer:', offer);
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            console.log('Created answer:', answer);
            await peerConnection.setLocalDescription(answer);

            const roomWithAnswer = {
                answer: {
                    type: answer.type,
                    sdp: answer.sdp,
                },
            };
            //await roomRef.update(roomWithAnswer);
            await updateDoc(roomRef, roomWithAnswer);
            // Code for creating SDP answer above

            // Listening for remote ICE candidates below
            const snap2 = onSnapshot(collection(roomRef, "callerCandidates"), (snapshot) => {
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                    let data = change.doc.data();
                    console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
            });
            // Listening for remote ICE candidates above
        }
    }

    export async function openUserMedia(e) {
        document.querySelector("#openMediaUserButton").disabled = true
        document.querySelector("#joinRoomButton").disabled = false
        document.querySelector("#createRoomButton").disabled = false
        let stream = await startWebcam(); // added this line
        /* const stream = await navigator.mediaDevices.getUserMedia(
            {video: true, audio: true}
        ); */
        document.querySelector('#localVideo').srcObject = stream; //temp REMOVE
        localStream = stream;
        remoteStream = new MediaStream();
        personalStream = await startWebcam();
        document.querySelector('#remoteVideo').srcObject = remoteStream;

        //console.log('Stream:', document.querySelector('#localVideo').srcObject);
        console.log('Stream:', document.querySelector('video').srcObject);
        console.log('localStream:', localStream);
        //document.querySelector('#localVideo').srcObject = stream;

        // added these 4 lines
        const audioInputSelect = document.querySelector('select#audioSource');
        const videoSelect = document.querySelector('select#videoSource');
        audioInputSelect.onchange = updateVideoAudio;
        videoSelect.onchange = updateVideoAudio;

        mutePersonalStream(); // added line
    }

    function updateVideoAudio() {
        startWebcam();
        // addtracks stuff (doesn't work, FIX THIS)
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    }

    export async function mutePersonalStream(muted=true) { // new function
        /* 
        Muting yourself so that you can't hear your own voice
        */
        /* if(muted){
            personalStream = await navigator.mediaDevices.getUserMedia(
                {video: true, audio: false}
            );
        } else {
            personalStream = await navigator.mediaDevices.getUserMedia(
                {video: true, audio: true}
            );
        } */
        if(muted){
            personalStream.getAudioTracks().forEach(track => {
                track.enabled = false;
            });
        } else {
            personalStream.getAudioTracks().forEach(track => {
                track.enabled = true;
                track.applyConstraints()
            });
        }
        //document.querySelector('#localVideo').srcObject = personalStream;
    }

    export async function muteOutboundStream(muted=false) { // our new added function
        // Your outbound stream is the other caller's remote stream
        // so muting 'local' stream means that they can't hear you
        console.log("LOCALSTREAM IS " , localStream)
        if(muted){
            localStream.getAudioTracks().forEach(track => {
                track.enabled = false;
            });
        } else {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = true;
                track.applyConstraints()
            });
        }
    }

    export async function disableWebcam(webcamDisabled=false) { // our new added function
        // Your outbound stream is the other caller's remote stream
        // so disabling 'local' stream means that they can't see you
        console.log("LOCALSTREAM IS " , localStream)
        if(webcamDisabled){
            localStream.getVideoTracks().forEach(videoTrack => {
                videoTrack.enabled = false;
            });
            personalStream.getVideoTracks().forEach(videoTrack => {
                videoTrack.enabled = false;
            });
        } else {
            localStream.getVideoTracks().forEach(videoTrack => {
                videoTrack.enabled = true;
            });
            personalStream.getVideoTracks().forEach(videoTrack => {
                videoTrack.enabled = true;
            });
        }
    }

    export async function setVolume() {
        let sliderValue = document.querySelector('#volumeSlider').value;
        let newVolume = sliderValue;
        document.querySelector('#remoteVideo').volume = newVolume;
        //console.log(`volume has been set to ${newVolume}`);
    }

    export async function hangUp(e) {
        const tracks = document.querySelector('video').srcObject.getTracks();
        tracks.forEach(track => {
            track.stop();
        });

        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }

        if (peerConnection) {
            peerConnection.close();
        }

        // Delete room on hangup
        if (roomId) {
            const roomRef = doc(db, "rooms", roomId);
            //const calleeCandidates = await roomRef.collection('calleeCandidates').get();
            const calleeCandidates = await getDocs(collection(db, `rooms/${roomRef.id}/calleeCandidates`));
            console.log("calleeCandidates is ", calleeCandidates);
            calleeCandidates.forEach(async candidate => {
                //await candidate.ref.delete();
                await deleteDoc(candidate.ref);
            });
            //const callerCandidates = await roomRef.collection('callerCandidates').get();
            const callerCandidates = await getDocs(collection(db, `rooms/${roomRef.id}/callerCandidates`));
            console.log("callerCandidates is ", callerCandidates);
            callerCandidates.forEach(async candidate => {
                //await candidate.ref.delete();
                await deleteDoc(candidate.ref);
            });
            await deleteDoc(roomRef);
        }

        document.location.reload(true);
    }

    function registerPeerConnectionListeners() {
    peerConnection.addEventListener('icegatheringstatechange', () => {
        console.log(
            `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state change: ${peerConnection.connectionState}`);
        if(peerConnection.connectionState === "connected") { // added this block
            document.querySelector("#joinRoomButton").disabled = true
            document.querySelector("#createRoomButton").disabled = true
            document.querySelector("#hangUpButton").disabled = false
        }
    });

    peerConnection.addEventListener('signalingstatechange', () => {
        console.log(`Signaling state change: ${peerConnection.signalingState}`);
    });

    peerConnection.addEventListener('iceconnectionstatechange ', () => {
        console.log(
            `ICE connection state change: ${peerConnection.iceConnectionState}`);
    });
    }
