import { combineReducers } from "redux";
import mainReducer from "./mainReducer";
import uiReducer from "./uiReducer";
import {
  RESET_STATE
} from "../../actions/redux/index";

const rootReducer = combineReducers({
  lastAction: lastActionReducer,
  ui: uiReducer,
  main: mainReducer
});

export default rootReducer;

function lastActionReducer(state=null, {type, payload}) {
  // console.log(type, payload);
  if (type === RESET_STATE) {
    return null;
  } else {
    return {type, time: Date.now()}
  }
}
