import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { toggleOverlay } from "../actions/redux";

import CheckboxInput from "./CheckboxInput";
import NumberInput from "./NumberInput";
import AnchorInput from "./AnchorInput";
import AnchorPreview from "./AnchorPreview";
import DraggableWindow from "./DraggableWindow";

const ResizeModalSC = styled.div`
  display: flex;
  flex-direction: column;
`

const OKButtonSC = styled.button`
  cursor: pointer;
`;

const CloseButtonSC = styled.button`
  cursor: pointer;
`;

export default function ResizeModal() {
  const dispatch = useDispatch();
  const mainCanvas = useSelector(
    state => state.main.present.layerCanvas.main
  );
  const {documentWidth, documentHeight} = useSelector(
    state => state.main.present.documentSettings
  );
  const [isRescaling, setIsRescaling] = useState(false);
  const [anchor, setAnchor] = useState("center");
  const [width, setWidth] = useState({
    pixels: documentWidth,
    percent: 100
  });
  const [height, setHeight] = useState({
    pixels: documentHeight,
    percent: 100
  });
  const [unit, setUnit] = useState("pixels")

  function handleMouseDown(ev) {
    dispatch(toggleOverlay("resize"));
    ev.stopPropagation();
  }

  function handleInput(ev) {
    return null
  }

  return (
    <DraggableWindow
      name={"Resize"}
      resizable
    >
      <ResizeModalSC>
        <CheckboxInput 
          name="Rescale Image"
          selected={true}
          onChange={value => handleInput(value, "isRescaling")}
        />
        <NumberInput
          onChange={value => handleInput(value, "width")}
          value={width[unit]}
          name={"Width"}
          min={1}
        />
        <NumberInput
          onChange={value => handleInput(value, "height")}
          value={height[unit]}
          name={"Height"}
          min={1}
        />
        <AnchorInput 
          onChange={value => handleInput(value, "anchor")}
          value={anchor}
          name={"Anchor"}
        />
        <AnchorPreview value={anchor} />
        <label>
          Unit
          <select>
            <option value="pixels"></option>
            <option value="percent"></option>
          </select>
        </label>
        <OKButtonSC onClick={() => handleMouseDown("OK")}>OK</OKButtonSC>
        <CloseButtonSC onClick={() => handleMouseDown("Close")}>Close</CloseButtonSC>
      </ResizeModalSC>
    </DraggableWindow>
  );
}
