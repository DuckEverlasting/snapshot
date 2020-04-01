import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import { addOpacity, toArrayFromRgba } from "../utils/colorConversion.js";
import {
  getZoomAmount,
  midpoint,
  getQuadLength,
  getGradient,
  convertDestToRegularShape
} from "../utils/helpers";

import {
  updateColor,
  updateWorkspaceSettings,
  updateSelectionPath,
  updateStagingPosition,
  putHistoryData
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
`;

let state = {
  isDrawing: false,
  origin: null,
  destArray: [],
  hold: false,
  throttle: false,
  interrupt: false,
  lockedAxis: "",
  heldShift: false,
  tool: null
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
  const dispatch = useDispatch();

  useEffect(() => {
    if (state.isDrawing) {
      state = { ...state, interrupt: true };
    }
  }, [activeTool]);

  // useEffect(() => {
  //   if (props.mouseIsIn || !state.isDrawing) {return} 
  //   state = {
  //     ...state,
  //     interrupt: true
  //   }
  // }, [props.mouseIsIn])

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

  const moveStaging = (layer = activeLayer) => {
    dispatch(
      updateStagingPosition(layer)
    );
  };

  const contextMenuHandler = ev => {
    /* 
      Handles what happens when secondary mouse button is clicked. Currently set to do nothing.
    */

    ev.preventDefault();
  };

  // const handleMouseDown = ev => {

  // }

  const handleMouseUp = ev => {
    console.log("IS IT HERE?", layerData)
    if (state.isDrawing) {
      actionEnd(ev)
    }
  }

  const handleMouseOver = ev => {
    if (ev.buttons === 1) {
      if (!state.isDrawing) {
        actionStart(ev)
      } else {
        actionMove(ev, true)
      }
    }
  }

  const actionStart = ev => {
    /* 
      Handles what happens when mouse is pressed down.
    */

    if (activeLayer === null || state.hold || ev.buttons > 1) return;
    layerData.staging
      .getContext("2d")
      .clearRect(0, 0, layerData.staging.width, layerData.staging.height);
    const ctx = layerData[activeLayer].getContext("2d");

    let [x, y] = [
      ev.nativeEvent.offsetX,
      ev.nativeEvent.offsetY
    ];
    let viewWidth, viewHeight;
    state = {
      ...state,
      isDrawing: true,
      origin: {x, y},
      destArray: [{x, y}],
      lastMid: null,
      heldShift: ev.shiftKey,
      tool: activeTool
    };
    switch (state.tool) {
      case "pencil":
        moveStaging();
        break;
      case "brush":
        viewWidth = Math.ceil(ctx.canvas.width);
        viewHeight = Math.ceil(ctx.canvas.height);
        state = {
          ...state,
          prevImgData: ctx.getImageData(
            0,
            0,
            viewWidth,
            viewHeight
          )
        };
        break;
      case "line":
        moveStaging();
        break;
      case "fillRect":
        moveStaging();
        break;
      case "drawRect":
        moveStaging();
        break;
      case "fillEllipse":
        moveStaging();
        break;
      case "drawEllipse":
        moveStaging();
        break;
      case "eraser":
        viewWidth = Math.ceil(ctx.canvas.width);
        viewHeight = Math.ceil(ctx.canvas.height);
        state = {
          ...state,
          prevImgData: ctx.getImageData(
            0,
            0,
            viewWidth,
            viewHeight
          )
        };
        break;
      case "eyeDropper":
        let modifier = window.navigator.platform.includes("Mac")
          ? ev.metaKey
          : ev.ctrlKey;
        return eyeDropper(x, y, modifier ? "secondary" : "primary");
      case "selectRect":
        if (!state.heldShift) {
          manipulate(layerData.selection.getContext("2d"), {
            action: "clear",
            params: { selectionPath: null }
          });
        }
        moveStaging("selection");
        break;
      case "selectEllipse":
        if (!state.heldShift) {
          manipulate(layerData.selection.getContext("2d"), {
            action: "clear",
            params: { selectionPath: null }
          });
        }
        moveStaging("selection");
        break;
      case "lasso":
        if (!state.heldShift) {
          manipulate(layerData.selection.getContext("2d"), {
            action: "clear",
            params: { selectionPath: null }
          });
        }
        moveStaging("selection");
        break;
      case "move":
        viewWidth = Math.ceil(ctx.canvas.width);
        viewHeight = Math.ceil(ctx.canvas.height);
        state = {
          ...state,
          prevImgData: ctx.getImageData(
            0,
            0,
            viewWidth,
            viewHeight
          )
        };
        break;
      case "hand":
        break;
      case "zoom":
        break;
      case "TEST":
        break;
      default:
        break;
    }
  };

  const setLockedAxis = (x, y) => {
    /* 
      Determines which axis should be "locked" in certain functions.
    */

    if (Math.abs(state.origin.x - x) < Math.abs(state.origin.y - y)) {
      state = { ...state, lockedAxis: "x" };
    } else {
      state = { ...state, lockedAxis: "y" };
    }
  };

  const actionMove = (ev, newStroke) => {
    /* 
      Handles what happens when mouse is moved.
    */

    if (state.interrupt) {
      return actionEnd(ev);
    }
    if (!state.isDrawing) return;
    const { opacity, width, hardness } = toolSettings[state.tool];
    // Note conversion of opacity to 0 - 1 from 0 - 100 below.
    const color = addOpacity(primary, opacity / 100);
    let [x, y] = [
      ev.nativeEvent.offsetX,
      ev.nativeEvent.offsetY
    ];

    // Default parameters
    let params = {
      orig: state.origin,
      dest: state.destArray[state.destArray.length - 1],
      destArray: [{x, y}],
      width: width,
      strokeColor: color,
      fillColor: color,
      clip: selectionPath,
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
          x = state.origin.x;
        } else if (state.lockedAxis === "y") {
          y = state.origin.y;
        }

        draw(ctx, {
          action: "drawQuad",
          params: {
            ...params,
            destArray: [...state.destArray, {x, y, newStroke}],
            clearFirst: true
          }
        });
        return (state = {
          ...state,
          destArray: [...state.destArray, {x, y, newStroke}]
        });

      case "brush":
        const lastBrushDest = newStroke ? {x, y} :
          state.destArray[state.destArray.length - 1] || state.origin;

        const lastBrushMid = newStroke ? {x, y} : state.lastMid || state.origin;

        if (state.lockedAxis === "x") {
          x = state.origin.x;
        } else if (state.lockedAxis === "y") {
          y = state.origin.y;
        }

        const newBrushMid = midpoint(lastBrushDest, {x, y});

        if (
          getQuadLength(
            lastBrushMid,
            lastBrushDest,
            newBrushMid
          ) <
          width * 0.125
        ) {
          return;
        }

        const brushGrad = getGradient(color, opacity, hardness);

        draw(layerData[activeLayer].getContext("2d"), {
          action: "drawQuadPoints",
          params: {
            ...params,
            orig: state.lastMid || state.origin,
            destArray: [lastBrushDest, newBrushMid],
            gradient: brushGrad,
            density: 0.125,
            clearFirst: false
          }
        });
        return (state = {
          ...state,
          destArray: [...state.destArray, {x, y}],
          lastMid: newBrushMid
        });

      case "line":
        draw(ctx, {
          action: "drawLine",
          params: {
            ...params,
            clearFirst: true
          }
        });
        
        state = {
          ...state,
          destArray: [{x, y}]
        }
        break;

      case "fillRect":
        if (ev.shiftKey) { 
          params = {
            ...params,
            dest: convertDestToRegularShape(state.origin, {x, y})
          } 
        }

        draw(ctx, {
          action: "fillRect",
          params: {
            ...params,
            clearFirst: true,
          }
        });
        
        state = {
          ...state,
          destArray: [{x, y}]
        }
        break;

      case "drawRect":
        if (ev.shiftKey) { 
          params = {
            ...params,
            dest: convertDestToRegularShape(state.origin, {x, y})
          } 
        }

        draw(ctx, {
          action: "drawRect",
          params: {
            ...params,
            clearFirst: true
          }
        });
        
        state = {
          ...state,
          destArray: [{x, y}]
        }
        break;

      case "fillEllipse":
        if (ev.shiftKey) { 
          params = {
            ...params,
            dest: convertDestToRegularShape(state.origin, {x, y})
          } 
        }

        draw(ctx, {
          action: "fillEllipse",
          params: {
            ...params,
            clearFirst: true
          }
        });
        
        state = {
          ...state,
          destArray: [{x, y}]
        }
        break;

      case "drawEllipse":
        if (ev.shiftKey) { 
          params = {
            ...params,
            dest: convertDestToRegularShape(state.origin, {x, y})
          } 
        }

        draw(ctx, {
          action: "drawEllipse",
          params: {
            ...params,
            clearFirst: true
          }
        });
        
        state = {
          ...state,
          destArray: [{x, y}]
        }
        break;

      case "eraser":
        const lastEraserDest = newStroke ? {x, y} :
          state.destArray[state.destArray.length - 1] || state.origin;

        const lastEraserMid = newStroke ? {x, y} : state.lastMid || state.origin;

        const newEraserMid = midpoint(lastEraserDest, {x, y});

        if (
          getQuadLength(
            lastEraserMid,
            lastEraserDest,
            newEraserMid
          ) <
          width * 0.125
        ) {
          return;
        }

        const eraserGrad = getGradient("rgba(0, 0, 0, 1)", 100, hardness);

        if (state.lockedAxis === "x") {
          x = state.origin.x;
        } else if (state.lockedAxis === "y") {
          y = state.origin.y;
        }

        draw(layerData[activeLayer].getContext("2d"), {
          action: "drawQuadPoints",
          params: {
            ...params,
            orig: state.lastMid || state.origin,
            destArray: [lastEraserDest, newEraserMid],
            gradient: eraserGrad,
            density: 0.125,
            clearFirst: false,
            composite: "destination-out"
          }
        });
        return (state = {
          ...state,
          destArray: [...state.destArray, {x, y}],
          lastMid: newEraserMid
        });

      case "eyeDropper":
        let modifier = window.navigator.platform.includes("Mac")
          ? ev.metaKey
          : ev.ctrlKey;
        return eyeDropper(x, y, modifier ? "secondary" : "primary");

      case "selectRect":
        if (ev.shiftKey) { 
          params = {
            ...params,
            dest: convertDestToRegularShape(state.origin, {x, y})
          } 
        }

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
        
        state = {
          ...state,
          destArray: [{x, y}]
        }
        break;

      case "selectEllipse":
        if (ev.shiftKey) { 
          params = {
            ...params,
            dest: convertDestToRegularShape(state.origin, {x, y})
          } 
        }

        draw(ctx, {
          action: "drawEllipse",
          params: {
            ...params,
            width: 1,
            strokeColor: "rgba(0, 0, 0, 1)",
            dashPattern: [5, 10],
            clearFirst: true,
            clip: null
          }
        });

        state = {
          ...state,
          destArray: [{x, y}]
        }
        break;

      case "lasso":
        if (state.lockedAxis === "x") {
          x = state.origin.x;
        } else if (state.lockedAxis === "y") {
          y = state.origin.y;
        }

        draw(ctx, {
          action: "drawQuad",
          params: {
            ...params,
            destArray: [...state.destArray, {x, y}],
            width: 1,
            strokeColor: "rgba(0, 0, 0, 1)",
            dashPattern: [5, 10],
            clearFirst: true,
            clip: null
          }
        });
        return (state = {
          ...state,
          destArray: [...state.destArray, {x, y}]
        });

      case "move":
        if (state.throttle) break;

        state = { ...state, throttle: true };
        setTimeout(() => {
          state = { ...state, throttle: false };
        }, 25);

        manipulate(layerData[activeLayer].getContext("2d"), {
          action: "move",
          params: {
            ...params,
            orig: state.destArray[state.destArray.length - 1] || state.origin
          }
        });
        return (state = {
          ...state,
          destArray: [...state.destArray, {x, y}]
        });

      case "hand":
        if (state.throttle) break;

        state = { ...state, throttle: true };
        setTimeout(() => {
          state = { ...state, throttle: false };
        }, 25);

        const deltaX = state.origin.x - (ev.nativeEvent.offsetX);
        const deltaY =
          state.origin.y - (ev.nativeEvent.offsetY);
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

  const actionEnd = (ev, mouseOut = false) => {
    /* 
      Handles what happens when mouse is released.
    */

    if (!state.isDrawing) return;

    const { opacity, width, tolerance } = toolSettings[state.tool];
    // Note conversion of opacity to 0 - 1 from 0 - 100 below.
    const color = addOpacity(primary, opacity / 100);
    const colorArray = toArrayFromRgba(primary, opacity / 100);

    state = {
      ...state,
      isDrawing: false,
      hold: true,
      interrupt: false
    };

    let params = {
      orig: state.origin,
      dest: state.destArray[state.destArray.length - 1],
      destArray: state.destArray,
      width: width,
      strokeColor: color,
      fillColor: color,
      clip: selectionPath
    };

    let ctx = layerData[activeLayer].getContext("2d");
    let path;


    switch (state.tool) {
      case "pencil":
        if (state.destArray.length) {
          dispatch(
            putHistoryData(activeLayer, ctx, () =>
              draw(ctx, {
                action: "drawQuad",
                params
              })
            )
          );
        }
        break;

      case "brush":
        dispatch(putHistoryData(activeLayer, ctx, null, state.prevImgData));
        state = { ...state, lastMid: null, prevImgData: null };
        break;

      case "line":
        dispatch(
          putHistoryData(activeLayer, ctx, () =>
            draw(ctx, {
              action: "drawLine",
              params
            })
          )
        );
        break;

      case "fillRect": 
      if (ev.shiftKey) { 
        params = {
          ...params,
          dest: convertDestToRegularShape(state.origin, params.dest)
        } 
      }

        dispatch(
          putHistoryData(activeLayer, ctx, () =>
            draw(ctx, {
              action: "fillRect",
              params
            })
          )
        );
        break;

      case "drawRect":
        if (ev.shiftKey) { 
          params = {
            ...params,
            dest: convertDestToRegularShape(state.origin, params.dest)
          } 
        }

        dispatch(
          putHistoryData(activeLayer, ctx, () =>
            draw(ctx, {
              action: "drawRect",
              params
            })
          )
        );
        break;

      case "fillEllipse":
        if (ev.shiftKey) { 
          params = {
            ...params,
            dest: convertDestToRegularShape(state.origin, params.dest)
          } 
        }

        dispatch(
          putHistoryData(activeLayer, ctx, () =>
            draw(ctx, {
              action: "fillEllipse",
              params
            })
          )
        );
        break;

      case "drawEllipse":
        if (ev.shiftKey) { 
          params = {
            ...params,
            dest: convertDestToRegularShape(state.origin, params.dest)
          } 
        }

        dispatch(
          putHistoryData(activeLayer, ctx, () =>
            draw(ctx, {
              action: "drawEllipse",
              params
            })
          )
        );
        break;

      case "eraser":
        dispatch(putHistoryData(activeLayer, ctx, null, state.prevImgData));
        state = { ...state, lastMid: null, prevImgData: null };
        break;

      case "eyeDropper":
        break;

      case "bucketFill":
        dispatch(
          putHistoryData(activeLayer, ctx, () =>
            manipulate(ctx, {
              action: "fill",
              params: {
                orig: state.origin,
                colorArray,
                tolerance,
                clip: selectionPath
              }
            })
          )
        );
        break;

      case "selectRect":
        if (ev.shiftKey) { 
          params = {
            ...params,
            dest: convertDestToRegularShape(state.origin, params.dest)
          } 
        }

        if (
          params.orig.x === params.dest.x &&
          params.orig.y === params.dest.y
        ) {
          path = null;
        } else if (selectionPath !== null && state.heldShift) {
          path = new Path2D(selectionPath);
        } else {
          path = new Path2D();
        }
        path = selection(path, { action: "drawRect", params });
        dispatch(
          putHistoryData("selection", layerData.selection.getContext("2d"), () =>
            draw(layerData.selection.getContext("2d"), {
              action: "drawRect",
              params: {
                ...params,
                width: 1,
                strokeColor: "rgba(0, 0, 0, 1)",
                dashPattern: [5, 10],
                clip: null
              }
            })
          )
        );
        dispatch(updateSelectionPath(path));
        break;

      case "selectEllipse":
        if (ev.shiftKey) { 
          params = {
            ...params,
            dest: convertDestToRegularShape(state.origin, params.dest)
          } 
        }

        if (
          params.orig.x === params.dest.x &&
          params.orig.y === params.dest.y
        ) {
          path = null;
        } else if (selectionPath !== null && state.heldShift) {
          path = new Path2D(selectionPath);
        } else {
          path = new Path2D();
        }
        path = selection(path, { action: "drawEllipse", params });
        dispatch(
          putHistoryData("selection", layerData.selection.getContext("2d"), () =>
            draw(layerData.selection.getContext("2d"), {
              action: "drawEllipse",
              params: {
                ...params,
                width: 1,
                strokeColor: "rgba(0, 0, 0, 1)",
                dashPattern: [5, 10],
                clip: null
              }
            })
          )
        );
        dispatch(updateSelectionPath(path));
        break;

      case "lasso":
        if (
          params.orig.x === params.dest.x &&
          params.orig.y === params.dest.y
        ) {
          path = null;
        } else {
          if (selectionPath !== null && state.heldShift) {
            path = new Path2D(selectionPath);
          } else {
            path = new Path2D();
          }
          path = selection(path, { action: "drawQuadPath", params });
          dispatch(
            putHistoryData("selection", layerData.selection.getContext("2d"), () =>
              draw(layerData.selection.getContext("2d"), {
                action: "drawQuadPath",
                params: {
                  ...params,
                  width: 1,
                  strokeColor: "rgba(0, 0, 0, 1)",
                  dashPattern: [5, 10],
                  clip: null
                }
              })
            )
          );
        }
        dispatch(updateSelectionPath(path));
        break;

      case "move":
        dispatch(putHistoryData(activeLayer, ctx, null, state.prevImgData));
        state = { ...state, lastMid: null, prevImgData: null };
        break;

      case "hand":
        break;

      case "zoom":
        if (mouseOut) break;
        dispatch(
          updateWorkspaceSettings({
            zoomPct: ev.altKey
              ? getZoomAmount(-1, zoomPct)
              : getZoomAmount(1, zoomPct)
          })
        );
        break;

      default:
        break;
    }

    state = {
      ...state,
      hold: false,
      tool: null,
      lockedAxis: ""
    };
    layerData.staging
      .getContext("2d")
      .clearRect(0, 0, layerData.staging.width, layerData.staging.height);
  };

  return (
    <DrawSpaceSC
      index={props.index}
      tabIndex="1"
      onContextMenu={contextMenuHandler}
      onMouseDown={actionStart}
      onMouseMove={actionMove}
      onMouseUp={actionEnd}
      // onMouseLeave={ev => {
      //   actionMove(ev)
      //   actionEnd(ev, true)
      // }}
      onMouseOver={handleMouseOver}
    />
  );
}
