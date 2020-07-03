import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import FilterTool from "../overlays/FilterTool";
import ResizeModal from "../overlays/ResizeModal";
import HelpModal from "../overlays/HelpModal";
import HistogramModal from "../overlays/HistogramModal";
import AboutModal from "../overlays/AboutModal";
import NewDocumentModal from "../overlays/NewDocumentModal";

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
      case "resize":
        return <ResizeModal />
      case "help":
        return <HelpModal />
      case "histogram":
        return <HistogramModal />
      case "about":
        return <AboutModal />
      case "newDocument":
        return <NewDocumentModal />
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