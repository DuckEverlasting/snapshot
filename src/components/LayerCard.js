import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Draggable } from "react-beautiful-dnd";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import render from "../actions/redux/renderCanvas";

import {
  makeActiveLayer,
  deleteLayer,
  hideLayer,
  enableLayerRename,
  updateLayerName
} from "../actions/redux";

const LayerCardSC = styled.div.attrs(props => ({
  style: {
    background: props.active ? props.theme.colors.highlight : "#f1f1f1",
    opacity: props.layerHidden ? 0.5 : 1
  }
}))`
  position: relative;
  border: 1px solid black;
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
  const activeLayer = useSelector(state => state.main.present.activeLayer);
  const dispatch = useDispatch();

  const clickHandler = () => {
    if (props.hidden) return;
    dispatch(makeActiveLayer(props.id));
  };

  const deleteHandler = ev => {
    ev.stopPropagation();
    dispatch(deleteLayer(props.id));
    dispatch(render())
  };

  const hideHandler = ev => {
    ev.stopPropagation();
    dispatch(hideLayer(props.id));
    dispatch(render())
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
