import {
  DRAG_LAYERCARD,
  END_DRAG_LAYERCARD,
  MAKE_ACTIVE_TOOL,
  UPDATE_TOOL_SETTINGS,
  UPDATE_WORKSPACE_SETTINGS,
  UPDATE_COLOR,
  SWITCH_COLORS,
  TOGGLE_MENU,
  SET_ACTIVE_MENU_LIST,
  TOGGLE_ABOUT_MODAL,
  TOGGLE_HELP,
  SET_HELP_TOPIC,
  SET_FILTER_TOOL
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
      if (payload.zoomPct) {
        if (payload.zoomPct < 12.5) {
          payload.zoomPct = 12.5;
        } else if (payload.zoomPct > 600) {
          payload.zoomPct = 600;
        }
      }
      return {
        ...state,
        workspaceSettings: {
          ...state.workspaceSettings,
          ...payload
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
    case SWITCH_COLORS:
      return {
        ...state,
        colorSettings: {
          ...state.colorSettings,
          primary: state.colorSettings.secondary,
          secondary: state.colorSettings.primary,
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
    case TOGGLE_ABOUT_MODAL:
      return {
        ...state,
        overlayVisible: state.overlayVisible === "aboutModal" ? null : "aboutModal"
      }
    case TOGGLE_HELP:
      return {
        ...state,
        overlayVisible: state.overlayVisible === "helpModal" ? null : "helpModal",
        currentHelpTopic: payload ? payload : state.currentHelpTopic
      }
    case SET_HELP_TOPIC:
      return {
        ...state,
        currentHelpTopic: payload
      }
    case SET_FILTER_TOOL:
      return {
        ...state,
        overlayVisible: payload.bool ? "filterTool" : null,
        currentFilter: payload.filter
      }

    default:
      return state;
  }
};

export default uiReducer;
