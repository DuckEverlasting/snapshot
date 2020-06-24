import React from "react";
import styled from "styled-components";

import { useDispatch } from "react-redux";

import { toggleOverlay } from "../actions/redux";

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
  line-height: 125%;
`

const ModalListSc = styled.ul`
  text-align: left;
  width: 600px;
  margin: auto;

  & li {
    margin-bottom: 1rem;
    list-style-type: disc;
  }
`

const SpacerSC = styled.div`
  height: 20px;
`

export default function AboutModal() {
  const dispatch = useDispatch();

  function handleClick() {
    dispatch(toggleOverlay("about"))
  }

  return (
    <AboutModalSC onClick={handleClick}>
      <InnerModalSC>
        <p>This app was created as an experiment testing the interactions between the Canvas API, React, and Redux. It is still a work in progress. Send all feedback to mklein246 at gmail.</p>
        <SpacerSC/>
        <p>Recent changes:</p>
        <SpacerSC/>
        <ModalListSc>
          <li>The app now supports importing and exporting images (import works through file menu or by drag-and-drop).</li>
          <li>Transform action has been implemented: Layers, selections, and imported images can be resized, moved, and rotated.</li>
          <li>Shift behavior has been added for transforms, and for many other tools.</li>
          <li>Filters now include blur, sharpen, emboss, posterize, and more.</li>
          <li>Burn, dodge, and saturation brush tools have been implemented.</li>
          <li>Clone brush tool has been implemented. (Hold alt to set origin.)</li>
          <li>Layer opacity and layer blending options havebeen added.</li>
        </ModalListSc>
      </InnerModalSC>
    </AboutModalSC>
  );
}
