import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import styled from "styled-components";
import { PanelTitleSC } from "../styles/shared";

import LayerCard from "../components/LayerCard";
import Button from "../components/Button";
import SliderInput from "../components/SliderInput";
import SelectBlendMode from "../components/SelectBlendMode";
import { createLayer, updateRenderOrder, updateLayerOpacity } from "../actions/redux";

import render from "../actions/redux/renderCanvas";

const LayerPanelSC = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 200px;
  height: 100%;
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

const TitleSC = styled(PanelTitleSC)``;

const BottomBoxSC = styled.div`
  height: 20%;
  width: 100%;
`

const LayerPanelButtonSC = styled(Button)`
  width: 80%;
`

export default function LayerPanel() {
  const layerSettings = useSelector(state => state.main.present.layerSettings);
  const renderOrder = useSelector(state => state.main.present.renderOrder);
  const activeLayer = useSelector(state => state.main.present.activeLayer);
  const lastAction = useSelector(state => state.lastAction);
  const opacity = activeLayer ? layerSettings[activeLayer].opacity : null;
  const dispatch = useDispatch();

  const onDragEnd = result => {
    const { destination, source } = result;
    
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const src = renderOrder.length - source.index - 1
    const dest = renderOrder.length - destination.index - 1

    dispatch(updateRenderOrder(src, dest))
  }

  const inputHandler = value => {
    let ignoreHistory = false;
    if (
      lastAction &&
      lastAction.type === "UPDATE_LAYER_OPACITY" &&
      Date.now() - lastAction.time < 1000
    ) {
      ignoreHistory = true;
    }
    dispatch(updateLayerOpacity(activeLayer, value, ignoreHistory));
    dispatch(render());
  };

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
              {renderOrder && renderOrder.length !== 0 &&
                renderOrder
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
        <SliderInput 
          onChange={inputHandler}
          value={opacity}
          name={"Opacity"}
          min={0}
          disabled={opacity === null}
        />
      </BottomBoxSC>
    </LayerPanelSC>
  );
}
