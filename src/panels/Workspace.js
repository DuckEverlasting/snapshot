import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import DrawSpace from '../components/DrawSpace';
import Layer from '../components/Layer';

const WorkspaceSC = styled.div`
  position: relative;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  border: 3px solid black;
  z-index: 1;
`

const ViewPaneSC = styled.div`
`

export default function Workspace() {
  const {width, height} = useSelector(state => state.workspaceSettings)
  const {layers, layerOrder} = useSelector(state => state)

  return(
    <WorkspaceSC width={width} height={height}>
      <DrawSpace index={layerOrder.length + 2}/>
      <ViewPaneSC>
        {
          layerOrder.length !== 0 &&
          layerOrder.map((layerId, i) => {
            let layer = layers[layers.findIndex(el => el.id === layerId)]
            return <Layer
              key={layer.id}
              id={layer.id}
              width={width}
              height={height}
              index={i + 1}
              data={layer.data}
              hidden={layer.hidden}
              opacity={layer.opacity}
              trigger={layer.trigger}/>
          })
        }
      </ViewPaneSC>
    </WorkspaceSC>    
  )
}