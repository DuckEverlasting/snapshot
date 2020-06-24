import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import FilterTool from "./FilterTool";
import HelpModal from "./HelpModal";
import HistogramModal from "./HistogramModal";
import AboutModal from "./AboutModal";

const OverlayBoxSC = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 5;
`

export default function OverlayHandler() {
  const overlay = useSelector(state => state.ui.overlay);

  function handleOverlay(overlay) {
    switch (overlay) {
      case "filter":
        return <FilterTool />
      case "help":
        return <HelpModal />
      case "histogram":
        return <HistogramModal />
      case "about":
        return <AboutModal />
      default:
        return null
    }
  }
  return (
    <>
      {overlay && 
      <OverlayBoxSC>{handleOverlay(overlay)}</OverlayBoxSC>}
    </>
  )
}