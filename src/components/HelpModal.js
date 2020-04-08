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
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;

const TopicSC = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-left: 20px;
  color: ${(props) => (props.isCurrentTopic ? "yellow" : "white")};

  & p {
    display: flex;
    align-items: center;
    padding: 5px 0;
    cursor: pointer;

    & span {
      padding: 3px 0;
    }

    & button {
      margin-left: 5px;
      border: none;
      background: none;
      outline: none;
      color: white;
      cursor: pointer;
      padding: 3px;
      display: inline-block;
      transform: rotate(${(props) => (props.isOpen ? "90deg" : "0")});
      transition: transform 0.2s;
    }
  }
`;

const CurrentTopicSC = styled.div`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
`;

const CloseButtonSC = styled(Button)`
  margin-top: 5px;
  width: 200px;
  padding: 0 10px;
`;

export default function HelpModal() {
  const { height, width } = useSelector((state) => state.ui.workspaceSettings);
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
            <TopicDisplay
              height={height * 0.6}
              width={width * 0.3}
              data={helpContent[currentTopic]}
              setCurrentTopic={setCurrentTopic}
            />
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
      {helpHierarchy &&
        helpHierarchy.map((el, i) => {
          return (
            <Topic
              data={el}
              key={el.slug + " " + i}
              currentTopic={currentTopic}
              setCurrentTopic={setCurrentTopic}
            />
          );
        })}
    </TopicMenuSC>
  );
}

function TopicDisplay({ height, width, data, setCurrentTopic }) {
  function handleClick(ev) {
    if (ev.target.name) {
      setCurrentTopic(ev.target.name)
    }
  }

  return (
    <CurrentTopicSC onClick={handleClick} height={height} width={width}>
      {data}
    </CurrentTopicSC>
  );
}

function Topic({ data, currentTopic, setCurrentTopic }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <TopicSC isOpen={isOpen} isCurrentTopic={data.slug === currentTopic}>
      <p>
        <span onClick={() => setCurrentTopic(data.slug)}>
          {data.displayName}
        </span>
        {data.contents && <button onClick={() => setIsOpen(!isOpen)}>></button>}
      </p>
      {data.contents &&
        isOpen &&
        data.contents.map((el, i) => (
          <Topic
            key={data.slug + " - " + el.slug + " " + i}
            data={el}
            currentTopic={currentTopic}
            setCurrentTopic={setCurrentTopic}
          />
        ))}
    </TopicSC>
  );
}
