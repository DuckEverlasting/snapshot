import { combineReducers } from "redux";
import mainReducer from "./mainReducer";
import uiReducer from "./uiReducer";

const rootReducer = combineReducers({
  ui: uiReducer,
  main: undoable(mainReducer, {
    filter: (action) => !action.payload.ignoreHistory,
    limit: 20,
  })
})

export default rootReducer;

function undoable(reducer) {
  const initialState = {
    past: [],
    present: reducer(undefined, {}),
    future: []
  }

  return function(state = initialState, {type, payload}) {
    const { past, present, future } = state

    switch (type) {
      case 'UNDO':
        const previous = past[past.length - 1]
        const newPast = past.slice(0, past.length - 1)
        return {
          past: newPast,
          present: previous,
          future: [present, ...future]
        }
      case 'REDO':
        const next = future[0]
        const newFuture = future.slice(1)
        return {
          past: [...past, present],
          present: next,
          future: newFuture
        }
      default:
        const newPresent = reducer(present, {type, payload})
        if (present === newPresent) {
          return state
        } else if (payload.ignoreHistory) {
          return {
            ...state,
            present: newPresent
          } 
        } else if (payload.layerChanges) {
          return {
            past: [...past, implementLayerChanges(present)],
            present: newPresent,
            future: []
          }
        } else {
          return {
            past: [...past, present],
            present: newPresent,
            future: []
          }
        }
    }
  }
}

function implementLayerChanges() {

}

// So basically, the idea is take advantage of the queue system to setup the actions we need.
// Hijack the past queue spaces for the appropriate objects with special queue items
// that will undo (or redo) the changes to the canvas. When those queue actions are called,
// send a special redux action that will be caught by the undoable reducer, which will further
// update the queue of the necessary state history.