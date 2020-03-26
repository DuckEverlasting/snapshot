import React from "react";
import styled from "styled-components";

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

const PickerSC = styled(NumberInputSC)`
  width: 25px;
`;

const LabelSC = styled.label`
  display: flex;
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

export default function SliderInput({onChange, value, name, min=1, max=100, step=1}) {
  console.log("SLIDER INPUT: ", name)
  const keydownHandler = ev => {
    ev.stopPropagation();
  };

  const inputHandler = ev => {
    let newValue = Number(ev.target.value);
    if (value < min) {
      newValue = min;
    }
    if (value > max) {
      newValue = max;
    }
    onChange(newValue)
  };

  return (
    <LabelSC>
      <div>
        <span>{name}</span>
        <PickerSC
          value={value}
          onKeyDown={keydownHandler}
          onChange={inputHandler}
          type="number"
          min={min}
          max={min}
          step={step}
        />
      </div>
      <SliderSC
        value={value}
        onChange={inputHandler}
        type="range"
        min={min}
        max={max}
        step={step}
      />
    </LabelSC>
  );
}
