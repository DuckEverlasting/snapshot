import { combineReducers } from "redux";
import mainReducer from "./mainReducer";
import uiReducer from "./uiReducer";
import {
  UNDO,
  REDO,
  PUT_HISTORY_DATA,
  DELETE_LAYER
} from "../../actions/redux/index";

const rootReducer = combineReducers({
  ui: uiReducer,
  main: undoable(mainReducer, {
    filter: action => !action.payload.ignoreHistory,
    limit: 20
  })
});

export default rootReducer;

function undoable(reducer, { filter = () => true, limit = undefined }) {
  const initialState = {
    past: [],
    present: reducer(undefined, {}),
    future: []
  };

  return function(state = initialState, { type, payload }) {
    const { past, present, future } = state;
    let newPresent;

    switch (type) {
      case PUT_HISTORY_DATA:
        return {
          ...state,
          past: [
            ...past,
            {
              ...present,
              onUndo: { id: payload.id, data: payload.old },
              onRedo: { id: payload.id, data: payload.new }
            }
          ],
          present: { ...present }
        };
      case UNDO:
        if (!past.length) {
          return state;
        }
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        return {
          past: newPast,
          present: previous,
          future: [present, ...future]
        };
      case REDO:
        if (!future.length) {
          return state;
        }
        const next = future[0];
        const newFuture = future.slice(1);
        return {
          past: [...past, present],
          present: next,
          future: newFuture
        };
      case DELETE_LAYER:
        if (!filter({ type, payload })) {
          return {
            ...state,
            present: reducer(present, { type, payload })
          };
        } else {
          return {
            past: [
              ...past,
              { ...present, onUndelete: { id: payload.id, data: payload.data } }
            ],
            present: reducer(present, { type, payload }),
            future: []
          };
        }
      default:
        newPresent = reducer(present, { type, payload });
        if (present === newPresent) {
          return state;
        } else if (!filter({ type, payload })) {
          return {
            ...state,
            present: newPresent
          };
        } else {
          return {
            past: [...past, present],
            present: newPresent,
            future: []
          };
        }
    }
  };
}
