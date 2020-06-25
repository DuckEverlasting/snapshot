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
    height: 15px;
    width: 15px;
    background: pink;
    margin-top: -5px;
    border-radius: 10px;
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

export default function SliderInput({onChange, value, name, min=1, max=100, step=1, disabled}) {
  const keydownHandler = ev => {
    ev.stopPropagation();
  };

  const inputHandler = ev => {
    let newValue = Number(ev.target.value);
    if (ev.target.value === "-" || ev.target.value === "") {
      newValue = ev.target.value;
    } else if (Number.isNaN(newValue)) {
      newValue = value;
    } else if (newValue < min) {
      newValue = min;
    } else if (newValue > max) {
      newValue = max;
    }
    onChange(newValue)
  };

  const blurHandler = () => {
    if (value === "")
    onChange(min)
  }

  return (
    <LabelSC>
      <div>
        <span>{name}</span>
        <PickerSC
          value={!value && value !== 0 ? min : value}
          onKeyDown={keydownHandler}
          onChange={inputHandler}
          onBlur={blurHandler}
          type="text"
          min={min}
          max={min}
          disabled={disabled}
        />
      </div>
      <SliderSC
        value={!value && value !== 0 ? min : value}
        onChange={inputHandler}
        type="range"
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </LabelSC>
  );
}
