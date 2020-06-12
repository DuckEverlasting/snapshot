import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import styled from "styled-components";

import LayerCard from "../components/LayerCard";
import Button from "../components/Button";
import SelectBlendMode from "../components/SelectBlendMode";
import { createLayer, updateLayerOrder } from "../actions/redux";

const LayerPanelSC = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 200px;
  height: calc(100% - 35px);
  overflow: hidden;
  border-top: 1px solid black;
  background: #666666;
  z-index: 1;
`;

const LayerBoxSC = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  max-height: 550px;
  margin: 0 0 10px;
  flex-grow: 1;
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  overflow-y: scroll;

  scrollbar-width: thin;
  scrollbar-color: #777777 #303030;
  
  &::-webkit-scrollbar {
    width: 11px;
  }
  &::-webkit-scrollbar-track {
    background: #303030;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #777777;
    border-radius: 6px;
    border: 2px solid #303030;
  }
`;

const TitleSC = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 0 20px;
  font-size: 24px;
  margin: 0;
`;

const BottomBoxSC = styled.div`
  height: 20%;
  width: 100%;
`

const LayerPanelButtonSC = styled(Button)`
  width: 80%;
`

export default function LayerPanel() {
  const layerSettings = useSelector(state => state.main.present.layerSettings)
  const layerOrder = useSelector(state => state.main.present.layerOrder)
  const dispatch = useDispatch();

  const onDragEnd = result => {
    const { destination, source } = result;
    
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const src = layerOrder.length - source.index - 1
    const dest = layerOrder.length - destination.index - 1

    dispatch(updateLayerOrder(src, dest))
  }

  return (
    <LayerPanelSC>
      <TitleSC>Layers</TitleSC>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={"layersDroppable"}>
          {(provided) => (
            <LayerBoxSC 
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {layerOrder && layerOrder.length !== 0 &&
                layerOrder
                  .slice()
                  .reverse()
                  .map((layerId, i) => {
                    if (["staging", "selection", "clipboard"].includes(layerId)) return null;
                    let layer = layerSettings[layerId];
                    return (
                      <LayerCard
                        key={layerId}
                        id={layerId}
                        index={i}
                        name={layer.name}
                        nameEditable={layer.nameEditable}
                        hidden={layer.hidden}
                      />
                    );
                  })}
              {provided.placeholder}
            </LayerBoxSC>)}
        </Droppable>
      </DragDropContext>
      <BottomBoxSC>
        <LayerPanelButtonSC title="New Layer" onClick={() => dispatch(createLayer("top"))}>
          NEW LAYER
        </LayerPanelButtonSC>
        <SelectBlendMode />
      </BottomBoxSC>
    </LayerPanelSC>
  );
}
