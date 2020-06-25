import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { updateCanvas, toggleOverlay } from "../actions/redux";

import CheckboxInput from "./CheckboxInput";
import NumberInput from "./NumberInput";
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
    state => state.main.present.layerCanvas.main.documentSettings
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

  }

  return (
    <DraggableWindow
      name={"Resize"}
      resizable
    >
      <ResizeModalSC>
        <CheckboxInput 
          name="Rescale Image"
          selected={}
          onChange={}
        />
        <NumberInput
          onChange={value => inputDimensionHandler(value, "width")}
          value={width[unit]}
          name={"Width"}
          min={1}
        />
        <NumberInput
          onChange={value => inputDimensionHandler(value, "height")}
          value={height[unit]}
          name={"Height"}
          min={1}
        />
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
