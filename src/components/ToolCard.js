import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { updateToolSettings } from "../actions";
import { toRgbaFromHex as toRgba, toHexFromRgba as toHex } from '../logic/colorConversion.js';

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
  const { activeTool, toolSettings } = useSelector(state => state);
  const { color: colorRgba, width } = toolSettings[activeTool];
  const dispatch = useDispatch();

  const { hex: colorHex, opacity } = toHex(colorRgba);

  const toolName = toolSettings[activeTool].name

  const inputColorHandler = ev => {
    let value = toRgba(ev.target.value, opacity);
    dispatch(updateToolSettings(activeTool, { ...toolSettings[activeTool], "color": value }))
  }

  const inputWidthHandler = ev => {
    let value = Number(ev.target.value);
    dispatch(updateToolSettings(activeTool, { ...toolSettings[activeTool], "width": value }))
  }

  const inputOpacityHandler = ev => {
    let value = toRgba(colorHex, Number(ev.target.value / 100));
    dispatch(updateToolSettings(activeTool, { ...toolSettings[activeTool], "color": value, "opacity": opacity }))
  }

  return (
    <ToolCardSC >
      <TitleSC>{toolName}</TitleSC>
      <DividerSC>
        <SmallLabelSC>Color
          <ColorPickerSC value={colorHex} onChange={inputColorHandler} type="color"/>
        </SmallLabelSC>
        <SmallLabelSC>Width
          <WidthPickerSC value={width} onChange={inputWidthHandler} type="number"/>
        </SmallLabelSC>
      </DividerSC>
      <LabelSC>Opacity
        <OpacityPickerSC value={opacity * 100} onChange={inputOpacityHandler} type="number" />
        <OpacitySliderSC value={opacity * 100} onChange={inputOpacityHandler} type="range" min="0" max="100" />
      </LabelSC>
    </ToolCardSC>
  )
}
