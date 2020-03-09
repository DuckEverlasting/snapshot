import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import ToolBox from "../components/ToolBox.js"
import ColorBox from "../components/ColorBox.js"
import ToolCard from "../components/ToolCard.js"

const ToolPanelSC = styled.div.attrs(props => ({
  style: {
    height: `${props.height}px`
  }
}))`
  position: relative;
  width: 120px;
  border: 3px solid black;
  border-bottom-left-radius: 10px;
  border-top-left-radius: 10px;
  z-index: 1;
  background: #666666;
`;

const TitleSC = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 12%;
  margin: 0;
  font-size: 1.2rem;
`

const ToolPanelDividerSC = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: flex-end;
  height: 88%;
`

const SpacerSC = styled.div`
  flex-grow: 1;
`

export default function ToolPanel() {
  const height = useSelector(state => state.workspaceSettings.height);
  
  return (
    <ToolPanelSC height={height}>
      <TitleSC>Tools</TitleSC>
      <ToolPanelDividerSC>
        <ToolBox />
        <ColorBox />
        <ToolCard />
        <SpacerSC/>
      </ToolPanelDividerSC>
    </ToolPanelSC>
  );
}
