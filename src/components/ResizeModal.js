import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { toggleOverlay } from "../actions/redux";

import Button from "./Button";
import CheckboxInput from "./CheckboxInput";
import NumberInput from "./NumberInput";
import AnchorInput from "./AnchorInput";
import AnchorPreview from "./AnchorPreview";
import DraggableWindow from "./DraggableWindow";
import { resizeDocument } from "../actions/redux/menuAction";

const ResizeModalSC = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: ${props => props.theme.fontSizes.small};
`

const LeftBoxSC = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const RightBoxSC = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputRowSC = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  opacity: ${props => props.disabled ? ".333" : "1"};
  pointer-events: ${props => props.disabled ? "none" : "auto"};
`;

const AnchorInputWrapperSC = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  width: 120px;
  height: 120px; 
`;

const PreviewWrapperSC = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 150px;
  height: 150px;  
`;

export default function ResizeModal() {
  const dispatch = useDispatch();
  // const mainCanvas = useSelector(
  //   state => state.main.present.layerCanvas.main
  // );
  const {documentWidth, documentHeight} = useSelector(
    state => state.main.present.documentSettings
  );
  const [isRescaling, setIsRescaling] = useState(false);
  const [anchor, setAnchor] = useState("center-center");
  const [width, setWidth] = useState({
    pixels: documentWidth,
    percent: 100
  });
  const [height, setHeight] = useState({
    pixels: documentHeight,
    percent: 100
  });
  const [unit, setUnit] = useState("pixels")

  function handleApply(ev) {
    dispatch(resizeDocument(width.pixels, height.pixels, isRescaling, isRescaling ? null : anchor));
    ev.stopPropagation();
  }
  
  function handleCancel(ev) {
    dispatch(toggleOverlay("resize"));
    ev.stopPropagation();
  }

  function pixelsToPercent(value, type) {
    if (type === "width") {
      return (value / documentWidth) * 100;
    } else if (type === "height") {
      return (value / documentHeight) * 100;
    }
  }
  
  function percentToPixels(value, type) {
    if (type === "width") {
      return documentWidth * value / 100;
    } else if (type === "height") {
      return documentHeight * value / 100;
    }
  }

  function handleInput(value, type) {
    switch (type) {
      case "width":
        if (unit === "pixels") {
          setWidth({pixels: value, percent: pixelsToPercent(value, "width")});
        } else if (unit === "percent") {
          setWidth({pixels: percentToPixels(value, "width"), percent: value});
        }
        break;
      case "height":
        if (unit === "pixels") {
          setHeight({pixels: value, percent: pixelsToPercent(value, "height")});
        } else if (unit === "percent") {
          setHeight({pixels: percentToPixels(value, "height"), percent: value});
        }
        break;
      case "isRescaling":
        setIsRescaling(value);
        break;
      case "unit":
        setUnit(value);
        break;
      case "anchor":
        setAnchor(value);
        break;
      default:
        break;
    }
  }

  return (
    <DraggableWindow
      name={"Resize"}
    >
      <ResizeModalSC>
        <InputRowSC>
          <LeftBoxSC>
            <NumberInput
              onChange={value => handleInput(value, "width")}
              value={width[unit]}
              name={"Width"}
              min={1}
              max={unit === "pixels" ? 5000 : pixelsToPercent(5000, "width")}
              rounding={2}
              inputWidth={"50px"}
            />
            <NumberInput
              onChange={value => handleInput(value, "height")}
              value={height[unit]}
              name={"Height"}
              min={1}
              max={unit === "pixels" ? 5000 : pixelsToPercent(5000, "height")}
              rounding={2}
              inputWidth={"50px"}
            />
          </LeftBoxSC>
          <RightBoxSC>
            <CheckboxInput 
              name="Rescale Image"
              selected={isRescaling}
              onChange={value => handleInput(value, "isRescaling")}
              noWrap
            />
            <label>
              Unit
              <select style={{marginLeft: "5px"}} onChange={ev => handleInput(ev.target.value, "unit")}>
                <option value="pixels">pixels</option>
                <option value="percent">percent</option>
              </select>
            </label>
          </RightBoxSC>
        </InputRowSC>
        <InputRowSC disabled={isRescaling}>
          <AnchorInputWrapperSC>
            <AnchorInput 
              name={"Anchor"}
              selected={anchor}
              onChange={value => handleInput(value, "anchor")}
            />
          </AnchorInputWrapperSC>
          <PreviewWrapperSC>
            <AnchorPreview value={anchor} />
          </PreviewWrapperSC>
        </InputRowSC>
        <InputRowSC>
          <Button onClick={handleApply}>Apply</Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </InputRowSC>
      </ResizeModalSC>
    </DraggableWindow>
  );
}
