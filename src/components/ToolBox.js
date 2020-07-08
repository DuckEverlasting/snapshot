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
  faFillDrip,
  faPalette,
  faTint,
  faStamp
} from "@fortawesome/free-solid-svg-icons";
import {
  faHandPaper
} from "@fortawesome/free-regular-svg-icons"
import dashedCircleIcon from "../media/dashed-circle.svg"
import dashedSquareIcon from "../media/dashed-square.svg"
import dodgeIcon from "../media/dodge.svg"
import burnIcon from "../media/burn.svg"
import lassoIcon from "../media/lasso.svg"
import sharpenIcon from "../media/sharpen.svg"
import styled from "styled-components";

import Button from "./Button";

import { setActiveTool } from "../actions/redux";

const ToolboxSC = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  border-top: 1px solid black;
  padding: 10px 0;
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
      <ToolButton title="Blur" name="blur" faIcon={faTint}/>
      <ToolButton title="Sharpen" name="sharpen" icon={<img alt="Sharpen" src={sharpenIcon} />}/>
      <ToolButton title="Dodge" name="dodge" icon={<img alt="Dodge" src={dodgeIcon} />}/>
      <ToolButton title="Burn" name="burn" icon={<img alt="Burn" src={burnIcon} />}/>
      <ToolButton title="Saturate" name="saturate" faIcon={faPalette}/>
      <ToolButton title="Stamp" name="stamp" faIcon={faStamp}/>
      <ToolButton title="Lasso (L)" name="lasso" icon={<img alt="Lasso" src={lassoIcon} />}/>
      <ToolButton title="Select Rectangle (M)" name="selectRect" icon={<img alt="Select Rectangle" src={dashedSquareIcon} />}/>
      <ToolButton title="Select Ellipse (Shift + M)" name="selectEllipse" icon={<img alt="Select Ellipse" src={dashedCircleIcon} />}/>
      <ToolButton title="Crop" name="crop" icon="CROP"/>
      <ToolButton title="Move (V)" name="move" faIcon={faArrowsAlt}/>
      <ToolButton title="Hand (H)" name="hand" faIcon={faHandPaper}/>
      <ToolButton title="Zoom (Z)" name="zoom" faIcon={faSearch}/>
      <ToolButton title="TEST" name="TEST" icon="TEST"/>
    </ToolboxSC>
  );
}

function ToolButton({ title, name, faIcon, icon }) {
  const activeTool = useSelector(state => state.ui.activeTool);
  const dispatch = useDispatch();
  const changeToolHandler = ev => {
    ev.preventDefault();
    dispatch(setActiveTool(ev.target.name));
  };

  return (
    <Button
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
    </Button>
  )
}

export default React.memo(ToolBox)