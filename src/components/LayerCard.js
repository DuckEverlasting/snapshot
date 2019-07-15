import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { makeActiveLayer, deleteLayer, hideLayer } from '../actions';

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
  height: 14px;
  right: 3%;
  top: 5%;
  font-size: 10px;
`

const HideButtonSC = styled.button`
  position: absolute;
  padding: 0;
  width: 20px;
  height: 14px;
  left: 3%;
  top: 5%;
  font-size: 14px;
  line-height: 4px;
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
  <LayerCardSC draggable onDrag={dragHandler} onClick={clickHandler} active={props.id === activeLayer} layerHidden={props.hidden}>
    <HideButtonSC onClick={hideHandler}>👁</HideButtonSC>
    <DeleteButtonSC onClick={deleteHandler}>X</DeleteButtonSC>
    <p>{props.name}</p>
  </LayerCardSC>)
}