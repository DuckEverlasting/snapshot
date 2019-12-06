import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Draggable } from "react-beautiful-dnd";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import {
  makeActiveLayer,
  deleteLayer,
  hideLayer,
  enableLayerRename,
  updateLayerName
} from "../actions";

const LayerCardSC = styled.div`
  position: relative;
  border: 1px solid black;
  color: black;
  background: ${props => (props.active ? "yellow" : "white")};
  opacity: ${props => (props.layerHidden ? 0.5 : 1)};
  cursor: pointer;
`;

const DeleteButtonSC = styled.button`
  position: absolute;
  padding: 0;
  width: 20px;
  height: 16px;
  right: 3%;
  top: 5%;
  font-size: 10px;
`;

const HideButtonSC = styled.button`
  position: absolute;
  padding: 0;
  width: 20px;
  height: 16px;
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
  const { activeLayer } = useSelector(state => state);
  const dispatch = useDispatch();

  const clickHandler = ev => {
    if (props.hidden) return;
    dispatch(makeActiveLayer(props.id));
  };

  const deleteHandler = ev => {
    ev.stopPropagation();
    dispatch(deleteLayer(props.id));
  };

  const hideHandler = ev => {
    ev.stopPropagation();
    dispatch(hideLayer(props.id));
  };

  const enableRenameHandler = () => {
    dispatch(enableLayerRename(props.id))
    document.addEventListener('mousedown', clickOutsideHandler, false)
  }

  const clickOutsideHandler = ev => {
    if (nameBox.current !== (ev.target)) {
      dispatch(updateLayerName(props.id, nameBox.current.value))
      document.removeEventListener('mousedown', clickOutsideHandler, false)
    }
  }

  return (
    <Draggable draggableId={props.id} index={props.index}>
      {(provided) => (
        <LayerCardSC
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          onClick={clickHandler}
          active={props.id === activeLayer}
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
          {props.nameEditable && <RenameSC defaultValue={props.name} ref={nameBox}></RenameSC>}
        </LayerCardSC>
      )}
    </Draggable>
  );
}
