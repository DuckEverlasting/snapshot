import React from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import { updateToolSettings } from "../actions/redux";

const ToolCardSC = styled.div`
  margin-bottom: 10px;
`;

const TitleSC = styled.p`
  margin: 0 0 5px;
  padding: 3px 0;
  border-top: 1px solid black;
  border-bottom: 1px dotted black;
`;

const SliderSC = styled.input`
  -webkit-appearance: none;
  background: #bbbbbb;
  border-radius: 20px;
  border: 1px solid #444444;
  padding: 0;

  &:focus {
    outline: none;
  }

  &::-webkit-slider-runnable-track {
    height: 5px;
  }

  &::-moz-range-track {
    height: 5px;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 25px;
    width: 10px;
    background: #eeeeee;
    margin-top: -10px;
    border: 1px solid #444444;
    border-radius: 40%;
    cursor: pointer;

    &:active {
      background: #f3f3f3;
      box-shadow: inset 0 0 2px #222222;
    }
  }

  &::-moz-range-thumb {
    height: 15px;
    width: 15px;
    background: pink;
    margin-top: -5px;
    border-radius: 10px;
  }
`;

const NumberInputSC = styled.input`
  -moz-appearance: textfield;
  appearance: textfield;
  margin: 1px 0 0;
  border-radius: 3px;
  border: 1px solid #222222;
  padding: 3px;

  &::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const WidthPickerSC = styled(NumberInputSC)`
  width: 25px;
`;

const WidthSliderSC = styled(SliderSC)`
  margin-top: 3px;
  margin-bottom: 6px;
  width: 80%;
`;

const OpacityPickerSC = styled(NumberInputSC)`
  width: 25px;
`;

const OpacitySliderSC = styled(SliderSC)`
  margin-top: 3px;
  margin-bottom: 6px;
  width: 80%;
`;

const LabelSC = styled.label.attrs(props => ({
  style: {
    display: props.visible ? "flex" : "none"
  }
}))`
  flex-direction: column;
  align-items: center;
  font-size: 15px;
  margin-bottom: 10px;

  & div {
    display: flex;
    width: 70%;
    justify-content: space-between;
    align-items: center;
    margin: 15px 0;
  }
`;

export default function ToolCard() {
  const activeTool = useSelector(state => state.ui.activeTool);
  const toolSettings = useSelector(state => state.ui.toolSettings);
  const { width, opacity, tolerance } = toolSettings[activeTool];
  const dispatch = useDispatch();

  const toolName = toolSettings[activeTool].name;

  const keydownHandler = ev => {
    ev.stopPropagation();
  };

  const inputHandler = (ev, property, min = null, max = null) => {
    let value = Number(ev.target.value);
    if (min !== null && value < min) {
      value = min;
    }
    if (max !== null && value > max) {
      value = max;
    }
    dispatch(
      updateToolSettings(activeTool, {
        ...toolSettings[activeTool],
        [property]: value
      })
    );
  };

  return (
    <ToolCardSC>
      <TitleSC>{toolName}</TitleSC>
      <LabelSC visible={width !== undefined}>
        <div>
          <span>Width</span>
          <WidthPickerSC
            value={width}
            onKeyDown={keydownHandler}
            onChange={ev => inputHandler(ev, "width", 1)}
            type="number"
            min="1"
            max="255"
            step="1"
          />
        </div>
        <WidthSliderSC
          value={width}
          onChange={ev => inputHandler(ev, "width", 1)}
          type="range"
          min="1"
          max="255"
          step="1"
        />
      </LabelSC>
      <LabelSC visible={opacity !== undefined}>
        <div>
          <span>Opacity</span>
          <OpacityPickerSC
            value={opacity}
            onKeyDown={keydownHandler}
            onChange={ev => inputHandler(ev, "opacity", 0, 100)}
            type="number"
            min="0"
            max="100"
            step="1"
          />
        </div>
        <OpacitySliderSC
          value={opacity}
          onChange={ev => inputHandler(ev, "opacity", 0, 100)}
          type="range"
          min="0"
          max="100"
          step="1"
        />
      </LabelSC>
      <LabelSC visible={tolerance !== undefined}>
        <div>
          <span>Tolerance</span>
          <OpacityPickerSC
            value={tolerance}
            onKeyDown={keydownHandler}
            onChange={ev => inputHandler(ev, "tolerance", 0, 255)}
            type="number"
            min="0"
            max="255"
            step="1"
          />
        </div>
        <OpacitySliderSC
          value={tolerance}
          onChange={ev => inputHandler(ev, "tolerance", 0, 255)}
          type="range"
          min="0"
          max="255"
          step="1"
        />
      </LabelSC>
    </ToolCardSC>
  );
}
