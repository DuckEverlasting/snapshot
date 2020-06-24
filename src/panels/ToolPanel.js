import React from "react";
import styled from "styled-components";
import { PanelTitleSC } from "../styles/shared";

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
  border-top: 1px solid #222222;
  border-bottom: 2px solid #222222;
  background: #666666;
  z-index: 1;
`;

const TitleSC = styled(PanelTitleSC)``;

const ToolPanelDividerSC = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
`

const SpacerSC = styled.div`
  flex: 1 1 auto;
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
