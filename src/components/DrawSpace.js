import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ActionCreators } from "redux-undo";
import styled from "styled-components";
import pencilImg from "../cursors/pencil.png";
import dropperImg from "../cursors/dropper.png";

import { addOpacity, toArrayFromRgba } from "../utils/colorConversion.js";
import getZoomAmount from "../utils/getZoomAmount";
import {
  createLayer,
  updateColor,
  updateWorkspaceSettings,
  updateSelectionPath,
  updateLayerOrder
} from "../actions/redux";
import selection from "../reducers/custom/selectionReducer.js";

import draw from "../reducers/custom/drawingReducer";
import manipulate from "../reducers/custom/manipulateReducer";

const DrawSpaceSC = styled.div.attrs(props => ({
  style: {
    zIndex: props.index
  }
}))`
  position: absolute;
  width: 100%;
  height: 100%;
  outline: none;
  cursor: ${props => props.cursorHandler};
`;

let state = {
  mouseDown: false,
  origin: null,
  destArray: [],
  hold: false,
  throttle: false,
  interrupt: false,
  lockedAxis: "",
  heldShift: false,
  tool: null,
  prevLayerData: null
};

export default function DrawSpace(props) {
  // Right now this is rerendering every time the Redux store is updated. May require some future refactoring.
  const { activeTool, toolSettings } = useSelector(state => state.ui);
  const { activeLayer, selectionPath, layerData, layerOrder } = useSelector(
    state => state.main.present
  );
  const primary = useSelector(state => state.ui.colorSettings.primary);
  const { zoomPct, translateX, translateY } = useSelector(
    state => state.ui.workspaceSettings
  );
  const { canvasWidth, canvasHeight } = useSelector(
    state => state.main.present.documentSettings
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (state.mouseDown) {
      state = { ...state, interrupt: true };
    }
  }, [activeTool]);

  const eyeDropper = (x, y, palette) => {
    /* 
      Separate function to handle the Eye Dropper tool. (Doesn't go through the standard draw reducer.)
    */

    let color;
    for (let i = layerOrder.length - 1; i >= 0; i--) {
      let ctx = layerData[layerOrder[i]].getContext("2d");
      const pixel = ctx.getImageData(x, y, 1, 1);
      const data = pixel.data;
      if (data[3] === 0) {
        continue;
      } else {
        color = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
        break;
      }
    }
    if (color !== undefined) dispatch(updateColor(palette, color));
  };

  const cursorHandler = () => () => {
    /* 
      Callback that handles which cursor is displayed over the component.
    */

    if (props.overrideCursor !== null) {
      return props.overrideCursor;
    }

    switch (activeTool) {
      case "pencil":
        return `url(${pencilImg}) -22 22, auto`;
      case "line":
        return "crosshair";
      case "fillRect":
        return "crosshair";
      case "drawRect":
        return "crosshair";
      case "selectRect":
        return "crosshair";
      case "eyeDropper":
        return `url(${dropperImg}) -22 22, auto`;
      case "move":
        return "move";
      case "hand":
        return "grab";
      case "zoom":
        return "zoom-in";
      default:
        return "auto";
    }
  };

  const contextMenuHandler = ev => {
    /* 
      Handles what happens when secondary mouse button is clicked. Currently set to do nothing.
    */

    ev.preventDefault();
  };

  const mouseDownHandler = ev => {
    /* 
      Handles what happens when mouse is pressed down.
    */

    if (activeLayer === null || state.hold || ev.buttons > 1) return;
    layerData.staging.getContext("2d").clearRect(0, 0, layerData.staging.width, layerData.staging.height);
    dispatch(updateLayerOrder(layerOrder.indexOf("staging"), layerOrder.indexOf(activeLayer) + 1));

    let [x, y] = [
      ev.nativeEvent.offsetX + canvasWidth,
      ev.nativeEvent.offsetY + canvasHeight
    ];
    state = {
      ...state,
      mouseDown: true,
      origin: [x, y],
      destArray: [],
      lastMid: null,
      heldShift: ev.shiftKey,
      tool: activeTool
    };
    switch (state.tool) {
      case "pencil":
        break;
      case "brush":
        break;
      case "line":
        break;
      case "fillRect":
        break;
      case "drawRect":
        break;
      case "fillCirc":
        break;
      case "drawCirc":
        break;
      case "eraser":
        break;
      case "eyeDropper":
        let modifier = window.navigator.platform.includes("Mac")
          ? ev.metaKey
          : ev.ctrlKey;
        return eyeDropper(x, y, modifier ? "secondary" : "primary");
      case "selectRect":
        if (!state.heldShift)
          manipulate(layerData.selection.getContext("2d"), {
            action: "clear",
            params: { ignoreHistory: true }
          });
        return dispatch(createLayer(layerOrder.length, "staging", true));
      case "move":
        break;
      case "hand":
        break;
      case "zoom":
        break;
      case "TEST":
        dispatch(ActionCreators.undo());
        break;
      default:
        break;
    }
  };

  const setLockedAxis = (x, y) => {
    /* 
      Determines which axis should be "locked" in certain functions.
    */

    if (Math.abs(state.origin[0] - x) < Math.abs(state.origin[1] - y)) {
      state = { ...state, lockedAxis: "x" };
    } else {
      state = { ...state, lockedAxis: "y" };
    }
  };

  const mouseMoveHandler = ev => {
    /* 
      Handles what happens when mouse is moved.
    */

    if (state.interrupt) {
      return mouseUpHandler(ev);
    }
    if (!state.mouseDown) return;
    const { opacity, width } = toolSettings[state.tool];
    // Note conversion of opacity to 0 - 1 from 0 - 100 below.
    const color = addOpacity(primary, opacity / 100);
    let [x, y] = [
      ev.nativeEvent.offsetX + canvasWidth,
      ev.nativeEvent.offsetY + canvasHeight
    ];

    // Default parameters
    let params = {
      orig: state.origin,
      dest: [x, y],
      destArray: [[x, y]],
      width: width,
      strokeColor: color,
      fillColor: color,
      clip: selectionPath,
      ignoreHistory: true
    };

    if (state.lockedAxis && !ev.shiftKey) {
      state = { ...state, lockedAxis: "" };
    }

    if (!state.lockedAxis && ev.shiftKey) {
      setLockedAxis(x, y);
    }

    let ctx = layerData.staging.getContext("2d");    

    switch (state.tool) {
      case "pencil":
        if (state.lockedAxis === "x") {
          x = state.origin[0];
        } else if (state.lockedAxis === "y") {
          y = state.origin[1];
        }

        draw(ctx, {
          action: "drawQuad",
          params: {
            ...params,
            destArray: [...state.destArray, [x, y]],
            clearFirst: true
          }
        });
        return (state = {
          ...state,
          destArray: [...state.destArray, [x, y]]
        });

      case "brush":
        function midpoint(orig, dest) {
          return [
            orig[0] + (dest[0] - orig[0]) / 2,
            orig[1] + (dest[1] - orig[1]) / 2
          ];
        }

        function getQuadLength(p1, p2, p3) {
          const distA = Math.sqrt(
            Math.pow(p1[1] - p2[1], 2) + Math.pow(p1[0] - p2[0], 2)
          );
          const distB = Math.sqrt(
            Math.pow(p2[1] - p3[1], 2) + Math.pow(p2[0] - p3[0], 2)
          );
          return distA + distB;
        }
        const lastDest =
          state.destArray[state.destArray.length - 1] || state.origin;

        const newMid = midpoint(lastDest, [x, y]);

        if (
          getQuadLength(state.lastMid || state.origin, lastDest, newMid) <
          width * 0.25
        ) {
          return;
        }

        const gradientData = [
          [0, color],
          [1, color]
        ];

        if (state.lockedAxis === "x") {
          x = state.origin[0];
        } else if (state.lockedAxis === "y") {
          y = state.origin[1];
        }

        draw(ctx, {
          action: "drawQuadPoints",
          params: {
            ...params,
            orig: state.lastMid || state.origin,
            destArray: [lastDest, newMid],
            gradient: gradientData,
            clearFirst: false
          }
        });
        return (state = {
          ...state,
          destArray: [...state.destArray, [x, y]],
          lastMid: newMid
        });

      case "line":
        draw(ctx, {
          action: "drawLine",
          params: {
            ...params,
            clearFirst: true
          }
        });
        break;

      case "fillRect":
        if (ev.shiftKey) {
          if (Math.abs(state.origin[0] - x) < Math.abs(state.origin[1] - y)) {
            x = y;
          } else {
            y = x;
          }
        }

        draw(ctx, {
          action: "fillRect",
          params: {
            ...params,
            clearFirst: true,
            dest: [x, y]
          }
        });
        break;

      case "drawRect":
        draw(ctx, {
          action: "drawRect",
          params: {
            ...params,
            clearFirst: true
          }
        });
        break;

      case "fillCirc":
        draw(ctx, {
          action: "fillCirc",
          params: {
            ...params,
            clearFirst: true
          }
        });
        break;

      case "drawCirc":
        draw(ctx, {
          action: "drawCirc",
          params: {
            ...params,
            clearFirst: true
          }
        });
        break;

      case "eraser":
        if (state.lockedAxis === "x") {
          x = state.origin[0];
        } else if (state.lockedAxis === "y") {
          y = state.origin[1];
        }

        const newDestArray = [...state.destArray, [x, y]];

        draw(ctx, {
          action: "drawQuad",
          params: {
            ...params,
            destArray: newDestArray,
            strokeColor: "rgba(0, 0, 0, .5)"
          }
        });
        return (state = {
          ...state,
          destArray: newDestArray
        });

      case "eyeDropper":
        let modifier = window.navigator.platform.includes("Mac")
          ? ev.metaKey
          : ev.ctrlKey;
        return eyeDropper(x, y, modifier ? "secondary" : "primary");

      case "selectRect":
        draw(ctx, {
          action: "drawRect",
          params: {
            ...params,
            width: 1,
            strokeColor: "rgba(0, 0, 0, 1)",
            dashPattern: [5, 10],
            clearFirst: true,
            clip: null
          }
        });
        break;

      case "move":
        if (state.throttle) break;

        state = { ...state, throttle: true };
        setTimeout(() => {
          state = { ...state, throttle: false };
        }, 25);

        manipulate(activeLayer, {
          action: "move",
            params: {
            ...params,
            orig: state.destArray[state.destArray.length - 1] || state.origin
          }
        })
        return (state = {
          ...state,
          destArray: [...state.destArray, [x, y]]
        });

      case "hand":
        if (state.throttle) break;

        state = { ...state, throttle: true };
        setTimeout(() => {
          state = { ...state, throttle: false };
        }, 25);

        const deltaX = state.origin[0] - (ev.nativeEvent.offsetX + canvasWidth);
        const deltaY =
          state.origin[1] - (ev.nativeEvent.offsetY + canvasHeight);
        dispatch(
          updateWorkspaceSettings({
            translateX: translateX - deltaX,
            translateY: translateY - deltaY
          })
        );
        break;

      case "zoom":
        break;

      default:
        break;
    }
  };

  const mouseUpHandler = (ev, mouseOut = false) => {
    /* 
      Handles what happens when mouse is released.
    */

    if (!state.mouseDown) return;

    const { opacity, width, tolerance } = toolSettings[state.tool];
    // Note conversion of opacity to 0 - 1 from 0 - 100 below.
    const color = addOpacity(primary, opacity / 100);
    const colorArray = toArrayFromRgba(primary, opacity / 100);

    state = {
      ...state,
      mouseDown: false,
      hold: true,
      interrupt: false
    };

    setTimeout(() => {
      state = {
        ...state,
        hold: false,
        tool: null
      };
      layerData.staging.getContext("2d").clearRect(0, 0, layerData.staging.width, layerData.staging.height);
      // dispatch(removeStagingLayer());
    }, 0);

    const [x, y] = [
      ev.nativeEvent.offsetX + canvasWidth,
      ev.nativeEvent.offsetY + canvasHeight
    ];
    let params = {
      orig: state.origin,
      dest: [x, y],
      destArray: [[x, y]],
      width: width,
      strokeColor: color,
      fillColor: color,
      clip: selectionPath
    };

    let ctx = layerData[activeLayer].getContext("2d");    

    switch (state.tool) {
      case "pencil":
        if (
          params.orig[0] === params.dest[0] &&
          params.orig[1] === params.dest[1]
        ) {
          return draw(ctx, {
            action: "fillRect",
            params: {
              ...params,
              orig: [
                params.orig[0] - 0.5 * params.width,
                params.orig[1] - 0.5 * params.width
              ],
              dest: [
                params.dest[0] + 0.5 * params.width,
                params.dest[1] + 0.5 * params.width
              ]
            }
          });
        } else {
          return draw(ctx, {
            action: "drawQuad",
            params: {
              ...params,
              destArray: state.destArray
            }
          });
        }

      case "brush":
        if (!state.destArray.length) {
          break;
        }
        return (state = { ...state, lastMid: null, prevLayerData: null });

      case "line":
        draw(ctx, {
          action: "drawLine",
          params: { ...params }
        });
        break;

      case "fillRect":
        draw(ctx, {
          action: "fillRect",
          params: { ...params }
        });
        break;

      case "drawRect":
        draw(ctx, {
          action: "drawRect",
          params: { ...params }
        });
        break;

      case "fillCirc":
        draw(ctx, {
          action: "fillCirc",
          params: { ...params }
        });
        break;

      case "drawCirc":
        draw(ctx, {
          action: "drawCirc",
          params: { ...params }
        });
        break;

      case "eraser":
        if (!state.destArray.length) {
          break;
        }
        draw(ctx, {
          action: "drawQuad",
          params: {
            ...params,
            destArray: state.destArray,
            strokeColor: "rgba(0, 0, 0, 1)",
            composite: "destination-out"
          }
        });
        break;

      case "eyeDropper":
        break;

      case "bucketFill":
        manipulate(ctx, {
          action: "fill",
            params: {
            orig: state.origin,
            colorArray,
            tolerance,
            clip: selectionPath
          }
        })
        break;

      case "selectRect":
        let path;
        if (
          params.orig[0] === params.dest[0] &&
          params.orig[1] === params.dest[1]
        ) {
          path = null;
        } else if (selectionPath !== null && state.heldShift) {
          path = new Path2D(selectionPath);
        } else {
          path = new Path2D();
        }
        path = selection(path, { action: "drawRect", params });
        dispatch(updateSelectionPath(path));
        draw(layerData.selection.getContext("2d"), {
          action: "drawRect",
          params: {
            ...params,
            width: 1,
            strokeColor: "rgba(0, 0, 0, 1)",
            dashPattern: [5, 10],
            prevCtx: layerData[activeLayer].getContext("2d")
          }
        });
        break;

      case "move":
        manipulate(ctx, {
          action: "move",
          params: {
            ...params,
            orig: state.destArray[state.destArray.length - 1] || state.origin
          }
        });
        break;

      case "hand":
        break;

      case "zoom":
        if (mouseOut) break;
        return dispatch(
          updateWorkspaceSettings({
            zoomPct: ev.altKey
              ? getZoomAmount(-1, zoomPct)
              : getZoomAmount(1, zoomPct)
          })
        );

      default:
        break;
    }
  };

  return (
    <DrawSpaceSC
      index={props.index}
      tabIndex="1"
      cursorHandler={cursorHandler}
      pencilImg={pencilImg}
      onContextMenu={contextMenuHandler}
      onMouseDown={mouseDownHandler}
      onMouseMove={mouseMoveHandler}
      onMouseUp={mouseUpHandler}
      onMouseOut={ev => mouseUpHandler(ev, true)}
    />
  );
}
