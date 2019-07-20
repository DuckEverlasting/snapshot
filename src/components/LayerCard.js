import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faTrashAlt } from '@fortawesome/free-solid-svg-icons'

import { makeActiveLayer, deleteLayer, hideLayer } from '../actions';

const DropContainerSC = styled.div`
  position: relative;
`

const DropAreaTopSC = styled.div`
  position: absolute;
  height: 50%;
  width: 100%;
  top: 0%;
  border-top: 4px solid blue;
`

const DropAreaBottomSC = styled.div`
  position: absolute;
  height: 50%;
  width: 100%;
  bottom: 0%;
  border-bottom: 4px solid blue;
  margin-bottom: -4px;
`

const LayerCardSC = styled.div`
  position: relative;
  border: 1px solid black;
  background: ${props => props.active ? "yellow" : "white"};
  opacity: ${props => props.layerHidden ? .5 : 1};
  cursor: pointer;
`

const DeleteButtonSC = styled.button`
  position: absolute;
  padding: 0;
  width: 20px;
  height: 16px;
  right: 3%;
  top: 5%;
  font-size: 10px;
`

const HideButtonSC = styled.button`
  position: absolute;
  padding: 0;
  width: 20px;
  height: 16px;
  left: 3%;
  top: 5%;
  font-size: 12px;
  line-height: 4px;
`

const NameSC = styled.p`
  padding-top: 5px;
`

export default function LayerCard(props) {
  const { cardDragPosition, activeLayer } = useSelector(state => state)
  const dispatch = useDispatch();

  const dragHandler = ev => {

  }

  const clickHandler = ev => {
    if (props.hidden) return;
    dispatch(makeActiveLayer(props.id))
  }

  const deleteHandler = ev => {
    ev.stopPropagation();
    dispatch(deleteLayer(props.id))
  }

  const hideHandler = ev => {
    ev.stopPropagation();
    dispatch(hideLayer(props.id))
  }

  return (
    <DropContainerSC>
      <DropAreaTopSC />
      <DropAreaBottomSC />
      <LayerCardSC draggable onDrag={dragHandler} onClick={clickHandler} active={props.id === activeLayer} layerHidden={props.hidden}>
        <HideButtonSC onClick={hideHandler}>
          {props.hidden ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
        </HideButtonSC>
        <DeleteButtonSC onClick={deleteHandler}>
          <FontAwesomeIcon icon={faTrashAlt} />
        </DeleteButtonSC>
        <NameSC>{props.name}</NameSC>
      </LayerCardSC>
    </DropContainerSC>
  )
}