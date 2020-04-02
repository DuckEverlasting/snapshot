import React from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import { updateToolSettings } from "../actions/redux";

import SliderInput from "./SliderInput";

const ToolCardSC = styled.div`
  margin-bottom: 10px;
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
  const { width, opacity, hardness, tolerance } = toolSettings[activeTool];
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
      {opacity !== undefined && <SliderInput
        onChange={value => inputHandler(value, "opacity")}
        value={opacity}
        name={"Opacity"}
      />}
      {hardness !== undefined && <SliderInput
        onChange={value => inputHandler(value, "hardness")}
        value={hardness}
        name={"Hardness"}
      />}
      {tolerance !== undefined && <SliderInput
        onChange={value => inputHandler(value, "tolerance")}
        value={tolerance}
        name={"Tolerance"}
        min={0}
        max={255}
      />}
    </ToolCardSC>
  );
}
