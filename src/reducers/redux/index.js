import { combineReducers } from "redux";
import mainReducer from "./mainReducer";
import uiReducer from "./uiReducer";
import {
  UNDO,
  REDO,
  PUT_HISTORY_DATA,
  PUT_HISTORY_DATA_MULTIPLE,
  RESET_STATE
} from "../../actions/redux/index";

const rootReducer = combineReducers({
  lastAction: lastActionReducer,
  ui: uiReducer,
  main: undoable(mainReducer, {
    filter: (action) => !action.payload.ignoreHistory,
    limit: 20
  })
});

export default rootReducer;

function lastActionReducer(state=null, {type, payload}) {
  console.log(type, payload);
  if (type === RESET_STATE) {
    return null;
  } else {
    return {type, time: Date.now()}
  }
}

function undoable(reducer, { filter = () => true, limit = undefined }) {
  const getInitState = () => ({
    past: [],
    present: reducer(undefined, {}),
    future: []
  });

  return function(state = getInitState(), { type, payload }) {
    const { past, present, future } = state;
    let newPresent;

    switch (type) {
      case PUT_HISTORY_DATA:
        const { oldMove=null, newMove=null, ...params } = payload.params;
        return {
          ...state,
          past: [
            ...past,
            {
              ...present,
              onUndo: { id: payload.id, data: payload.old, move: oldMove },
              onRedo: { id: payload.id, data: payload.new, move: newMove },
              historyParams: params
            }
          ],
          present: { ...present }
        };
      case PUT_HISTORY_DATA_MULTIPLE:
        const onUndoArray = payload.array.map(el => {
          return {id: el.id, data: el.old, move: payload.oldMove}
        });
        const onRedoArray = payload.array.map(el => {
          return {id: el.id, data: el.new, move: payload.newMove}
        });
        return {
          ...state,
          past: [
            ...past,
            {
              ...present,
              onUndo: onUndoArray,
              onRedo: onRedoArray,
              historyParams: payload.params
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
      case RESET_STATE: {
        return getInitState();
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
