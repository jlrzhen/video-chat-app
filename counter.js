import { setupDataStore } from './firebase.js'

export function setupCounter(element) {
  let counter = 0
  const setCounter = (count) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  element.addEventListener('click', () => {setCounter(++counter); setupDataStore()})
  setCounter(0)
}
