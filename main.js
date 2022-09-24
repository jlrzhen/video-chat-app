import './style.css'
import javascriptLogo from './javascript.svg'
import { setupCounter } from './counter.js'
import './webcam.js'
import * as buttons from './buttons.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <button id="counter" type="button"></button>
    <div class="card">
      <button id="addButton" type="button">Add Entry</button>
      <button id="readButton" type="button">Read Entry</button>
      <button id="updateButton" type="button">Update Entry</button>
      <button id="deleteButton" type="button">Delete Entry</button>
    </div>
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
