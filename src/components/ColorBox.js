import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons'

import { updateColor, switchColors } from "../actions/redux";
import { toRgbaFromHex as toRgba, toHexFromRgba as toHex } from '../utils/colorConversion.js';

const ColorBoxSC = styled.div`
  position: relative;
  height: 96px;
  margin-bottom: 5px;
  flex-shrink: 0;
`

const TitleSC = styled.p`
  padding: 5px;
  border-top: 1px solid black;
  border-bottom: 1px dotted black;
`

const ColorPickerSC = styled.input`
  display: none;
`

const PrimaryColorSC = styled.div`
  position: absolute;
  left: 40px;
  bottom: 26px;
  width: 40px;
  height: 28px;
  background: ${props => props.color};
  border: 1px solid #e3e3e3;
  box-shadow: 0 0 0 1px black;
  display: block;
  cursor: pointer;
`

const SecondaryColorSC = styled.div`
  position: absolute;
  right: 47px;
  bottom: 9px;
  width: 40px;
  height: 28px;
  background: ${props => props.color};
  border: 1px solid #e3e3e3;
  box-shadow: 0 0 0 1px black;
  display: block;
  cursor: pointer;
`

const FontAwesomeIconSC = styled(FontAwesomeIcon)`
  position: absolute;
  right: 49px;
  bottom: 44%;
  font-size: 12px;
  cursor: pointer;
`

const PrimaryColorLabelSC = styled.label`
  font-size: 14px;
`

const SecondaryColorLabelSC = styled.label`
  font-size: 14px;
`

export default function ColorBox() {
  const { primary: primaryRgba, secondary: secondaryRgba } = useSelector(state => state.ui.colorSettings);
  const dispatch = useDispatch();

  const { hex: primaryHex, opacity: primaryOpacity } = toHex(primaryRgba);
  const { hex: secondaryHex, opacity: secondaryOpacity } = toHex(secondaryRgba);

  const primaryColorHandler = ev => {
    let value = toRgba(ev.target.value, primaryOpacity);
    dispatch(updateColor("primary", value))
  }

  const secondaryColorHandler = ev => {
    let value = toRgba(ev.target.value, secondaryOpacity);
    dispatch(updateColor("secondary", value))
  }

  const switchColorsHandler = () => {
    dispatch(switchColors())
  }

  return (
    <ColorBoxSC>
      <TitleSC>Color</TitleSC>
      <SecondaryColorLabelSC visible={true}>
        <SecondaryColorSC title="Secondary Color" color={secondaryHex}/>
        <ColorPickerSC value={secondaryHex} onChange={secondaryColorHandler} type="color"/>
      </SecondaryColorLabelSC>
      <PrimaryColorLabelSC visible={true}>
        <PrimaryColorSC title="Primary Color" color={primaryHex}/>
        <ColorPickerSC value={primaryHex} onChange={primaryColorHandler} type="color"/>
      </PrimaryColorLabelSC>
      <FontAwesomeIconSC title="Switch Colors" icon={faSync} onClick={switchColorsHandler}/>
    </ColorBoxSC>
  )
}
