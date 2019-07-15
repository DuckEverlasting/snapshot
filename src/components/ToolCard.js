import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { updateToolSettings } from "../actions"

const ToolCardSC = styled.div`
  border-top: 1px solid black;
`

const TitleSC = styled.p`
  margin: 0 0 5px;
  padding: 5px 0;
  border-bottom: 1px dotted black;
`

const DividerSC = styled.div`
  display: flex;
  justify-content: space-around;
`

const ColorPickerSC = styled.input`
  margin: 3px 0 10px;
  width: 100%;
`

const WidthPickerSC = styled.input`
  margin: 3px 0 10px;
  padding: 4px 0;
  width: 100%;
`

const OpacitySliderSC = styled.input`
  margin: 3px 0 10px;
  width: 80%;
`

const OpacityPickerSC = styled.input`
  margin: 3px 0 0;
  padding: 4px 0;
  width: 35%;
`

const LabelSC = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
`

const SmallLabelSC = styled(LabelSC)`
  width: 35%;
`

export default function ToolCard() {
  const { activeTool, toolSettings } = useSelector(state => state)
  const {color, width, opacity} = toolSettings[activeTool]
  const dispatch = useDispatch();

  const toolName = toolSettings[activeTool].name

  const inputHandler = ev => {
    let [name, value] = [ev.target.name, ev.target.value];
    if (name === "width") {value = Number(value)}
    if (name === "opacity") {value = Number(value / 100)}
    dispatch(updateToolSettings(activeTool, {...toolSettings[activeTool], [ev.target.name]: value}))
  }

  return (
    <ToolCardSC >
      <TitleSC>{toolName}</TitleSC>
      <DividerSC>
        <SmallLabelSC>Color
          <ColorPickerSC name="color" value={color} onChange={inputHandler} type="color"/>
        </SmallLabelSC>
        
        <SmallLabelSC>Width
          <WidthPickerSC name="width" value={width} onChange={inputHandler} type="number"/>
        </SmallLabelSC>
      </DividerSC>
      
      <LabelSC>Opacity
        <OpacityPickerSC name="opacity" value={opacity * 100} onChange={inputHandler} type="number" />
        <OpacitySliderSC name="opacity" value={opacity * 100} onChange={inputHandler} type="range" min="0" max="100" />
      </LabelSC>
      
    </ToolCardSC>
  )
}