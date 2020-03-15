import undoable from "redux-undo";
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