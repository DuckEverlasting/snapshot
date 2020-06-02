import React from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import { updateToolSettings } from "../actions/redux";

import SliderInput from "./SliderInput";
import RadioInput from "./RadioInput";

const ToolCardSC = styled.div`
  margin-bottom: 10px;
  overflow: auto;

  scrollbar-width: thin;
  scrollbar-color: #777777 #303030;
  
  &::-webkit-scrollbar {
    width: 11px;
  }
  &::-webkit-scrollbar-track {
    background: #303030;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #777777;
    border-radius: 6px;
    border: 2px solid #303030;
  }
`;

const TitleSC = styled.p`
  margin: 0 0 5px;
  padding: 3px 0;
  border-top: 1px solid black;
  border-bottom: 1px dotted black;
`;

export default function ToolCard() {
  const activeTool = useSelector(state => state.ui.activeTool);
  const toolSettings = useSelector(state => state.ui.toolSettings);
  const { width, amount, opacity, hardness, tolerance, range } = toolSettings[activeTool];
  const dispatch = useDispatch();

  const toolName = toolSettings[activeTool].name;

  const inputHandler = (value, property) => {
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
      {width !== undefined && <SliderInput
        onChange={value => inputHandler(value, "width")}
        value={width}
        name={"Width"}
        max={255}
      />}
      {amount !== undefined && <SliderInput
        onChange={value => inputHandler(value, "amount")}
        value={amount}
        name={"Amount"}
        min={activeTool === "saturate" ? -100 : 0}
        max={100}
      />}
      {opacity !== undefined && <SliderInput
        onChange={value => inputHandler(value, "opacity")}
        value={opacity}
        name={"Opacity"}
      />}
      {hardness !== undefined && <SliderInput
        onChange={value => inputHandler(value, "hardness")}
        value={hardness}
        name={"Hardness"}
        min={0}
      />}
      {tolerance !== undefined && <SliderInput
        onChange={value => inputHandler(value, "tolerance")}
        value={tolerance}
        name={"Tolerance"}
        min={0}
        max={255}
      />}
      {range !== undefined && <RadioInput
        name={""}
        selected={range}
        onChange={value => inputHandler(value, "range")}
        options={["Shadows", "Midtones", "Highlights"]}
        vertical
      />}
    </ToolCardSC>
  );
}
