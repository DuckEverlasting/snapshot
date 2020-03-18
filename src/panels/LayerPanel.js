import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import styled from "styled-components";

import LayerCard from "../components/LayerCard";
import { createLayer, updateLayerOrder } from "../actions/redux";

const LayerPanelSC = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 200px;
  height: 100%;
  border-top: 1px solid black;
  z-index: 1;
  background: #666666;
`;

const LayerBoxSC = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  margin: 0 0 10px;
  flex-grow: 1;
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  overflow-y: scroll;
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

const ButtonSC = styled.button`
  outline: none;
  background: #e3e3e3;
  width: 80%;
  font-size: 12px;
`;

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
        <ButtonSC title="New Layer" onClick={() => dispatch(createLayer(layerOrder.length - 2))}>
          NEW LAYER
        </ButtonSC>
      </BottomBoxSC>
    </LayerPanelSC>
  );
}
