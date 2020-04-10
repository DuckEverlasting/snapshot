import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import { toggleHelp, setHelpTopic } from "../actions/redux";

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

const ContentBoxSC = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  margin: 5px;
  padding: 20px;
  background: #303030;
  border-radius: 3px;
`;

const TopicMenuSC = styled(ContentBoxSC)`
  margin-right: 2px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
`;

const TopicBoxSC = styled.div`
  margin-left: -20px;
  margin-top: -8px;
`;

const CurrentTopicSC = styled(ContentBoxSC)`
  margin-left: 2px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  color: white;

  & h2 {
    margin-bottom: 16px;
    text-align: center;
  }

  & p {
    line-height: 1.5rem;
    text-indent: initial;

    &::first-line {
      line-height: 1rem;
    }
  }

  & button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-family: "PT Sans";
    color: white;
    padding: 0;
    font-weight: bold;
  }
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

const CloseButtonSC = styled(Button)`
  margin-top: 5px;
  width: 200px;
  padding: 0 10px;
`;

export default function HelpModal() {
  const { height, width } = useSelector(state => state.ui.workspaceSettings);
  const currentTopic = useSelector(state => state.ui.currentHelpTopic);
  const dispatch = useDispatch();

  function handleKeyDown(ev) {
    if (ev.key === "Escape") {
      handleClose();
    }
    ev.stopPropagation();
  }

  function handleClose() {
    dispatch(toggleHelp());
  }

  console.log(currentTopic)

  return (
    <DraggableWindow name="Help" onKeyDown={handleKeyDown}>
      <HelpModalSC>
        <MainContentSC>
          <TopicMenu
            height={height * 0.6}
            width={width * 0.3}
            currentTopic={currentTopic}
            setCurrentTopic={topic => dispatch(setHelpTopic(topic))}
          />
          <TopicDisplay
            height={height * 0.6}
            width={width * 0.3}
            data={helpContent[currentTopic]}
            setCurrentTopic={topic => dispatch(setHelpTopic(topic))}
          />
        </MainContentSC>
        <CloseButtonSC onClick={handleClose}>CLOSE</CloseButtonSC>
      </HelpModalSC>
    </DraggableWindow>
  );
}

function TopicMenu({ height, width, currentTopic, setCurrentTopic }) {
  return (
    <TopicMenuSC height={height} width={width}>
      <TopicBoxSC>
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
      </TopicBoxSC>
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
