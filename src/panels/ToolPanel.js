import React from "react";
import styled from "styled-components";

import ToolBox from "../components/ToolBox.js"
import ColorBox from "../components/ColorBox.js"
import ToolCard from "../components/ToolCard.js"

const ToolPanelSC = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 150px;
  height: 100%;
  flex-shrink: 0;
  border-top: 1px solid black;
  background: #666666;
  z-index: 1;
`;

const TitleSC = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 0 20px;
  font-size: 24px;
  margin: 0;
`

const ToolPanelDividerSC = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: flex-end;
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
        <SpacerSC />
      </ToolPanelDividerSC>
    </ToolPanelSC>
  );
}
