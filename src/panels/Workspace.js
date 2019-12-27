import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import DrawSpace from '../components/DrawSpace';
import Layer from '../components/Layer';

import { updateWorkspaceSettings } from '../actions';

const WorkspaceSC = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: 3px solid black;
  overflow: auto;
  z-index: 1;
  background: rgb(175, 175, 175);
`

const CanvasPaneSC = styled.div`
  position: relative;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  background: white;
  flex: none;
`

export default function Workspace() {
  const {canvasWidth, canvasHeight, width, height, zoomPct} = useSelector(state => state.workspaceSettings)
  const {layers, layerOrder} = useSelector(state => state)

  const workspaceRef = useRef(null);

  const dispatch = useDispatch();

  useEffect(() => {  
    const zoom = (amount) => {
      dispatch(updateWorkspaceSettings({zoomPct: zoomPct * amount}))
    }
    const mouseWheelHandler = ev => {
      if (!ev.altKey) return;
      ev.preventDefault()
      if (ev.deltaY < 0) {
        zoom(ev.shiftKey ? (3/2) : (10/9))
      } else {
        zoom(ev.shiftKey ? (2/3) : (9/10))
      }
    }

    let workspaceElement = workspaceRef.current;
    workspaceElement.addEventListener("wheel", mouseWheelHandler)

    return () => workspaceElement.removeEventListener("wheel", mouseWheelHandler)
  }, [dispatch, zoomPct])



  return(
    <WorkspaceSC ref={workspaceRef} width={width} height={height}>
      <CanvasPaneSC width={canvasWidth * (zoomPct / 100)} height={canvasHeight * (zoomPct / 100)}>
        <DrawSpace index={layerOrder.length + 2}/>
        {
          layerOrder.length !== 0 &&
          layerOrder.map((layerId, i) => {
            let layer = layers[layers.findIndex(el => el.id === layerId)]
            return <Layer
              key={layer.id}
              id={layer.id}
              width={canvasWidth}
              height={canvasHeight}
              index={i + 1}
              data={layer.data}
              hidden={layer.hidden}
              opacity={layer.opacity}
              queue={layer.queue}/>
          })
        }
      </CanvasPaneSC>
    </WorkspaceSC>    
  )
}