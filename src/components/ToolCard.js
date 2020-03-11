import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { updateToolSettings } from "../actions/redux";

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

const LabelSC = styled.label.attrs(props => ({
  style: {
    display: props.visible ? "flex" : "none"
  }
}))`
  flex-direction: column;
  align-items: center;
  font-size: 14px;
`

export default function ToolCard() {
  const activeTool = useSelector(state => state.activeTool)
  const toolSettings = useSelector(state => state.toolSettings)
  const { width, opacity, tolerance } = toolSettings[activeTool];
  const dispatch = useDispatch();

  const toolName = toolSettings[activeTool].name

  const inputHandler = (ev, property, min=null, max=null) => {
    let value = Number(ev.target.value);
    if (min !== null && value < min) {
      value = min
    };
    if (max !== null && value > max) {
      value = max
    };
    dispatch(updateToolSettings(activeTool, { ...toolSettings[activeTool], [property]: value}))
  }

  const inputWidthHandler = (ev, property, min=null, max=null) => {
    let value = Number(ev.target.value);
    if (value < 1) {
      value = 1
    };
    dispatch(updateToolSettings(activeTool, { ...toolSettings[activeTool], "width": value }))
  }

  const inputOpacityHandler = ev => {
    let value = Number(ev.target.value);
    if (value < 0) {
      value = 0
    };
    if (value > 100) {
      value = 100
    };
    dispatch(updateToolSettings(activeTool, { ...toolSettings[activeTool], "opacity": value}))
  }

  const inputToleranceHandler = ev => {
    let value = Number(ev.target.value);
    if (value < 0) {
      value = 0
    };
    if (value > 255) {
      value = 100
    };
    dispatch(updateToolSettings(activeTool, { ...toolSettings[activeTool], "tolerance": value}))
  }

  return (
    <ToolCardSC>
      <TitleSC>{toolName}</TitleSC>
      <LabelSC visible={width !== undefined}>Width
        <WidthPickerSC value={width} onChange={ev => inputHandler(ev, "width", 1)} type="number" min="1" max="255" step="1"/>
        <WidthSliderSC value={width} onChange={ev => inputHandler(ev, "width", 1)} type="range" min="1" max="255" step="1"/>
      </LabelSC>
      <LabelSC visible={opacity !== undefined}>Opacity
        <OpacityPickerSC value={opacity} onChange={ev => inputHandler(ev, "opacity", 0, 100)} type="number" min="0" max="100" step="1"/>
        <OpacitySliderSC value={opacity} onChange={ev => inputHandler(ev, "opacity", 0, 100)} type="range" min="0" max="100" step="1"/>
      </LabelSC>
      <LabelSC visible={tolerance !== undefined}>Tolerance
        <OpacityPickerSC value={tolerance} onChange={ev => inputHandler(ev, "tolerance", 0, 255)} type="number" min="0" max="255" step="1"/>
        <OpacitySliderSC value={tolerance} onChange={ev => inputHandler(ev, "tolerance", 0, 255)} type="range" min="0" max="255" step="1"/>
      </LabelSC>
    </ToolCardSC>
  )
}
