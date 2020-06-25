import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import OverlayHandler from "./components/OverlayHandler.js";
import TopBar from "./panels/TopBar.js";
import WaitScreen from "./components/WaitScreen.js";
import Workspace from "./panels/Workspace.js";
import ToolPanel from "./panels/ToolPanel.js";
import LayerPanel from "./panels/LayerPanel.js";

import { makeActiveTool } from "./actions/redux";
import menuAction from "./actions/redux/menuAction";

import { hotkey, hotkeyCtrl } from "./constants/hotkeys";

const AppSC = styled.div`
  text-align: center;
  display: flex;
  width: 100%;
  height: 100vh;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: ${props => props.theme.fonts.main};
`;

const AppContainerSC = styled.div`
  position: relative;
  text-align: center;
  width: 100%;
  height: calc(100% - 35px);
  flex-shrink: 1;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: stretch;
  user-select: none;
`;

function App() {
  const overlay = useSelector(state => state.ui.overlay);
  const transformSelectionTarget = useSelector(state => state.main.present.transformSelectionTarget);
  const importImageFile = useSelector(state => state.ui.importImageFile);
  const appIsWaiting = useSelector(state =>state.ui.appIsWaiting);

  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = ev => {
      ev.preventDefault();
      if (overlay || transformSelectionTarget || importImageFile) {return}
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
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay, transformSelectionTarget, importImageFile]);

  return (
    <AppSC id="App">
      <TopBar />
      <AppContainerSC>
        <ToolPanel />
        <Workspace />
        <LayerPanel />
        <OverlayHandler />
      </AppContainerSC>
      {appIsWaiting && <WaitScreen />}
    </AppSC>
  );
}

export default App;
