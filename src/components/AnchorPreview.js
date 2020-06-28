import React from 'react';
import styled from 'styled-components';

import rubberDuckImage from "../media/rubber-duck.svg";

const PreviewWrapper = styled.div`
  display: flex;
  position: relative;
  justify-content: ${props => props.horizontal};
  align-items: ${props => props.vertical};
  width: 70%;
  height: 70%;
  overflow: hidden;
`;

const PreviewBG = styled.img`
  width: 66.67%;
  height: auto;
`;

const SvgSC = styled.svg`
  position: absolute;
  &:not(:root) {
    width: 100%;
    height: auto;
  }
`

const coords = {
  "top-left": {innerRect: {x: 0, y: 0}, pic: {horizontal: "flex-start", vertical: "flex-start"}}, 
  "top-center": {innerRect: {x: 33.333, y: 0}, pic: {horizontal: "center", vertical: "flex-start"}}, 
  "top-right": {innerRect: {x: 66.667, y: 0}, pic: {horizontal: "flex-end", vertical: "flex-start"}}, 
  "center-left": {innerRect: {x: 0, y: 33.333}, pic: {horizontal: "flex-start", vertical: "center"}}, 
  "center-center": {innerRect: {x: 33.333, y: 33.333}, pic: {horizontal: "center", vertical: "center"}}, 
  "center-right": {innerRect: {x: 66.667, y: 33.333}, pic: {horizontal: "flex-end", vertical: "center"}}, 
  "bottom-left": {innerRect: {x: 0, y: 66.667}, pic: {horizontal: "flex-start", vertical: "flex-end"}}, 
  "bottom-center": {innerRect: {x: 33.333, y: 66.667}, pic: {horizontal: "center", vertical: "flex-end"}}, 
  "bottom-right": {innerRect: {x: 66.667, y: 66.667}, pic: {horizontal: "flex-end", vertical: "flex-end"}}, 
}

function AnchorPreview({value, disabled}) {
  return (
    <PreviewWrapper horizontal={coords[value].pic.horizontal} vertical={coords[value].pic.vertical}>
        <SvgSC viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="100" height="100" stroke="blue" fill="transparent" strokeWidth="2" />
          <rect x={coords[value].innerRect.x} y={coords[value].innerRect.y} width="33.333" height="33.333" stroke="red" fill="transparent" strokeWidth="2" />
        </SvgSC>
      <PreviewBG src={rubberDuckImage} />
    </PreviewWrapper>
  )
}

export default AnchorPreview;
