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
  faSearch,
  faFillDrip
} from "@fortawesome/free-solid-svg-icons";
import {
  faHandPaper
} from "@fortawesome/free-regular-svg-icons"
import dashedCircleIcon from "../media/dashed-circle.svg"
import dashedSquareIcon from "../media/dashed-square.svg"
import lassoIcon from "../media/lasso.svg"
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
  width: 35%;
  height: 25px;
  margin: 2%;
  outline: none;
  cursor: pointer;
  padding: 3px 0;
  background: ${props => props.active ? "#ffe312" : "#e3e3e3"};
  border: 1px solid #333333;
  border-radius: 2px;
  
  & img {
    margin-top: 2%;
    height: 90%;
    width: 90%;
  }

  &:hover{
    background: ${props => props.active ? "#ffe312" : "#d6d6d6"};
  }

  &:active{
    box-shadow: inset 0 .5px 3px #222222;
  }
`;

const SpanSC = styled.span`
  pointer-events: none;
`;

function ToolBox() {
  return (
    <ToolboxSC>
      <ToolButton title="Pencil (P)" name="pencil" faIcon={faPencilAlt}/>
      <ToolButton title="Brush (B)" name="brush" faIcon={faPaintBrush}/>
      <ToolButton title="Line" name="line" faIcon={faArrowsAltH}/>
      <ToolButton title="Eraser (E)" name="eraser" faIcon={faEraser}/>
      <ToolButton title="Fill Rectangle" name="fillRect" icon="⬛"/>
      <ToolButton title="Draw Rectangle" name="drawRect" icon="⬜"/>
      <ToolButton title="Fill Ellipse" name="fillEllipse" icon="⚫"/>
      <ToolButton title="Draw Ellipse" name="drawEllipse" icon="⚪"/>
      <ToolButton title="Eye Dropper (I)" name="eyeDropper" faIcon={faEyeDropper}/>
      <ToolButton title="Paint Bucket (G)" name="bucketFill" faIcon={faFillDrip}/>
      <ToolButton title="Select Rectangle (M)" name="selectRect" icon={<img src={dashedSquareIcon} />}/>
      <ToolButton title="Select Ellipse (Shift + M)" name="selectEllipse" icon={<img src={dashedCircleIcon} />}/>
      <ToolButton title="Lasso (L)" name="lasso" icon={<img src={lassoIcon} />}/>
      <ToolButton title="Move (V)" name="move" faIcon={faArrowsAlt}/>
      <ToolButton title="Hand (H)" name="hand" faIcon={faHandPaper}/>
      <ToolButton title="Zoom (Z)" name="zoom" faIcon={faSearch}/>
      {/* <ToolButton title="TEST" name="TEST" icon="TEST"/> */}
    </ToolboxSC>
  );
}

function ToolButton({ title, name, faIcon, icon }) {
  const activeTool = useSelector(state => state.ui.activeTool);
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