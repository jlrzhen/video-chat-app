import * as firebase from './firebase.js'

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