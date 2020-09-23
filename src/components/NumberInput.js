import React from "react";
import styled from "styled-components";

import { TextInputSC } from "../styles/shared";

const PickerSC = styled(TextInputSC)`
  margin-left: 5px;
  width: ${props => props.inputWidth || "25px"};
`;

const LabelSC = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: ${(props) => props.theme.fontSizes.small};

  & div {
    display: flex;
    min-width: 70%;
    justify-content: center;
    align-items: center;
    margin: 5px 0;

    & span {
      margin-right: 5px;
    }
  }
`;

export default function NumberInput({
  onChange,
  value,
  name,
  min = null,
  max = null,
  rounding = null,
  disabled = false,
  stopKeydown = true,
  inputWidth = null
}) {
  function keydownHandler(e) {
    if (stopKeydown) {
      e.stopPropagation();
    }
  }

  function clickHandler(e) {
    e.target.select();
  }

  function inputHandler(e) {
    let newValue = Number(e.target.value);
    if (e.target.value === "-" || e.target.value === "") {
      newValue = e.target.value;
    } else if (Number.isNaN(newValue)) {
      newValue = value;
    } else if (min && newValue < min) {
      newValue = min;
    } else if (max && newValue > max) {
      newValue = max;
    }
    onChange(newValue);
  }

  function blurHandler() {
    if (value === "") {
      onChange(min || 0);
    }
  }

  function parseValue(value) {
    if (!value && value !== 0) {
      value = min || 0;
    }
    if (typeof rounding === "number") {
      value = +value.toFixed(rounding);
    }
    return value;
  }

  return (
    <LabelSC>
      <div>
        <span>{name}</span>
        <PickerSC
          value={parseValue(value)}
          onClick={clickHandler}
          onKeyDown={keydownHandler}
          onChange={inputHandler}
          onBlur={blurHandler}
          type="text"
          min={min}
          max={max}
          disabled={disabled}
          inputWidth={inputWidth}
        />
      </div>
    </LabelSC>
  );
}
