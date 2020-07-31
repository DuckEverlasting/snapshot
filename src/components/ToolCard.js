import React from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import { updateToolSettings } from "../actions/redux";

import SliderInput from "./SliderInput";
import RadioInput from "./RadioInput";

const ToolCardSC = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1 1 auto;
`;

const TitleSC = styled.p`
  padding: 5px 0;
  border-top: 1px solid black;
  border-bottom: 1px dotted black;
  flex: 0 0;
`;

const ToolCardInnerSC = styled.div`
  overflow: auto;
  flex: 1 1 auto;

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
`

export default function ToolCard() {
  const activeTool = useSelector(state => state.ui.activeTool);
  const toolSettings = useSelector(state => state.ui.toolSettings);
  const { width, amount, opacity, hardness, tolerance, range, smooth } = toolSettings[activeTool];
  const dispatch = useDispatch();

  const toolName = toolSettings[activeTool].name;

  const handleInput = (value, property) => {
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
      <ToolCardInnerSC>
        {width !== undefined && <SliderInput
          onChange={value => handleInput(value, "width")}
          value={width}
          name={"Width"}
          max={255}
        />}
        {amount !== undefined && <SliderInput
          onChange={value => handleInput(value, "amount")}
          value={amount}
          name={"Amount"}
          min={activeTool === "saturate" ? -100 : 0}
          max={100}
        />}
        {opacity !== undefined && <SliderInput
          onChange={value => handleInput(value, "opacity")}
          value={opacity}
          name={"Opacity"}
        />}
        {hardness !== undefined && <SliderInput
          onChange={value => handleInput(value, "hardness")}
          value={hardness}
          name={"Hardness"}
          min={0}
        />}
        {tolerance !== undefined && <SliderInput
          onChange={value => handleInput(value, "tolerance")}
          value={tolerance}
          name={"Tolerance"}
          min={0}
          max={255}
        />}
        {range !== undefined && <RadioInput
          name={""}
          selected={range}
          onChange={value => handleInput(value, "range")}
          options={["Shadows", "Midtones", "Highlights"]}
          vertical
        />}
        {smooth !== undefined && <RadioInput
          name={""}
          selected={smooth ? "Smooth" : "Pixellated"}
          onChange={value => handleInput(value === "Smooth", "smooth")}
          options={["Smooth", "Pixellated"]}
          vertical
        />}
      </ToolCardInnerSC>
    </ToolCardSC>
  );
}
