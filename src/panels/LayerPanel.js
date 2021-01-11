import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import styled from "styled-components";
import { PanelTitleSC, scrollbar } from "../styles/shared";
import selectFromActiveProject from "../utils/selectFromActiveProject";

import LayerCard from "../components/LayerCard";
import Button from "../components/Button";
import SliderInput from "../components/SliderInput";
import SelectBlendMode from "../components/SelectBlendMode";
import { createLayer, updateRenderOrder, updateLayerOpacity } from "../store/actions/redux";

import render from "../store/actions/redux/renderCanvas";

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
  z-index: ${props => props.isDragging ? 3 : 1};
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

  ${scrollbar}
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
  const [layerSettings, renderOrder, activeLayer] = useSelector(selectFromActiveProject(
    "layerSettings", "renderOrder", "activeLayer"
  ));
  const [isDragging, setIsDragging] = useState(false);

  const lastAction = useSelector(state => state.lastAction);
  const opacity = activeLayer ? layerSettings[activeLayer].opacity : null;

  return (
    <LayerPanelSC isDragging={isDragging}>
      <TitleSC>Layers</TitleSC>
      <LayerPanelMainContent layerSettings={layerSettings} renderOrder={renderOrder} setIsDragging={setIsDragging} />
      <LayerPanelBottomContent lastAction={lastAction} activeLayer={activeLayer} opacity={opacity} />
    </LayerPanelSC>
  );
}


function LayerPanelMainContent({ layerSettings, renderOrder, setIsDragging }) {
  const dispatch = useDispatch();
  const onDragEnd = result => {
    setIsDragging(false);
    const { destination, source } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
      destination.index === source.index)
    ) return;

    const src = renderOrder.length - source.index - 1
    const dest = renderOrder.length - destination.index - 1

    dispatch(updateRenderOrder(src, dest))
    dispatch(render());
  }

  return (
    <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={onDragEnd}>
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
  )
}

function LayerPanelBottomContent({ lastAction, activeLayer, opacity }) {
  const dispatch = useDispatch();

  const inputHandler = value => {
    let ignoreHistory = false;
    if (
      lastAction &&
      lastAction.type === "UPDATE_LAYER_OPACITY" &&
      Date.now() - lastAction.time < 1000
    ) {
      ignoreHistory = true;
    }
    dispatch(updateLayerOpacity(activeLayer, value, { ignoreHistory }));
    dispatch(render());
  };

  return (
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
  )
}