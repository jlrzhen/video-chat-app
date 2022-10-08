
/* async function collectIceCandidates(roomRef, peerConnection, localName, remoteName) {
    const candidatesCollection = roomRef.collection(localName);

    peerConnection.addEventListener('icecandidate', event => {
        if (event.candidate) {
            const json = event.candidate.toJSON();
            candidatesCollection.add(json);
        }
    });

    roomRef.collection(remoteName).onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === "added") {
                const candidate = new RTCIceCandidate(change.doc.data());
                peerConneciton.addIceCandidate(candidate);
            }
        });
    })
} */

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
  