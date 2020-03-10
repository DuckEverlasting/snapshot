import React from "react";
import styled from "styled-components";

import ToolBox from "../components/ToolBox.js"
import ColorBox from "../components/ColorBox.js"
import ToolCard from "../components/ToolCard.js"

const ToolPanelSC = styled.div`
  position: relative;
  width: 150px;
  height: 100%;
  flex-shrink: 0;
  border: 3px solid black;
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
  return (
    <ToolPanelSC>
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
