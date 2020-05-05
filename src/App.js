import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import AboutModal from "./components/AboutModal.js";
import TopBar from "./panels/TopBar.js";
import Workspace from "./panels/Workspace.js";
import ToolPanel from "./panels/ToolPanel.js";
import LayerPanel from "./panels/LayerPanel.js";

import {
  updateWorkspaceSettings,
  makeActiveTool,
  toggleAboutModal
} from "./actions/redux";
import menuAction from "./actions/redux/menuAction";

import { hotkey, hotkeyCtrl } from "./constants/hotkeys";

const AppSC = styled.div`
  text-align: center;
  display: flex;
  width: 100%;
  height: ${props => props.height}px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: "PT Sans", sans-serif;
`;

const AppContainerSC = styled.div`
  text-align: center;
  width: 100%;
  flex-shrink: 1;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  user-select: none;
`;

function App() {
  const height = useSelector(state => state.ui.workspaceSettings.height);
  const overlayVisible = useSelector(state => state.ui.overlayVisible);
  const transformImage = useSelector(state => state.ui.transformImage);
  const dispatch = useDispatch();

  useEffect(() => {
    const adjustSizing = () => {
      dispatch(
        updateWorkspaceSettings({
          width: window.innerWidth,
          height: window.innerHeight
        })
      );
    };
    const handleKeyDown = ev => {
      ev.preventDefault();
      if (overlayVisible !== null || transformImage !== null) {return}
      let keyCombo;
      let modifier = window.navigator.platform.includes("Mac")
        ? ev.metaKey
        : ev.ctrlKey;
      if (modifier) {
        keyCombo = hotkeyCtrl[ev.key];
      } else {
        keyCombo = hotkey[ev.key];
      }
      if (keyCombo === undefined) return;
      if (keyCombo.type === "activeTool") {
        dispatch(makeActiveTool(keyCombo.payload));
      } else {
        dispatch(menuAction(keyCombo.payload));
      }
    };
    window.addEventListener("resize", adjustSizing);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", adjustSizing);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [overlayVisible, transformImage]);

  return (
    <AppSC id="App" height={height}>
      <TopBar />
      <AppContainerSC>
        <ToolPanel />
        <Workspace />
        <LayerPanel />
      </AppContainerSC>
      {overlayVisible === "aboutModal" && <AboutModal turnOff={() => dispatch(toggleAboutModal())} />}
    </AppSC>
  );
}

export default App;
