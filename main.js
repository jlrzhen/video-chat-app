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
      <button id="createRoomButton" type="button" disabled=true>Create Room</button>
      <button id="joinRoomButton" type="button" disabled=true>Join Room</button>
      <button id="openMediaUserButton" type="button">Open Media</button>
      <button id="hangUpButton" type="button" disabled=true>Hang Up</button>
      <input id="muteCheckbox" type="checkbox" checked=true>Mute webcam.js feed</button>
      <!-- <input id="mutePersonalStream" type="checkbox" checked=true>Mute Personal Stream </button> -->
      <input id="muteOutboundStream" type="checkbox">Mute Outbound Stream</button>
      <input id="disableWebcam" type="checkbox">Disable Webcam</button>
      <p>Volume</p>
      <input id="volumeSlider" type="range" min="0" max="1" value="0.5" step="0.01"></input>
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
buttons.setupMuteCheckbox(document.querySelector('#muteCheckbox'))
//buttons.setupMutePersonalStream(document.querySelector('#mutePersonalStream'))
buttons.setupMuteOutboundStream(document.querySelector('#muteOutboundStream'))
buttons.setupHangUpButton(document.querySelector('#hangUpButton'))
buttons.setupDisableWebcam(document.querySelector('#disableWebcam'))
buttons.setupVolumeSlider(document.querySelector('#volumeSlider'))
