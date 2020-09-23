import {
  CREATE_NEW_PROJECT,
  SET_ACTIVE_PROJECT,
  UPDATE_PROJECT_TAB_ORDER,
  UPDATE_MAIN_CANVAS,
  UPDATE_UTILITY_CANVAS,
  UPDATE_STAGING_POSITION,
  SET_STAMP_DATA,
  UPDATE_CLIPBOARD_SETTINGS
} from "../../actions/redux";

import { v4 as uuidv4 } from 'uuid';
import { getInitMainState, getInitProjectState } from "./initState";
import projectReducer from "./projectReducer";

const mainReducer = (state=getInitMainState(), {type, payload}) => {
  if (payload && payload.project) {
    const projectId = payload.project === "current"
      ? state.activeProject
      : payload.project;

    return {
      ...state,
      projects: {
        ...state.projects,
        [projectId]: projectReducer(
          state.projects[projectId],
          {type, payload}
        )
      }
    }
  }

  switch (type) {
    case CREATE_NEW_PROJECT:
      const id = uuidv4();
      state.utilityCanvas.placeholder.width = payload.width;
      state.utilityCanvas.staging.width = payload.width;
      state.utilityCanvas.placeholder.height = payload.height;
      state.utilityCanvas.staging.height = payload.height;
      
      return {
        ...state,
        projects: {
          ...state.projects,
          [id]: getInitProjectState(id, payload.name, payload.width, payload.height),
        },
        projectTabOrder: [...state.projectTabOrder, id],
        activeProject: id
      }

    case SET_ACTIVE_PROJECT:
      const newActiveWidth = state.projects[payload].present.documentSettings.documentWidth,
        newActiveHeight = state.projects[payload].present.documentSettings.documentHeight;

      state.mainCanvas.width = newActiveWidth;
      state.utilityCanvas.placeholder.width = newActiveWidth;
      state.utilityCanvas.staging.width = newActiveWidth;
      state.mainCanvas.height = newActiveHeight;
      state.utilityCanvas.placeholder.height = newActiveHeight;
      state.utilityCanvas.staging.height = newActiveHeight;

      return {
        ...state,
        activeProject: payload
      }

    case UPDATE_MAIN_CANVAS:
      return {
        ...state,
        mainCanvas: payload
      };
    
    case UPDATE_PROJECT_TAB_ORDER:
      let { from, to } = payload;
      let newOrder = state.projectTabOrder.slice();
      newOrder.splice(to, 0, newOrder.splice(from, 1)[0]);
      return {
        ...state,
        projectTabOrder: newOrder
      };
    
    case UPDATE_UTILITY_CANVAS:
      return {
        ...state,
        layerCanvas: {
          ...state.layerCanvas,
          [payload.id]: payload.changes
        }
      };
      
    case UPDATE_STAGING_POSITION:
      return {
        ...state,
        stagingPinnedTo: payload.id
      }
 
    case SET_STAMP_DATA:
      return {
        ...state,
        stampData: {
          ...state.stampData,
          ...payload.changes
        }
      };

    case UPDATE_CLIPBOARD_SETTINGS:
      return {
        ...state,
        clipboardSettings: {
          ...state.clipboardSettings,
          ...payload.changes
        }
      };
      
    default:
      return state;
  }
};

export default mainReducer;
