import React from "react";
import styled from "styled-components";
import { scrollbar } from "../styles/shared";

import { useDispatch } from "react-redux";

import { setOverlay } from "../store/actions/redux";

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
  overflow: auto;
`

const InnerModalSC = styled.div`
  border-radius: 10px;
  background: rgba(0, 0, 0, .95);
  color: white;
  max-width: 60%;
  line-height: 125%;
  height: 100%;
  max-height: 80%;
  overflow: hidden;
`

const InnerModalScrollSC = styled.div`
  height: 100%;
  width: 100%;
  padding: 40px;
  overflow: auto;

  ${scrollbar}
`

const ModalListSc = styled.ul`
  text-align: left;
  width: 75%;
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
    dispatch(setOverlay("about"))
  }

  return (
    <AboutModalSC onClick={handleClick}>
      <InnerModalSC>
        <InnerModalScrollSC>
          <p>SnapShot Image Editor v0.3.0</p>
          <SpacerSC/>
          <p>This app was created as an experiment testing the interactions between the Canvas API, React, and Redux. It is still a work in progress. Forgive the bugs.</p>
          <p>Send all feedback to mklein246 at gmail.</p>
          <SpacerSC/>
          <SpacerSC/>
          <p>Recent changes:</p>
          <SpacerSC/>
          <ModalListSc>
            <li>The app now supports importing and exporting images (import works through file menu or by drag-and-drop).</li>
            <li>Transform action has been implemented: Layers, selections, and imported images can be resized, moved, and rotated.</li>
            <li>Shift behavior has been added for transforms, and for many other tools.</li>
            <li>Filters now include blur, sharpen, emboss, posterize, and more.</li>
            <li>Selection tools (including the new Fill Select tool) can add to or remove fromcurrent selection with use of the shift and alt keys, respectively.</li>
            <li>Burn, dodge, and saturation brush tools have been implemented.</li>
            <li>Clone brush tool has been implemented. (Hold alt to set origin.)</li>
            <li>Layer opacity and layer blending options have been added.</li>
            <li>Crop tool has been implemented. Image size can also be adjusted with the "resize" menu option (Image / Resize) or by creating a new document (File / New).</li>
          </ModalListSc>
          <SpacerSC/>
          <SpacerSC/>
          <p>Coming up:</p>
          <SpacerSC/>
          <ModalListSc>
            <li>Work is currently being done on a backend that will allow for creating an account and saving files.</li>
            <li>Layer groups.</li>
            <li>Text and other vector-based objects.</li>
            <li>Efficiency boost for blur filters, as well as more options / different types of blurs.</li>
            <li>Curves adjustment tool.</li>
            <li>More robust documentation, and a searchable help menu!</li>
          </ModalListSc>
        </InnerModalScrollSC>
      </InnerModalSC>
    </AboutModalSC>
  );
}
