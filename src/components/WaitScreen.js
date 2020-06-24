import React from "react";
import styled from "styled-components";

const WaitScreenSC = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: wait;
  z-index: 5;
`

export default function WaitScreen() {
  return (
      <WaitScreenSC />
  )
}