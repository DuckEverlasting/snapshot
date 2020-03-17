import {
  DRAG_LAYERCARD,
  END_DRAG_LAYERCARD,
  MAKE_ACTIVE_TOOL,
  UPDATE_TOOL_SETTINGS,
  UPDATE_WORKSPACE_SETTINGS,
  UPDATE_COLOR,
  TOGGLE_MENU,
  SET_ACTIVE_MENU_LIST
} from "../../actions/redux";

import { initUiState } from "./initState";

const uiReducer = (state = initUiState, {type, payload}) => {
  switch (type) {
    case DRAG_LAYERCARD:
      return {
        ...state,
        draggedLayercard: payload
      };

    case END_DRAG_LAYERCARD:
      return {
        ...state,
        draggedLayercard: null,
      }

    case MAKE_ACTIVE_TOOL:
      return {
        ...state,
        activeTool: payload
      };

    case UPDATE_TOOL_SETTINGS:
      let { tool, changes: toolChanges } = payload;
      return {
        ...state,
        toolSettings: {
          ...state.toolSettings,
          [tool]: toolChanges
        }
      };

    case UPDATE_WORKSPACE_SETTINGS:
      let workspaceSettingsChanges = payload;
      return {
        ...state,
        workspaceSettings: {
          ...state.workspaceSettings,
          ...workspaceSettingsChanges
        }
      };
    case UPDATE_COLOR:
      let { key, value } = payload;
      return {
        ...state,
        colorSettings: {
          ...state.colorSettings,
          [key]: value
        },
      };
    case TOGGLE_MENU:
      return {
        ...state,
        menuIsActive: !state.menuIsActive
      }
    case SET_ACTIVE_MENU_LIST:
      return {
        ...state,
        activeMenuList: payload
      }

    default:
      return state;
  }
};

export default uiReducer;
