import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch } from "react-redux";
import { updateLayerData, updateAfterUndo, updateAfterRedo } from '../actions/redux'

import draw from "../reducers/custom/drawingReducer.js";
import manipulate from "../reducers/custom/manipulateReducer.js";

import { getDiff } from "../actions/custom/ctxActions"

const LayerWrapperSC = styled.div.attrs(props => ({
  style: {
    width: `${props.width}px`,
    height: `${props.height}px`
  }
}))`
  position: absolute;
  overflow: hidden;
`

const LayerSC = styled.canvas.attrs(props => ({
  style: {
    visibility: props => props.hidden ? "hidden" : "visible",
    zIndex: props.index
  }
}))`
  position: absolute;
  width: 300%;
  height: 300%;
  bottom: -100%;
  right: -100%;
  image-rendering: pixelated;
`

function Layer(props) {
  const canvasRef = useRef(null)
  const dispatch = useDispatch();
  // const [lastFrame, setLastFrame] = useState(props.frame)

  useEffect(() => {
    dispatch(updateLayerData(props.id, canvasRef.current, true, true));
  })

  useEffect(() => {
    // if (lastFrame === props.frame) return;
    // setLastFrame(props.frame);
    let queue = props.queue;
    if (queue === null) return;
    if (queue.type === "draw") drawHandler(queue)
    else if (queue.type === "manipulate") manipulateHandler(queue)
  }, [props.queue, props.id]);

  function drawHandler(queue) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    draw(ctx, queue);
    // if (!queue.params.ignoreHistory) {
    //   dispatch(updateLayerData(props.id, canvasRef.current));
    // }   
  }

  function manipulateHandler(queue) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const result = manipulate(ctx, queue);
    if (queue.params.changeData) {
      if (queue.params.direction === "undo") {
        return dispatch(updateAfterUndo(props.id, result))
      } else if (queue.params.direction === "redo") {
        return dispatch(updateAfterRedo(props.id, result))
      }
    };
    // if (!queue.params.ignoreHistory) {
    //   dispatch(updateLayerData(props.id, canvasRef.current, queue.params.prevCtx));
    // }    
  };

  return <LayerWrapperSC width={props.width} height={props.height}>
    <LayerSC width={props.width * 3} height={props.height * 3} hidden={props.hidden} index={props.index} ref={canvasRef} />
  </LayerWrapperSC>
}

export default React.memo(Layer)