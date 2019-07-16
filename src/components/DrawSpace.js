import React from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import { updateLayerData, createLayer, deleteLayer } from "../actions";

const DrawSpaceSC = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0%;
  top: 0%;
  outline: none;
  z-index: ${props => props.index};
`;

let state = {
  mouseDown: false,
  origin: null
};

export default function DrawSpace(props) {
  const { activeTool, activeLayer, toolSettings } = useSelector(state => state);
  const dispatch = useDispatch();
  const { color, width } = toolSettings[activeTool];

  const handleMouseDown = ev => {
    if (activeLayer === null) return;
    let [x, y] = [ev.nativeEvent.offsetX, ev.nativeEvent.offsetY];
    state = {
      ...state,
      mouseDown: true,
      origin: [x, y]
    };
    switch (activeTool) {
      case "pencil":
        dispatch(createLayer(activeLayer, "temp"));
        return dispatch(
          updateLayerData("temp", {
            // drawLine(ctx, {orig, dest, width, color})
            action: "drawLine",
            params: {
              orig: state.origin,
              dest: [x, y],
              width: width,
              color: color
            }
          })
        );
      case "line":
        return dispatch(createLayer(activeLayer, "temp"));
      case "fillRect":
        return dispatch(createLayer(activeLayer, "temp"));
      case "drawRect":
        return dispatch(createLayer(activeLayer, "temp"));
      default:
        break;
    }
  };

  const handleMouseMove = ev => {
    if (!state.mouseDown) return;
    let [x, y] = [ev.nativeEvent.offsetX, ev.nativeEvent.offsetY];
    switch (activeTool) {
      case "pencil":
        return dispatch(
          updateLayerData("temp", {
            action: "continueLine",
            // continueLine(ctx, {dest})
            params: { dest: [x, y] }
          })
        );
      case "line":
        return dispatch(
          updateLayerData("temp", {
            // drawLine(ctx, {orig, dest, width, color})
            action: "drawLine",
            params: {
              orig: state.origin,
              dest: [x, y],
              width: width,
              color: color
            }
          })
        );
      case "fillRect":
        return dispatch(
          updateLayerData("temp", {
            // fillRect(ctx, {orig, dest, width, color})
            action: "fillRect",
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
          updateLayerData("temp", {
            // drawRect(ctx, {orig, dest, width, color})
            action: "drawRect",
            params: {
              orig: state.origin,
              dest: [x, y],
              width: width,
              color: color
            }
          })
        );
      default:
        break;
    }
  };

  const handleMouseUp = ev => {
    if (!state.mouseDown) return;
    state = {
      ...state,
      mouseDown: false
    };
    const [x, y] = [ev.nativeEvent.offsetX, ev.nativeEvent.offsetY];
    switch (activeTool) {
      case "pencil":
        break;
      case "line":
        dispatch(
          updateLayerData(activeLayer, {
            // drawLine(ctx, {orig, dest, width, color})
            action: "drawLine",
            params: {
              orig: state.origin,
              dest: [x, y],
              width: width,
              color: color
            }
          })
        );
        return dispatch(deleteLayer("temp"));
      case "fillRect":
        dispatch(
          updateLayerData(activeLayer, {
            // fillRect(ctx, {orig, dest, width, color})
            action: "fillRect",
            params: {
              orig: state.origin,
              dest: [x, y],
              width: width,
              color: color
            }
          })
        );
        return dispatch(deleteLayer("temp"));
      case "drawRect":
        dispatch(
          updateLayerData(activeLayer, {
            // drawRect(ctx, {orig, dest, width, color})
            action: "drawRect",
            params: {
              orig: state.origin,
              dest: [x, y],
              width: width,
              color: color
            }
          })
        );
        return dispatch(deleteLayer("temp"));
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
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseOut}
    />
  );
}
