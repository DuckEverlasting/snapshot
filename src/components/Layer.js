import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useDispatch } from "react-redux";
import { updateLayerData } from '../actions/redux'

import draw from "../reducers/custom/drawingReducer.js";
import manipulate from "../reducers/custom/manipulateReducer.js";

const LayerWrapperSC = styled.div`
  position: absolute;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  overflow: hidden;
`

const LayerSC = styled.canvas`
  position: absolute;
  visibility: ${props => props.hidden ? "hidden" : "visible"};
  width: 300%;
  height: 300%;
  bottom: -100%;
  right: -100%;
  image-rendering: pixelated;
  z-index: ${props => props.index};
`

function Layer(props) {
  const canvasRef = useRef(null)
  const dispatch = useDispatch();
  // const [lastFrame, setLastFrame] = useState(props.frame)

  useEffect(() => {
    // if (lastFrame === props.frame) return;
    // setLastFrame(props.frame);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let queue = props.queue;
    if (queue === null) return;
    if (queue.type === "draw") drawHandler(ctx, queue)
    if (queue.type === "manipulate") manipulateHandler(ctx, queue)
  }, [props.data, props.queue, props.id]);

  function drawHandler(ctx, queue) {
    draw(ctx, queue);
    dispatch(updateLayerData(props.id, canvasRef.current))
  }

  function manipulateHandler(ctx, queue) {
    manipulate(ctx, queue);
    dispatch(updateLayerData(props.id, canvasRef.current))
  }

  return <LayerWrapperSC width={props.width} height={props.height}>
    <LayerSC width={props.width * 3} height={props.height * 3} hidden={props.hidden} index={props.index} ref={canvasRef} />
  </LayerWrapperSC>
}

export default React.memo(Layer)