import React from "react";
import styled from "styled-components";

const AboutModalSC = styled.div`
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, .8);
  height: 100vh;
  width: 100vw;
  z-index: 2;
`

const InnerModalSC = styled.div`
  border-radius: 10px;
  background: rgba(0, 0, 0, .95);
  color: white;
  padding: 40px;
  max-width: 800px;
`

const ModalListSc = styled.ul`
  text-align: left;
  width: 600px;
  margin: auto;
`

const SpacerSC = styled.div`
  height: 20px;
`

export default function AboutModal({turnOff}) { 
  return (
    <AboutModalSC onClick={turnOff}>
      <InnerModalSC>
        <p>This app was created as an experiment testing the interactions between the Canvas API, React, and Redux. It is still a work in progress. Send all feedback to mklein246 at gmail.</p>
        <SpacerSC/>
        <p>Some less obvious features that have been implemented:</p>
        <ModalListSc>
          <li>Double click on a layer name to rename it.</li>
          <li>Hold shift while drawing with the brush, pencil, or eraser tools to lock the axis.</li>
          <li>Hold ctrl while using the eyedropper tool to use the selection as the secondary color.</li>
        </ModalListSc>
      </InnerModalSC>
    </AboutModalSC>
  );
}
