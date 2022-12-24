import * as firebase from './firebase.js'
import muteCheckbox from "./webcam.js"

export function setupAddButton(element) {
    element.addEventListener('click', () => {firebase.addData()})
}

export function setupReadButton(element) {
    element.addEventListener('click', () => firebase.readData())
}

export function setupUpdateButton(element) {
    element.addEventListener('click', () => firebase.updateData())
}

export function setupDeleteButton(element) {
    element.addEventListener('click', () => firebase.deleteData())
}

export function setupCreateRoomButton(element) {
    element.addEventListener('click', () => firebase.createRoom())
}

export function setupJoinRoomButton(element) {
    element.addEventListener('click', () => firebase.joinRoom())
}

export function setupOpenMediaUserButton(element) {
    element.addEventListener('click', () => firebase.openUserMedia())
}

export function setupMuteCheckbox(element) {
    element.addEventListener('click', () => muteCheckbox(element.checked))
}
/*
export function setupMutePersonalStream(element) {
    element.addEventListener('click', () => firebase.mutePersonalStream(element.checked))
} */

export function setupMuteOutboundStream(element) {
    element.addEventListener('click', () => firebase.muteOutboundStream(element.checked))
}

export function setupHangUpButton(element) {
    element.addEventListener('click', () => firebase.hangUp())
}

export function setupDisableWebcam(element) {
    element.addEventListener('click', () => firebase.disableWebcam(element.checked))
}

export function setupVolumeSlider(element) {
    element.addEventListener('input', () => firebase.setVolume())
}