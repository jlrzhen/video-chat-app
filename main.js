import './style.css'
import javascriptLogo from './javascript.svg'
import { setupCounter } from './components/counter.js'
import './components/webcam.js'
import * as buttons from './components/buttons.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <input id="room-id" type="text" placeholder="Search..">
    <button id="counter" type="button"></button>
    <div class="card">
      <button id="addButton" type="button">Add Entry</button>
      <button id="readButton" type="button">Read Entry</button>
      <button id="updateButton" type="button">Update Entry</button>
      <button id="deleteButton" type="button">Delete Entry</button>
      <button id="createRoomButton" type="button">Create Room</button>
      <button id="joinRoomButton" type="button">Join Room</button>
      <button id="openMediaUserButton" type="button">Open Media</button>
      <button id="attachRemoteStreamButton" type="button">Attach Remote</button>
    </div>
    <p id="currentRoom">trolololo</p>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector('#counter'))
buttons.setupAddButton(document.querySelector('#addButton'))
buttons.setupReadButton(document.querySelector('#readButton'))
buttons.setupUpdateButton(document.querySelector('#updateButton'))
buttons.setupDeleteButton(document.querySelector('#deleteButton'))
buttons.setupCreateRoomButton(document.querySelector('#createRoomButton'))
buttons.setupJoinRoomButton(document.querySelector('#joinRoomButton'))
buttons.setupOpenMediaUserButton(document.querySelector('#openMediaUserButton'))
buttons.setupAttachRemoteStream(document.querySelector('#attachRemoteStreamButton'))
