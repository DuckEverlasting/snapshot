import React from "react";
import { useSelector } from "react-redux";

import styled from "styled-components";

const TopBarSC = styled.div`
  height: 80px;
  width: ${props => props.width}px;
  margin: auto;
  position: relative;
  display: flex;
  justify-content: space-between;
`

const LeftBoxSC = styled.div`
  display: flex;
  align-items: flex-end;
  width: 30%;
`

const RightBoxSC = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  width: 30%;
`

const MenuSC = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  background: #666666;
  padding: 5px;
  font-size: 1rem;
  max-width: 5rem;
  font-weight: bold;
  border: 2px solid black;
  border-bottom: none;
  flex-grow: 1;
  user-select: none;

  &:first-child {
    border-top-left-radius: 10px;
  }

  &:last-child {
    border-top-right-radius: 10px;
  }
`

const TitleSC = styled.h1`
  background: #666666;
  margin: 0;
  padding: 3px 10px;
  font-size: 1.6rem;
  font-weight: bold;
  border: 2px solid black;
  border-bottom: none;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`

export default function TopBar() {
  const { width } = useSelector(state => state.workspaceSettings);

  return (
    <TopBarSC width={width}>
      <LeftBoxSC>
        <MenuSC>File</MenuSC>
        <MenuSC>Edit</MenuSC>
        <MenuSC>Layer</MenuSC>
      </LeftBoxSC>
      <RightBoxSC>
        <TitleSC>PhotoSmith Image Editor</TitleSC>
      </RightBoxSC>
    </TopBarSC>
  );
}
