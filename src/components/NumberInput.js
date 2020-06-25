import React from "react";
import styled from "styled-components";

import { TextInputSC } from "../styles/shared";

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

export default function NumberInput({onChange, value, name, min=null, max=null, disabled=false}) {
  const keydownHandler = ev => {
    ev.stopPropagation();
  };

  const inputHandler = ev => {
    let newValue = Number(ev.target.value);
    if (ev.target.value === "-" || ev.target.value === "") {
      newValue = ev.target.value;
    } else if (Number.isNaN(newValue)) {
      newValue = value;
    } else if (min && newValue < min) {
      newValue = min;
    } else if (max && newValue > max) {
      newValue = max;
    }
    onChange(newValue)
  };

  const blurHandler = () => {
    if (value === "") {
      onChange(min || 0)
    };
  }

  return (
    <LabelSC>
      <div>
        <span>{name}</span>
        <PickerSC
          value={!value && value !== 0 ? min || 0 : value}
          onKeyDown={keydownHandler}
          onChange={inputHandler}
          onBlur={blurHandler}
          type="text"
          min={min}
          max={min}
          disabled={disabled}
        />
      </div>
    </LabelSC>
  );
}
