import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import { toggleHelp } from "../actions/redux";

import { helpHierarchy, helpContent } from "../enums/helpDocumentation";

import DraggableWindow from "./DraggableWindow";
import Button from "./Button";

const HelpModalSC = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

const MainContentSC = styled.div`
  display: flex;
`;

const TopicMenuSC = styled.div`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
`;

const CurrentTopicSC = styled.div`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
`;

const CloseButtonSC = styled(Button)`
  margin-top: 5px;
  width: 200px;
  padding: 0 10px;
`;

export default function HelpModal() {
  const { height, width } = useSelector(state => state.ui.workspaceSettings);
  const dispatch = useDispatch();

  const [currentTopic, setCurrentTopic] = useState(null);

  function handleKeyDown(ev) {
    if (ev.key === "Escape") {
      handleClose();
    }
    ev.stopPropagation();
  }

  function handleClose() {
    dispatch(toggleHelp());
  }

  return (
    <DraggableWindow name="Help" onKeyDown={handleKeyDown}>
      <HelpModalSC>
        <MainContentSC>
          <TopicMenu
            height={height * 0.6}
            width={width * 0.3}
            currentTopic={currentTopic}
            setCurrentTopic={setCurrentTopic}
          />
          {currentTopic && (
            <CurrentTopicSC height={height * 0.6} width={width * 0.3} />
          )}
        </MainContentSC>
        <CloseButtonSC onClick={handleClose}>CLOSE</CloseButtonSC>
      </HelpModalSC>
    </DraggableWindow>
  );
}

function TopicMenu({ height, width, currentTopic, setCurrentTopic }) {
  return (
    <TopicMenuSC height={height} width={width}>
      {helpHierarchy && helpHierarchy.forEach()}
    </TopicMenuSC>
  );
}

function TopicDisplay({ height, width, currentTopic, setCurrentTopic }) {
  return (
    <CurrentTopicSC height={height} width={width}>
      {helpContent[currentTopic]}
    </CurrentTopicSC>
  );
}
