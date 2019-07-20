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

  const colorPicker = (x, y, palette) => {
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

  const handleMouseDown = ev => {
    if (activeLayer === null || state.hold) return;
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
      case "line":
        return dispatch(createLayer(activeLayer, "staging"));
      case "fillRect":
        return dispatch(createLayer(activeLayer, "staging"));
      case "drawRect":
        return dispatch(createLayer(activeLayer, "staging"));
      case "eraser":
        return dispatch(createLayer(activeLayer, "staging"));
      case "eyeDropper":
        return colorPicker(x, y, ev.ctrlKey ? "secondary" : "primary")
      default:
        break;
    }
  };

  const handleMouseMove = ev => {
    if (!state.mouseDown ) return;
    let [x, y] = [ev.nativeEvent.offsetX, ev.nativeEvent.offsetY];
    switch (activeTool) {
      case "pencil":
        dispatch(
          updateLayerQueue("staging", {
            // drawLine(ctx, {orig, destArray, width, color})
            action: "drawLine",
            type: "draw",
            params: {
              orig: state.destArray[state.destArray.length - 1] || state.origin,
              destArray: [[x, y]],
              width: width,
              color: color
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
            // drawLine(ctx, {orig, destArray, width, color})
            action: "drawLine",
            type: "draw",
            params: {
              orig: state.origin,
              destArray: [[x, y]],
              width: width,
              color: color
            },
            clearFirst: true
          })
        );
      case "fillRect":
        return dispatch(
          updateLayerQueue("staging", {
            // fillRect(ctx, {orig, dest, width, color})
            action: "fillRect",
            type: "draw",
            params: {
              orig: state.origin,
              dest: [x, y],
              width: width,
              color: color
            },
            clearFirst: true
          })
        );
      case "drawRect":
        return dispatch(
          updateLayerQueue("staging", {
            // drawRect(ctx, {orig, dest, width, color})
            action: "drawRect",
            type: "draw",
            params: {
              orig: state.origin,
              dest: [x, y],
              width: width,
              color: color
            },
            clearFirst: true
          })
        );
      case "eraser":
        dispatch(
          updateLayerQueue("staging", {
            // drawLine(ctx, {orig, destArray, width, color})
            action: "drawLine",
            type: "draw",
            params: {
              orig: state.destArray[state.destArray.length - 1] || state.origin,
              destArray: [[x, y]],
              width: width,
              color: "rgba(0, 0, 0, .5)"
            },
          })
        );
        return state = {
          ...state,
          destArray: [...state.destArray, [x, y]]
        }
      case "eyeDropper":
        return colorPicker(x, y, ev.ctrlKey ? "secondary" : "primary");
      default:
        break;
    }
  };

  const handleMouseUp = ev => {
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
    switch (activeTool) {
      case "pencil":
        return dispatch(
          updateLayerQueue(activeLayer, {
            // drawLine(ctx, {orig, dest, width, color})
            action: "drawLine",
            type: "draw",
            params: {
              orig: state.origin,
              destArray: state.destArray,
              width: width,
              color: color
            }
          })
        );
      case "line":
        return dispatch(
          updateLayerQueue(activeLayer, {
            // drawLine(ctx, {orig, dest, width, color})
            action: "drawLine",
            type: "draw",
            params: {
              orig: state.origin,
              destArray: [[x, y]],
              width: width,
              color: color
            }
          })
        );
      case "fillRect":
        return dispatch(
          updateLayerQueue(activeLayer, {
            // fillRect(ctx, {orig, dest, width, color})
            action: "fillRect",
            type: "draw",
            params: {
              orig: state.origin,
              dest: [x, y],
              width: width,
              color: color
            }
          })
        );
      case "drawRect":
        return dispatch(
          updateLayerQueue(activeLayer, {
            // drawRect(ctx, {orig, dest, width, color})
            action: "drawRect",
            type: "draw",
            params: {
              orig: state.origin,
              dest: [x, y],
              width: width,
              color: color
            }
          })
        );
      case "eraser":
        return dispatch(
          updateLayerQueue(activeLayer, {
            // drawLine(ctx, {orig, dest, width, color})
            action: "drawLine",
            type: "draw",
            params: {
              orig: state.origin,
              destArray: state.destArray,
              width: width,
              color: "rgba(0, 0, 0, 1)"
            },
            composite: "destination-out"
          })
        );
      case "eyeDropper":
        break;
      default:
        break;
    }
  };

  const handleMouseOut = ev => {
    handleMouseUp(ev);
  };

  return (
    <DrawSpaceSC
      index={props.index}
      tabIndex="1"
      cursor={cursorHandler}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseOut}
    />
  );
}
