import React from "react";
import styled from "styled-components";

import { TextInputSC } from "../styles/shared";

const SliderSC = styled.input`
  -webkit-appearance: none;
  background: #bbbbbb;
  border-radius: 20px;
  border: 1px solid #444444;
  padding: 0;
  margin-top: 3px;
  margin-bottom: 6px;
  width: 80%;
  height: 5px;

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
    background: ${props => props.disabled ? "transparent" : "#eeeeee"};
    margin-top: -10px;
    border: 1px solid ${props => props.disabled ? "transparent" : "#444444"};
    border-radius: 40%;
    cursor: ${props => props.disabled ? "auto" : "pointer"};

    &:active {
      background: #f3f3f3;
      box-shadow: inset 0 0 2px #222222;
    }
  }

  &::-moz-range-thumb {
    height: 25px;
    width: 10px;
    background: ${props => props.disabled ? "transparent" : "#eeeeee"};
    margin-top: -10px;
    border: 1px solid ${props => props.disabled ? "transparent" : "#444444"};
    border-radius: 40%;
    cursor: ${props => props.disabled ? "auto" : "pointer"};
  }
`;

const PickerSC = styled(TextInputSC)`
  margin-left: 5px;
  width: 25px;
`;

const LabelSC = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: ${props => props.theme.fontSizes.small};
  margin-bottom: 10px;

  & div {
    display: flex;
    min-width: 70%;
    justify-content: center;
    align-items: center;
    margin: 10px 0;

    & span {
      margin-right: 5px;
    }
  }
`;

export default function SliderInput({onChange, value, name, min=1, max=100, step=1, disabled=false, stopKeydown=true}) {
  const handleKeyDown = e => {
    if (stopKeydown) {
      e.stopPropagation();
    }
  };

  const handleInput = e => {
    let newValue = Number(e.target.value);
    if (e.target.value === "-" || e.target.value === "") {
      newValue = e.target.value;
    } else if (Number.isNaN(newValue)) {
      newValue = value;
    } else if (newValue < min) {
      newValue = min;
    } else if (newValue > max) {
      newValue = max;
    }
    onChange(newValue)
  };

  const handleBlur = () => {
    if (value === "")
    onChange(min)
  }

  return (
    <LabelSC>
      <div>
        <span>{name}</span>
        <PickerSC
          value={!value && value !== 0 ? min : value}
          onKeyDown={handleKeyDown}
          onChange={handleInput}
          onBlur={handleBlur}
          type="text"
          min={min}
          max={min}
          disabled={disabled}
        />
      </div>
      <SliderSC
        value={!value && value !== 0 ? min : value}
        onChange={handleInput}
        type="range"
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </LabelSC>
  );
}
