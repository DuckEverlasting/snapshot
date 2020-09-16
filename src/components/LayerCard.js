import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import selectFromActiveProject from "../utils/selectFromActiveProject";
import { Draggable } from "react-beautiful-dnd";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import render from "../actions/redux/renderCanvas";

import {
  makeActiveLayer,
  deleteLayer,
  hideLayer,
  setEnableLayerRename,
  updateLayerName
} from "../actions/redux";

const LayerCardSC = styled.div.attrs(props => ({
  style: {
    background: props.active ? props.theme.colors.highlight : "#f1f1f1",
    opacity: props.layerHidden ? 0.5 : 1
  }
}))`
  position: relative;
  border: ${props => props.isDragging ? "1px solid black" : 0};
  border-bottom: 1px solid black;
  color: black;
  cursor: pointer;
`;

const ButtonSC = styled.button`
  position: absolute;
  padding: 0;
  width: 20px;
  height: 16px;
  outline: none;
  cursor: pointer;
  background: #f1f1f1;
  border: 1px solid #333333;
  border-radius: 2px;

  &:hover{
    background: #e6e6e6;
  }

  &:active{
    box-shadow: inset 0 .5px 3px #333333;
  }
`

const DeleteButtonSC = styled(ButtonSC)`
  right: 3%;
  top: 5%;
  font-size: 10px;
`;

const HideButtonSC = styled(ButtonSC)`
  left: 3%;
  top: 5%;
  font-size: 12px;
  line-height: 4px;
`;

const NameSC = styled.p`
  margin: 20px 0 10px;
`;

const RenameSC = styled.input`
  margin: 20px 0 10px;
  width: 90%;
  text-align: center;
`;

export default function LayerCard(props) { 
  const nameBox = useRef();
  const activeLayer = useSelector(
    selectFromActiveProject("activeLayer"))
  const dispatch = useDispatch();

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      submitRename();
    } else if (e.key === "Escape") {
      cancelRename();
    }
    e.stopPropagation();
  }

  const clickHandler = () => {
    if (props.hidden) return;
    dispatch(makeActiveLayer(props.id));
  };

  const deleteHandler = e => {
    e.stopPropagation();
    dispatch(deleteLayer(props.id));
    dispatch(render())
  };

  const hideHandler = e => {
    e.stopPropagation();
    dispatch(hideLayer(props.id));
    dispatch(render())
  };

  const enableRenameHandler = () => {
    dispatch(setEnableLayerRename(props.id))
    document.addEventListener('mousedown', clickOutsideHandler, false)
  }

  const clickOutsideHandler = e => {
    if (nameBox.current !== (e.target)) {
      submitRename();
    }
  }

  const submitRename = () => {
    document.removeEventListener('mousedown', clickOutsideHandler, false)
    if (nameBox.current) {
      dispatch(updateLayerName(props.id, nameBox.current.value))
    }
  }

  const cancelRename = () => {
    document.removeEventListener('mousedown', clickOutsideHandler, false)
    dispatch(setEnableLayerRename(props.id, "current", false));
  }

  return (
    <Draggable draggableId={props.id} index={props.index}>
      {(provided, snapshot) => (
        <LayerCardSC
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          onClick={clickHandler}
          active={props.id === activeLayer}
          isDragging={snapshot.isDragging && !snapshot.isDropAnimating}
          layerHidden={props.hidden}
        >
          <HideButtonSC title="Hide Layer" onClick={hideHandler}>
            {props.hidden ? (
              <FontAwesomeIcon icon={faEyeSlash} />
            ) : (
              <FontAwesomeIcon icon={faEye} />
            )}
          </HideButtonSC>
          <DeleteButtonSC title="Delete Layer" onClick={deleteHandler}>
            <FontAwesomeIcon icon={faTrashAlt} />
          </DeleteButtonSC>
          {!props.nameEditable && <NameSC onDoubleClick={enableRenameHandler}>{props.name}</NameSC>}
          {props.nameEditable && <RenameSC
            onKeyDown={handleKeyDown}
            defaultValue={props.name} ref={nameBox}
          />}
        </LayerCardSC>
      )}
    </Draggable>
  );
}
