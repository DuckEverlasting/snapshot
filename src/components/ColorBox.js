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
`

const TitleSC = styled.p`
  margin: 0 0 5px;
  padding: 3px;
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
  border: 1px solid black;
  display: block;
  cursor: pointer;
  z-index: 2;
`

const SecondaryColorSC = styled.div`
  position: absolute;
  right: 47px;
  bottom: 9px;
  width: 40px;
  height: 28px;
  background: ${props => props.color};
  border: 1px solid black;
  display: block;
  cursor: pointer;
  z-index: 1;
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
      <PrimaryColorLabelSC visible={true}>
        <PrimaryColorSC title="Primary Color" color={primaryHex}/>
        <ColorPickerSC value={primaryHex} onChange={primaryColorHandler} type="color"/>
      </PrimaryColorLabelSC>
      <SecondaryColorLabelSC visible={true}>
        <SecondaryColorSC title="Secondary Color" color={secondaryHex}/>
        <ColorPickerSC value={secondaryHex} onChange={secondaryColorHandler} type="color"/>
      </SecondaryColorLabelSC>
      <FontAwesomeIconSC title="Switch Colors" icon={faSync} onClick={switchColorsHandler}/>
    </ColorBoxSC>
  )
}
