/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEraser, faPencilAlt, faArrowsAltH, faArrowsAlt, faEyeDropper, faVectorSquare } from '@fortawesome/free-solid-svg-icons'
import styled from "styled-components";

import { makeActiveTool } from "../actions"

const ToolboxSC = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  border-top: 1px solid black;
  padding: 10px 0;
`

const ButtonSC = styled.button`
  width: 40%;
  margin: 2%;
  background: ${props => props.active ? "yellow" : "#e3e3e3"};
  border-color: ${props => props.active ? "yellow" : "#e3e3e3"};
  outline: none;
`

const SpanSC = styled.span`
  pointer-events: none;
`

export default function ToolBox() {
  const { activeTool } = useSelector(state => state)
  const dispatch = useDispatch();
  const changeToolHandler = ev => {
    ev.preventDefault();
    dispatch(makeActiveTool(ev.target.name))
  }
  
  return (
    <ToolboxSC>
        <ButtonSC title="Pencil" name="pencil" active={activeTool === "pencil"} onClick={changeToolHandler}>
          <SpanSC role="img" aria-label="Pencil">
            <FontAwesomeIcon icon={faPencilAlt} />
          </SpanSC>
        </ButtonSC>
        <ButtonSC title="Line" name="line" active={activeTool === "line"} onClick={changeToolHandler}>
          <SpanSC role="img" aria-label="Line">
            <FontAwesomeIcon icon={faArrowsAltH} />
          </SpanSC>
        </ButtonSC>
        <ButtonSC title="Fill Rectangle" name="fillRect" active={activeTool === "fillRect"} onClick={changeToolHandler}>
          <SpanSC role="img" aria-label="Fill Rectangle">
            ⬛
          </SpanSC>
        </ButtonSC>
        <ButtonSC title="Draw Rectangle" name="drawRect" active={activeTool === "drawRect"} onClick={changeToolHandler}>
          <SpanSC role="img" aria-label="Draw Rectangle">
            ⬜
          </SpanSC>
        </ButtonSC>
        <ButtonSC title="Eraser" name="eraser" active={activeTool === "eraser"} onClick={changeToolHandler}>
          <SpanSC role="img" aria-label="Eraser">
            <FontAwesomeIcon icon={faEraser} />
          </SpanSC>
        </ButtonSC>
        <ButtonSC title="Eye Dropper" name="eyeDropper" active={activeTool === "eyeDropper"} onClick={changeToolHandler}>
          <SpanSC role="img" aria-label="Eye Dropper">
            <FontAwesomeIcon icon={faEyeDropper} />
          </SpanSC>
        </ButtonSC>
        <ButtonSC title="Select Rectangle" name="selectRect" active={activeTool === "selectRect"} onClick={changeToolHandler}>
          <SpanSC role="img" aria-label="Select Rectangle">
            <FontAwesomeIcon icon={faVectorSquare} />
          </SpanSC>
        </ButtonSC>
        <ButtonSC title="Move" name="move" active={activeTool === "move"} onClick={changeToolHandler}>
          <SpanSC role="img" aria-label="Move">
            <FontAwesomeIcon icon={faArrowsAlt} />
          </SpanSC>
        </ButtonSC>
      </ToolboxSC>
  );
}
