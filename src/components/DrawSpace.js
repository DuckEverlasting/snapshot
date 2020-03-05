import React from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import pencilImg from "../cursors/pencil.png"
import dropperImg from "../cursors/dropper.png"

import { addOpacity } from '../logic/colorConversion.js';
import { updateLayerQueue, createLayer, deleteLayer, updateColor, updateWorkspaceSettings } from "../actions";

const DrawSpaceSC = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  outline: none;
  cursor: ${props => props.cursorHandler};
  z-index: ${props => props.index};
`;

let state = {
  mouseDown: false,
  origin: null,
  destArray: [],
  hold: false,
  lockedAxis: ""
};

export default function DrawSpace(props) {
  const { activeTool, activeLayer, toolSettings, layers, layerOrder } = useSelector(state => state);
  const { primary } = useSelector(state => state.colorSettings);
  const { zoomPct, translateX, translateY, canvasWidth, canvasHeight } = useSelector(state => state.workspaceSettings);
  const dispatch = useDispatch();
  const { opacity, width } = toolSettings[activeTool];
  // Note conversion of opacity to 0 - 1 from 0 - 100 below.
  const color = addOpacity(primary, opacity / 100)

  const eyeDropper = (x, y, palette) => {
    /* 
      Separate function to handle the Eye Dropper tool. (Doesn't go through the standard draw reducer.)
    */

    let color;
    for (let i = layerOrder.length - 1; i >= 0; i--) {
      let ctx = layers.filter(layer => layer.id === layerOrder[i])[0].ctx;
      const pixel = ctx.getImageData(x, y, 1, 1);
      const data = pixel.data;
      if (data[3] === 0) {
        continue;
      } else {
        color = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${(data[3] / 255)})`;
        break;
      }
    }
    if (color !== undefined) dispatch(updateColor(palette, color));
  }

  const cursorHandler = () => () => {
    /* 
      Callback that handles which cursor is displayed over the component.
    */

    if (props.overrideCursor !== null) {
      return props.overrideCursor
    }

    switch (activeTool) {
      case "pencil": return `url(${pencilImg}) -22 22, auto`;
      case "line": return "crosshair";
      case "fillRect": return "crosshair";
      case "drawRect": return "crosshair";
      case "selectRect": return "crosshair";
      case "eyeDropper": return `url(${dropperImg}) -22 22, auto`;
      case "move": return "move";
      case "hand": return "grab";
      case "zoom": return "zoom-in";
      default: return "auto";
    }
  }

  const contextMenuHandler = ev => {
    /* 
      Handles what happens when secondary mouse button is clicked. Currently set to do nothing.
    */

    ev.preventDefault();
  }

  const mouseDownHandler = ev => {
    /* 
      Handles what happens when mouse is pressed down.
    */
    if (activeLayer === null || state.hold || ev.buttons > 1) return;
    if (layerOrder.includes("staging")) dispatch(deleteLayer("staging"))
    let [x, y] = [ev.nativeEvent.offsetX + canvasWidth, ev.nativeEvent.offsetY + canvasHeight];
    state = {
      ...state,
      mouseDown: true,
      origin: [x, y],
      destArray: []
    };
    switch (activeTool) {
      case "pencil":
        return dispatch(createLayer(activeLayer, "staging"));
      case "brush":
        return dispatch(createLayer(activeLayer, "staging"));
      case "line":
        return dispatch(createLayer(activeLayer, "staging"));
      case "fillRect":
        return dispatch(createLayer(activeLayer, "staging"));
      case "drawRect":
        return dispatch(createLayer(activeLayer, "staging"));
      case "fillCirc":
        return dispatch(createLayer(activeLayer, "staging"));
      case "drawCirc":
        return dispatch(createLayer(activeLayer, "staging"));
      case "eraser":
        return dispatch(createLayer(activeLayer, "staging"));
      case "eyeDropper":
        return eyeDropper(x, y, ev.ctrlKey ? "secondary" : "primary")
      case "selectRect":
        return dispatch(createLayer(layerOrder.length, "staging"));
      case "move":
        break;
      case "hand":
        break;
      case "zoom":
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
      state = {...state, lockedAxis: "x"}
    } else {
      state = {...state, lockedAxis: "y"}
    }
  }

  const mouseMoveHandler = ev => {
    /* 
      Handles what happens when mouse is moved.
    */

    if (!state.mouseDown) return;
    let [x, y] = [ev.nativeEvent.offsetX + canvasWidth, ev.nativeEvent.offsetY + canvasHeight];

    // Default parameters
    let params = {
      orig: state.origin,
      dest: [x, y],
      destArray: [[x, y]],
      width: width,
      strokeColor: color,
      fillColor: color
    };

    if (state.lockedAxis && !ev.shiftKey) {
      state = {...state, lockedAxis: ""}
    }

    if (!state.lockedAxis && ev.shiftKey) {
      setLockedAxis(x, y)
    }

    switch (activeTool) {
      case "pencil":
        if (state.lockedAxis === "x") {
          x = state.origin[0]
        } else if (state.lockedAxis === "y") {
          y = state.origin[1]
        };

        dispatch(
          updateLayerQueue("staging", {
            action: "drawLine",
            type: "draw",
            params: {
              ...params,
              orig: state.destArray[state.destArray.length - 1] || state.origin,
              destArray: [[x, y]],
            }
          })
        );
        return state = {
          ...state,
          destArray: [...state.destArray, [x, y]]
        };

      case "brush":
        let num;
        if (width <= 5) num = 0
        else num = 1

        if (state.lockedAxis === "x") {
          x = state.origin[0]
        } else if (state.lockedAxis === "y") {
          y = state.origin[1]
        };

        dispatch(
          updateLayerQueue("staging", {
            action: "drawLine",
            type: "draw",
            params: {
              ...params,
              orig: state.destArray[state.destArray.length - 1] || state.origin,
              destArray: [[x, y]],
              filter: `blur(${num}px)`
            }
          })
        );
        return state = {
          ...state,
          destArray: [...state.destArray, [x, y]]
        };

      case "line":
        return dispatch(
          updateLayerQueue("staging", {
            action: "drawLine",
            type: "draw",
            params: {
              ...params,
              clearFirst: true
            },
          })
        );

      case "fillRect":
        if (ev.shiftKey) {
          if (Math.abs(state.origin[0] - x) < Math.abs(state.origin[1] - y)) {
            x = y;
          } else {
            y = x;
          };
        };

        return dispatch(
          updateLayerQueue("staging", {
            action: "fillRect",
            type: "draw",
            params: {
              ...params,
              clearFirst: true,
              dest: [x, y]
            },
          })
        );

      case "drawRect":
        return dispatch(
          updateLayerQueue("staging", {
            action: "drawRect",
            type: "draw",
            params: {
              ...params,
              clearFirst: true
            },
          })
        );

      case "fillCirc":
        return dispatch(
          updateLayerQueue("staging", {
            action: "fillCirc",
            type: "draw",
            params: {
              ...params,
              clearFirst: true
            },
          })
        );

      case "drawCirc":
        return dispatch(
          updateLayerQueue("staging", {
            action: "drawCirc",
            type: "draw",
            params: {
              ...params,
              clearFirst: true
            },
          })
        );

      case "eraser":
        if (state.lockedAxis === "x") {
          x = state.origin[0]
        } else if (state.lockedAxis === "y") {
          y = state.origin[1]
        };

        dispatch(
          updateLayerQueue("staging", {
            action: "drawLine",
            type: "draw",
            params: {
              ...params,
              orig: state.destArray[state.destArray.length - 1] || state.origin,
              destArray: [[x, y]],
              strokeColor: "rgba(0, 0, 0, .5)"
            },
          })
        );
        return state = {
          ...state,
          destArray: [...state.destArray, [x, y]]
        };

      case "eyeDropper":
        return eyeDropper(x, y, ev.ctrlKey ? "secondary" : "primary");

      case "selectRect":
        return dispatch(
          updateLayerQueue("staging", {
            action: "drawRect",
            type: "draw",
            params: {
              ...params,
              width: 1,
              strokeColor: "rgba(0, 0, 0, 1)",
              dashPattern: [5, 10],
              clearFirst: true
            },
          })
        );

      case "move":
        dispatch(
          updateLayerQueue(activeLayer, {
            action: "move",
            type: "manipulate",
            params: {
              ...params,
              orig: state.destArray[state.destArray.length - 1] || state.origin,
            }
          })
        );
        return state = {
          ...state,
          destArray: [...state.destArray, [x, y]]
        };
        
      case "hand":
        const deltaX = state.origin[0] - ev.nativeEvent.offsetX
        const deltaY = state.origin[1] - ev.nativeEvent.offsetY
        dispatch(updateWorkspaceSettings({translateX: translateX - deltaX, translateY: translateY - deltaY}));

      case "zoom":
        break;

      default:
        break;
    }
  };

  const mouseUpHandler = (ev, mouseOut=false) => {
    /* 
      Handles what happens when mouse is released.
    */

    if (!state.mouseDown) return;

    state = {
      ...state,
      mouseDown: false,
      hold: true
    };

    setTimeout(() => {
      state = {
        ...state,
        hold: false
      };
      dispatch(deleteLayer("staging"))
    }, 0);
    
    const [x, y] = [ev.nativeEvent.offsetX + canvasWidth, ev.nativeEvent.offsetY + canvasHeight];
    let params = {
      orig: state.origin,
      dest: [x, y],
      destArray: [[x, y]],
      width: width,
      strokeColor: color,
      fillColor: color
    };
    
    switch (activeTool) {
      case "pencil":
        console.log(params)
        if (params.orig[0] === params.dest[0] && params.orig[1] === params.dest[1]) {
          return dispatch(
            updateLayerQueue(activeLayer, {
              action: "fillRect",
              type: "draw",
              params: {
                ...params,
                orig: [params.orig[0] - .5 * params.width, params.orig[1] - .5 * params.width],
                dest: [params.dest[0] + .5 * params.width, params.dest[1] + .5 * params.width]
              }
            })
          );
        } else {
          return dispatch(
            updateLayerQueue(activeLayer, {
              action: "drawLine",
              type: "draw",
              params: {
                ...params,
                destArray: state.destArray
              }
            })
          );
        }

      case "brush":
        // async function brushFeather(quality) {
        //   for (let i = 1; i <= quality; i++) {
        //     await dispatch(
        //       updateLayerQueue(activeLayer, {
        //         action: "drawLine",
        //         type: "draw",
        //         params: {
        //           ...params,
        //           width: width * (1.25 - ((1 / (quality - 1)) * (i - 1))),
        //           strokeColor: addOpacity(primary, opacity * (1/quality) * i),
        //           destArray: state.destArray
        //         }
        //       })
        //     );
        //   }
        // }
        // return brushFeather(50);
        let num;
        if (width <= 5) num = 0
        else num = 1

        return dispatch(
          updateLayerQueue(activeLayer, {
            action: "drawLine",
            type: "draw",
            params: {
              ...params,
              destArray: state.destArray,
              filter: `blur(${num}px)`
            }
          })
        );

      case "line":
        return dispatch(
          updateLayerQueue(activeLayer, {
            action: "drawLine",
            type: "draw",
            params: { ...params }
          })
        );

      case "fillRect":
        return dispatch(
          updateLayerQueue(activeLayer, {
            action: "fillRect",
            type: "draw",
            params: { ...params }
          })
        );

      case "drawRect":
        return dispatch(
          updateLayerQueue(activeLayer, {
            action: "drawRect",
            type: "draw",
            params: { ...params }
          })
        );

      case "fillCirc":
        return dispatch(
          updateLayerQueue(activeLayer, {
            action: "fillCirc",
            type: "draw",
            params: { ...params }
          })
        );

      case "drawCirc":
        return dispatch(
          updateLayerQueue(activeLayer, {
            action: "drawCirc",
            type: "draw",
            params: { ...params }
          })
        );

      case "eraser":
        return dispatch(
          updateLayerQueue(activeLayer, {
            action: "drawLine",
            type: "draw",
            params: {
              ...params,
              destArray: state.destArray,
              strokeColor: "rgba(0, 0, 0, 1)",
              composite: "destination-out"
            },
          })
        );

      case "eyeDropper":
        break;

      case "selectRect":
        return dispatch(
          updateLayerQueue("selection", {
            action: "drawRect",
            type: "draw",
            params: {
              ...params,
              width: 1,
              strokeColor: "rgba(0, 0, 0, 1)",
              dashPattern: [5, 10]
            }
          })
        );

      case "move":
        break;

      case "hand":
        break;

      case "zoom":
        if (mouseOut) break;
        return dispatch(updateWorkspaceSettings({zoomPct: zoomPct * (ev.altKey ? 2/3 : 3/2)}));

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
