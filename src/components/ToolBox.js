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
  faSearch,
  faFillDrip
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

const ButtonSC = styled.button.attrs(props => ({
  style: {
    background: props.active ? "yellow" : "#e3e3e3",
    borderColor: props.active ? "yellow" : "#e3e3e3"
  }
}))`
  width: 35%;
  margin: 2%;
  outline: none;
`;

const SpanSC = styled.span`
  pointer-events: none;
`;

function ToolBox() {
  return (
    <ToolboxSC>
      <ToolButton title="Pencil (P)" name="pencil" faIcon={faPencilAlt}/>
      <ToolButton title="Brush (B)" name="brush" faIcon={faPaintBrush}/>
      <ToolButton title="Line (L)" name="line" faIcon={faArrowsAltH}/>
      <ToolButton title="Eraser (E)" name="eraser" faIcon={faEraser}/>
      <ToolButton title="Fill Rectangle" name="fillRect" icon="⬛"/>
      <ToolButton title="Draw Rectangle" name="drawRect" icon="⬜"/>
      <ToolButton title="Fill Circle" name="fillCirc" icon="⚫"/>
      <ToolButton title="Draw Circle" name="drawCirc" icon="⚪"/>
      <ToolButton title="Eye Dropper (I)" name="eyeDropper" faIcon={faEyeDropper}/>
      <ToolButton title="Paint Bucket (G)" name="bucketFill" faIcon={faFillDrip}/>
      <ToolButton title="Select Rectangle (M)" name="selectRect" faIcon={faVectorSquare}/>
      <ToolButton title="Move (V)" name="move" faIcon={faArrowsAlt}/>
      <ToolButton title="Hand (H)" name="hand" faIcon={faHandPaper}/>
      <ToolButton title="Zoom (Z)" name="zoom" faIcon={faSearch}/>
      <ToolButton title="TEST" name="TEST" icon="TEST"/>
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