import undoable from "redux-undo";
import mainReducer from "./mainReducer";
import { initState } from "./initState";

import {
  UNDO,
  REDO,
} from "../../actions/redux";

const rootReducer = (state = initState, {type, payload}) => {
  let past = state.history.past;
  let future = state.history.future; 
  switch (type) {
    case UNDO:
      if (!past.length) {
        return state;
      }
      const undoObject = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      const newFuture = [...future, undoObject]
      const { undoPayload } = undoObject;

      if (undoPayload.canvasData) {
        return {
          ...state,
          layerData: {
            ...state.layerData,
            [undoPayload.canvasData.id]: {
              ...state.layerData[undoPayload.canvasData.id],
              queue: {
                type: "manipulate",
                action: "replace",
                params: {
                  source: undoPayload.canvasData.data,
                  ignoreHistory: true
                }
              }
            }
          },
          history: {
            ...state.history,
            past: [...newPast],
            future: [...newFuture]
          }
        }
      } else {
        const { layerData={}, ...rest } = undoPayload.state;
        return {
          ...state,
          ...rest,
          layerData: {...state.layerData, ...layerData},
          history: {
            ...state.history,
            past: newPast,
            future: newFuture
          }
        };
      }

    case REDO:
      if (!future.length) {
        return state;
      }
      const redoAction = {
        type: future[future.length - 1].type,
        payload: {...future[future.length - 1].payload}
      }
      const newState = {
        ...state,
        history: {
          ...state.history,
          future: future.slice(0, future.length - 1)
        }
      }
      return mainReducer(newState, redoAction);

    default:
      if (state.history.future.length) {
        state = {...state, history: {...state.history, future: []}}
      }
      console.log("type: ", type, " payload: ", payload)
      return mainReducer(state, {type, payload});
  }
};

export default rootReducer;
