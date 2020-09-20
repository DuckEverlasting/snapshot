import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import useEventListener from "./hooks/useEventListener";
import styled from "styled-components";

import OverlayHandler from "./components/OverlayHandler.js";
import WaitScreen from "./components/WaitScreen.js";
import TopBar from "./panels/TopBar.js";
import Workspace from "./panels/Workspace.js";
import EmptyWorkspace from "./panels/EmptyWorkspace.js";
import ToolPanel from "./panels/ToolPanel.js";
import LayerPanel from "./panels/LayerPanel.js";

import { setActiveTool } from "./actions/redux";
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
  const transformTarget = useSelector(state => state.ui.transformTarget);
  const importImageFile = useSelector(state => state.ui.importImageFile);
  const appIsWaiting = useSelector(state => state.ui.appIsWaiting);
  const activeProject = useSelector(state => state.main.activeProject);

  const dispatch = useDispatch();

  const handleKeyDown = useCallback(e => {
    if (overlay || transformTarget || importImageFile) {return}
    let keyCombo;
    let modifier = window.navigator.platform.includes("Mac")
      ? e.metaKey
      : e.ctrlKey;
    if (modifier) {
      keyCombo = hotkeyCtrl[e.key];
    } else {
      keyCombo = hotkey[e.key];
    }
    if (keyCombo === undefined) return;
    e.preventDefault();
    if (keyCombo.type === "activeTool") {
      dispatch(setActiveTool(keyCombo.payload));
    } else {
      dispatch(menuAction(keyCombo.payload));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay, transformTarget, importImageFile]);

  useEventListener("keydown", handleKeyDown)

  return (
    <AppSC id="App">
      <TopBar />
      <AppContainerSC>
        <ToolPanel />
        {activeProject ? <Workspace /> : <EmptyWorkspace />}
        <LayerPanel />
        <OverlayHandler />
      </AppContainerSC>
      {appIsWaiting && <WaitScreen />}
    </AppSC>
  );
}

export default App;
