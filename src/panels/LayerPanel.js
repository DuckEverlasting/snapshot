import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import LayerCard from '../components/LayerCard';
import { createLayer } from '../actions';


const LayerPanelSC = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 120px;
  height: ${props => props.height}px;
  border: 3px solid black;
  border-bottom-right-radius: 10px;
  border-top-right-radius: 10px;
  z-index: 1;
`

const LayerBoxSC = styled.div`
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-end;
  position: relative;
  width: 100%;
  height: 70%;
  margin: 0 0 10px;
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  overflow-y: scroll;
`

const TitleSC = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 12%;
  margin: 0;
`

const ButtonSC = styled.button`
  width: 80%;
  font-size: 12px;
`

export default function LayerPanel() {
  const {height} = useSelector(state => state.workspaceSettings)
  const {layers, layerOrder} = useSelector(state => state)
  const dispatch = useDispatch();

  return(
    <LayerPanelSC height={height}>
      <TitleSC>Layers</TitleSC>
      <LayerBoxSC>
        {
          layerOrder.length !== 0 &&
          layerOrder.map((layerId, i) => {
            if (layerId === "staging") return null;
            let layer = layers[layers.findIndex(el => el.id === layerId)]
            return <LayerCard key={layer.id} id={layer.id} name={layer.name} hidden={layer.hidden}/>
          })
        }
      </LayerBoxSC>
      <ButtonSC onClick={() => dispatch(createLayer(layerOrder.length))}>NEW LAYER</ButtonSC>
    </LayerPanelSC>    
  )
}