import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import ToolBox from "../components/ToolBox.js"
import ColorBox from "../components/ColorBox.js"
import ToolCard from "../components/ToolCard.js"

const ToolPanelSC = styled.div`
  position: relative;
  width: 120px;
  height: ${props => props.height}px;
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
  const { height } = useSelector(state => state.workspaceSettings);

  return (
    <ToolPanelSC height={height}>
      <TitleSC>Tools</TitleSC>
      <ToolPanelDividerSC>
        <ToolBox />
        <SpacerSC/>
        <ColorBox />
        <ToolCard />
      </ToolPanelDividerSC>
    </ToolPanelSC>
  );
}
