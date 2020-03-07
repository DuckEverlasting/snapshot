import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import DrawSpace from '../components/DrawSpace';
import Layer from '../components/Layer';

import { updateWorkspaceSettings } from '../actions/redux';

const WorkspaceSC = styled.div`
  position: relative;
  display: flex;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: 3px solid black;
  overflow: hidden;
  z-index: 1;
  background: rgb(175, 175, 175);
`

const CanvasPaneSC = styled.div`
  position: relative;
  margin: auto;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  transform: translateX(${props => props.translateX}px) translateY(${props => props.translateY}px) scale(${props => props.zoomPct / 100});
  background: white;
  flex: none;
`

let animationFrame = 0;
let lastFrame = 0;

export default function Workspace() {
  const {canvasWidth, canvasHeight, width, height, translateX, translateY, zoomPct} = useSelector(state => state.workspaceSettings)
  const layerData = useSelector(state => state.layerData)
  const layerSettings = useSelector(state => state.layerSettings)
  const layerOrder = useSelector(state => state.layerOrder)

  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({x: null, y: null});

  const workspaceRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const reqFrame = requestAnimationFrame(updateAnimatedLayers);

    return () => cancelAnimationFrame(reqFrame);
  }, [])

  function updateAnimatedLayers() {
    const reqFrame = requestAnimationFrame(updateAnimatedLayers);
    animationFrame = reqFrame;
  }

  useEffect(() => {  
    const zoom = (amount) => {
      dispatch(updateWorkspaceSettings({zoomPct: zoomPct * amount}))
    }
    const translate = (deltaX, deltaY) => {
      dispatch(updateWorkspaceSettings({translateX: translateX + deltaX, translateY: translateY + deltaY}))
    }
    const mouseWheelHandler = async ev => {
      ev.preventDefault()
      if (ev.altKey) {
        let amount;
        if (ev.deltaY < 0) {
          amount = ev.shiftKey ? (3/2) : (10/9)
          zoom(amount)
          if (zoomPct * amount >= 100) {
            // HANDLE ZOOM IN STUFF
          }
        } else {
          amount = ev.shiftKey ? (2/3) : (9/10)
          zoom(amount)

          // Autocenter when zooming out
          if (zoomPct * amount <= 100) {
            dispatch(updateWorkspaceSettings({translateX: 0, translateY: 0}))
          }
        }
      } else {
        const str = ev.shiftKey ? 3 : 1;
        let dir;
        if (ev.deltaX && ev.deltaY) {
          // FIGURE THIS OUT LATER
          return
        } else if (ev.deltaX) {
          dir = ev.deltaX > 0 ? -1 : 1
          if (ev.ctrlKey) {
            translate(0, 10 * dir * str)
          } else {
            translate(10 * dir * str, 0)
          }
        } else if (ev.deltaY) {
          dir = ev.deltaY > 0 ? -1 : 1
          if (ev.ctrlKey) {
            translate(10 * dir * str, 0)
          } else {
            translate(0, 10 * dir * str)
          }
        }
      }
    }

    let workspaceElement = workspaceRef.current;
    workspaceElement.addEventListener("wheel", mouseWheelHandler)

    return () => workspaceElement.removeEventListener("wheel", mouseWheelHandler)
  }, [dispatch, translateX, translateY, zoomPct])

  const handleMouseDown = ev => {
    if (ev.button !== 1) return;
    setIsDragging(true);
    setDragOrigin({x: ev.nativeEvent.offsetX * (zoomPct / 100), y: ev.nativeEvent.offsetY * (zoomPct / 100)})
  }

  const handleMouseUp = ev => {
    if (ev.button !== 1) return;
    setIsDragging(false);
    setDragOrigin({x: null, y: null})
  }

  const handleMouseOut = ev => {
    if (isDragging) {
      setIsDragging(false);
      setDragOrigin({x: null, y: null})
    }
  }

  const handleMouseMove = ev => {
    if (!isDragging) return;
    if (animationFrame === lastFrame) return;
    lastFrame = animationFrame;
    const deltaX = dragOrigin.x - ev.nativeEvent.offsetX * (zoomPct / 100)
    const deltaY = dragOrigin.y - ev.nativeEvent.offsetY * (zoomPct / 100)
    dispatch(updateWorkspaceSettings({translateX: translateX - deltaX, translateY: translateY - deltaY}))
  }

  return(
    <WorkspaceSC ref={workspaceRef} width={width} height={height} frame={animationFrame}>
      <CanvasPaneSC onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseOut={handleMouseOut} onMouseMove={handleMouseMove} translateX={translateX} translateY={translateY} width={canvasWidth} height={canvasHeight} zoomPct={zoomPct}>
        <DrawSpace overrideCursor={isDragging ? "grabbing" : null} index={layerOrder.length + 2}/>
        <LayerRenderer layerOrder={layerOrder} layerData={layerData} layerSettings={layerSettings} width={canvasWidth} height={canvasHeight} />
      </CanvasPaneSC>
    </WorkspaceSC>    
  )
}

function LayerRenderer({layerOrder, layerData, layerSettings, width, height}) {
  // const [animationFrame, setAnimationFrame] = useState(0)

  // useEffect(() => {
  //   const reqFrame = requestAnimationFrame(updateAnimatedLayers);

  //   return () => cancelAnimationFrame(reqFrame);
  // }, [])

  // function updateAnimatedLayers() {
  //   const reqFrame = requestAnimationFrame(updateAnimatedLayers);
  //   setAnimationFrame(reqFrame)
  // }

  return (
    <>
      {
        layerOrder.length !== 0 &&
        layerOrder.map((layerId, i) => {
          let layerDat = layerData[layerId]
          let layerSet = layerSettings[layerId]
          return <Layer
            key={layerId}
            id={layerId}
            // frame={animationFrame}
            width={width}
            height={height}
            index={i + 1}
            data={layerDat.data}
            hidden={layerSet.hidden}
            opacity={layerSet.opacity}
            queue={layerDat.queue} />
        })
      }
    </>
  )
}