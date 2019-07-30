import React from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import { addOpacity } from '../logic/colorConversion.js';
import { updateLayerQueue, createLayer, deleteLayer, updateColor } from "../actions";

const DrawSpaceSC = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0%;
  top: 0%;
  outline: none;
  cursor: ${props => props.cursor};
  z-index: ${props => props.index};
`;

let state = {
  mouseDown: false,
  origin: null,
  destArray: [],
  hold: false
};

export default function DrawSpace(props) {
  const { activeTool, activeLayer, toolSettings, layers, layerOrder } = useSelector(state => state);
  const { primary } = useSelector(state => state.colorSettings);
  const dispatch = useDispatch();
  const { opacity, width } = toolSettings[activeTool];
  const color = addOpacity(primary, opacity)

  const eyeDropper = (x, y, palette) => {
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
    switch (activeTool) {
      case "line": return "crosshair";
      case "fillRect": return "crosshair";
      case "drawRect": return "crosshair";
      case "selectRect": return "crosshair";
      case "move": return "move";
      default: return "auto";
    }
  }

  const contextMenuHandler = ev => {
    ev.preventDefault();
  }

  const mouseDownHandler = ev => {
    if (activeLayer === null || state.hold || ev.buttons > 1) return;
    if (layerOrder.includes("staging")) dispatch(deleteLayer("staging"))
    let [x, y] = [ev.nativeEvent.offsetX, ev.nativeEvent.offsetY];
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
      case "eraser":
        return dispatch(createLayer(activeLayer, "staging"));
      case "eyeDropper":
        return eyeDropper(x, y, ev.ctrlKey ? "secondary" : "primary")
      case "selectRect":
        return dispatch(createLayer(layerOrder.length, "staging"));
      case "move":
        break;
      default:
        break;
    }
  };

  const mouseMoveHandler = ev => {
    if (!state.mouseDown) return;
    let [x, y] = [ev.nativeEvent.offsetX, ev.nativeEvent.offsetY];
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
        dispatch(
          updateLayerQueue("staging", {
            action: "drawLine",
            type: "draw",
            params: {
              ...params,
              orig: state.destArray[state.destArray.length - 1] || state.origin
            }
          })
        );
        return state = {
          ...state,
          destArray: [...state.destArray, [x, y]]
        }
      case "brush":
        let num;
        if (width <= 5) num = 0
        else if (5 < width < 15) num = 1
        else if (15 <= width) num = 2

        dispatch(
          updateLayerQueue("staging", {
            action: "drawLine",
            type: "draw",
            params: {
              ...params,
              orig: state.destArray[state.destArray.length - 1] || state.origin,
              filter: `blur(${num}px)`
            }
          })
        );
        return state = {
          ...state,
          destArray: [...state.destArray, [x, y]]
        }
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
        return dispatch(
          updateLayerQueue("staging", {
            action: "fillRect",
            type: "draw",
            params: {
              ...params,
              clearFirst: true
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
      case "eraser":
        dispatch(
          updateLayerQueue("staging", {
            action: "drawLine",
            type: "draw",
            params: {
              ...params,
              orig: state.destArray[state.destArray.length - 1] || state.origin,
              strokeColor: "rgba(0, 0, 0, .5)"
            },
          })
        );
        return state = {
          ...state,
          destArray: [...state.destArray, [x, y]]
        }
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
        }
      default:
        break;
    }
  };

  const mouseUpHandler = ev => {
    if (!state.mouseDown) return;

    state = {
      ...state,
      mouseDown: false,
      hold: true
    }

    setTimeout(() => {
      state = {
        ...state,
        hold: false
      }
      dispatch(deleteLayer("staging"))
    }, 0)
    
    const [x, y] = [ev.nativeEvent.offsetX, ev.nativeEvent.offsetY];
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
        else if (5 < width < 15) num = 1
        else if (15 <= width) num = 2

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
      default:
        break;
    }
  };

  return (
    <DrawSpaceSC
      index={props.index}
      tabIndex="1"
      cursor={cursorHandler}
      onContextMenu={contextMenuHandler}
      onMouseDown={mouseDownHandler}
      onMouseMove={mouseMoveHandler}
      onMouseUp={mouseUpHandler}
      onMouseOut={mouseUpHandler}
    />
  );
}
