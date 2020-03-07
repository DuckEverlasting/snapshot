/* eslint-disable jsx-a11y/accessible-emoji */
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEraser,
  faPencilAlt,
  faPaintBrush,
  faArrowsAltH,
  faArrowsAlt,
  faEyeDropper,
  faVectorSquare,
  faSearch
} from "@fortawesome/free-solid-svg-icons";
import {
  faHandPaper
} from "@fortawesome/free-regular-svg-icons"
import styled from "styled-components";

import { makeActiveTool } from "../actions/redux";

const ToolboxSC = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  border-top: 1px solid black;
  padding: 10px 0;
`;

const ButtonSC = styled.button`
  width: 40%;
  margin: 2%;
  background: ${props => (props.active ? "yellow" : "#e3e3e3")};
  border-color: ${props => (props.active ? "yellow" : "#e3e3e3")};
  outline: none;
`;

const SpanSC = styled.span`
  pointer-events: none;
`;

function ToolBox() {
  return (
    <ToolboxSC>
      <ToolButton title="Pencil" name="pencil" faIcon={faPencilAlt}/>
      <ToolButton title="Brush" name="brush" faIcon={faPaintBrush}/>
      <ToolButton title="Line" name="line" faIcon={faArrowsAltH}/>
      <ToolButton title="Eraser" name="eraser" faIcon={faEraser}/>
      <ToolButton title="Fill Rectangle" name="fillRect" icon="⬛"/>
      <ToolButton title="Draw Rectangle" name="drawRect" icon="⬜"/>
      <ToolButton title="Fill Circle" name="fillCirc" icon="⚫"/>
      <ToolButton title="Draw Circle" name="drawCirc" icon="⚪"/>
      <ToolButton title="Eye Dropper" name="eyeDropper" faIcon={faEyeDropper}/>
      <ToolButton title="Select Rectangle" name="selectRect" faIcon={faVectorSquare}/>
      <ToolButton title="Move" name="move" faIcon={faArrowsAlt}/>
      <ToolButton title="Hand" name="hand" faIcon={faHandPaper}/>
      <ToolButton title="Zoom" name="zoom" faIcon={faSearch}/>
    </ToolboxSC>
  );
}

function ToolButton({ title, name, faIcon, icon }) {
  const activeTool = useSelector(state => state.activeTool);
  const dispatch = useDispatch();
  const changeToolHandler = ev => {
    ev.preventDefault();
    dispatch(makeActiveTool(ev.target.name));
  };

  console.log("RENDERING BUTTON " + name)

  return (
    <ButtonSC
      title={title}
      name={name}
      active={activeTool === name}
      onClick={changeToolHandler}
    >
      <SpanSC role="img" aria-label={title}>
        {
          faIcon ?
          <FontAwesomeIcon icon={faIcon} /> :
          icon
        }
      </SpanSC>
    </ButtonSC>
  )
}

export default React.memo(ToolBox)