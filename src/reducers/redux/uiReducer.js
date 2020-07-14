import {
  DRAG_LAYERCARD,
  END_DRAG_LAYERCARD,
  SET_ACTIVE_TOOL,
  UPDATE_TOOL_SETTINGS,
  UPDATE_WORKSPACE_SETTINGS,
  UPDATE_COLOR,
  SWITCH_COLORS,
  SET_MENU_IS_DISABLED,
  SET_OVERLAY,
  SET_HELP_TOPIC,
  SET_IMPORT_IMAGE_FILE,
  SET_TRANSFORM_TARGET,
  SET_TRANSFORM_PARAMS,
  SET_CROP_IS_ACTIVE,
  SET_CROP_PARAMS,
  SET_EXPORT_OPTIONS,
  SET_APP_IS_WAITING,
  RESET_STATE
} from "../../actions/redux";

import { getInitUiState } from "./initState";

const uiReducer = (state = getInitUiState(), {type, payload}) => {
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

    case SET_ACTIVE_TOOL:
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
    case SET_MENU_IS_DISABLED:
      return {
        ...state,
        menuIsDisabled: payload
      }
    case SET_OVERLAY:
      return {
        ...state,
        overlay: state.overlay === payload.overlay ? null : payload.overlay,
        currentHelpTopic: payload.params.helpTopic ? payload.params.helpTopic : state.currentHelpTopic,
        currentFilter: payload.params.filter ? payload.params.filter : null
      }
    case SET_HELP_TOPIC:
      return {
        ...state,
        currentHelpTopic: payload
      }
    case SET_IMPORT_IMAGE_FILE:
      return {
        ...state,
        importImageFile: payload
      }
    case SET_TRANSFORM_TARGET:
      return {
        ...state,
        transformTarget: payload.target,
        transformParams: {
          ...state.transformParams,
          ...payload.params
        }
      }
    case SET_TRANSFORM_PARAMS:
      return {
        ...state,
        transformParams: {
          ...state.transformParams,
          ...payload.params
        }
      }
    case SET_CROP_IS_ACTIVE:
      return {
        ...state,
        cropIsActive: payload.bool,
        cropParams: {
          ...state.cropParams,
          ...payload.params
        }
      }
    case SET_CROP_PARAMS:
      return {
        ...state,
        cropParams: {
          ...state.cropParams,
          ...payload
        }
      }  
    case SET_EXPORT_OPTIONS:
      return {
        ...state,
        exportOptions: payload
      }
    case SET_APP_IS_WAITING:
      return {
        ...state,
        appIsWaiting: payload
      }
    case RESET_STATE:
      return getInitUiState();
    default:
      return state;
  }
};

export default uiReducer;
