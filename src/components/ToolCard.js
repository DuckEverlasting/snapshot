import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { updateToolSettings } from "../actions";

const ToolCardSC = styled.div`
  margin-bottom: 10px;
`

const TitleSC = styled.p`
  margin: 0 0 5px;
  padding: 3px 0;
  border-top: 1px solid black;
  border-bottom: 1px dotted black;
`

const WidthPickerSC = styled.input`
  margin: 0 0 6px;
  padding: 3px 0;
  width: 35%;
`

const WidthSliderSC = styled.input`
  margin-top: 3px;
  width: 80%;
`

const OpacityPickerSC = styled.input`
  padding: 3px 0;
  width: 35%;
`

const OpacitySliderSC = styled.input`
  margin-top: 3px;
  width: 80%;
`

const LabelSC = styled.label`
  display: ${props => props.visible ? "flex" : "none"};
  flex-direction: column;
  align-items: center;
  font-size: 14px;
`

export default function ToolCard() {
  const { activeTool, toolSettings } = useSelector(state => state);
  const { width, opacity } = toolSettings[activeTool];
  const dispatch = useDispatch();

  const toolName = toolSettings[activeTool].name

  const inputWidthHandler = ev => {
    let value = Number(ev.target.value);
    dispatch(updateToolSettings(activeTool, { ...toolSettings[activeTool], "width": value }))
  }

  const inputOpacityHandler = ev => {
    let value = Number(ev.target.value) / 100;
    dispatch(updateToolSettings(activeTool, { ...toolSettings[activeTool], "opacity": value}))
  }

  return (
    <ToolCardSC>
      <TitleSC>{toolName}</TitleSC>
      <LabelSC visible={width !== null}>Width
        <WidthPickerSC value={width} onChange={inputWidthHandler} type="number"/>
        <WidthSliderSC value={width} onChange={inputWidthHandler} type="range" min="1" max="255"/>
      </LabelSC>
      <LabelSC visible={opacity !== null}>Opacity
        <OpacityPickerSC value={opacity * 100} onChange={inputOpacityHandler} type="number"/>
        <OpacitySliderSC value={opacity * 100} onChange={inputOpacityHandler} type="range" min="0" max="100"/>
      </LabelSC>
    </ToolCardSC>
  )
}
