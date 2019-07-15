/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import { useDispatch } from "react-redux";
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
`

const SpanSC = styled.span`
  pointer-events: none;
`

export default function ToolBox() {
  const dispatch = useDispatch();
  const changeToolHandler = ev => {
    ev.preventDefault();
    dispatch(makeActiveTool(ev.target.name))
  }
  
  return (
    <ToolboxSC>
        <ButtonSC title="Pencil" name="pencil" onClick={changeToolHandler}>
          <SpanSC role="img" aria-label="Pencil">
            ✏
          </SpanSC>
        </ButtonSC>
        <ButtonSC title="Line" name="line" onClick={changeToolHandler}>
          <SpanSC role="img" aria-label="Line">
            ↔
          </SpanSC>
        </ButtonSC>
        <ButtonSC title="Fill Rectangle" name="fillRect" onClick={changeToolHandler}>
          <SpanSC role="img" aria-label="Fill Rectangle">
            ⬛
          </SpanSC>
        </ButtonSC>
        <ButtonSC title="Draw Rectangle" name="drawRect" onClick={changeToolHandler}>
          <SpanSC role="img" aria-label="Draw Rectangle">
            ⬜
          </SpanSC>
        </ButtonSC>
      </ToolboxSC>
  );
}
