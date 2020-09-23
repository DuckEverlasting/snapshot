import React from "react";
import styled from "styled-components";

const WorkspaceSC = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid black;
  overflow: hidden;
  background: rgb(175, 175, 175);
  cursor: ${(props) => props.cursor};
  z-index: 2;
`;

export default function EmptyWorkspace() {
  return <WorkspaceSC />
}