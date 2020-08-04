import React, { useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import useEventListener from "./hooks/useEventListener";
import styled from "styled-components";

import OverlayHandler from "./components/OverlayHandler.js";
import TopBar from "./panels/TopBar.js";
import WaitScreen from "./components/WaitScreen.js";
import Workspace from "./panels/Workspace.js";
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

const HiddenInputSC = styled.input`
  position: absolute;
  visibility: hidden;
`

function App() {
  const overlay = useSelector(state => state.ui.overlay);
  const transformTarget = useSelector(state => state.ui.transformTarget);
  const importImageFile = useSelector(state => state.ui.importImageFile);
  const appIsWaiting = useSelector(state =>state.ui.appIsWaiting);

  const inputRef = useRef(null);

  const dispatch = useDispatch();

  const handleKeyDown = useCallback(ev => {
    if (overlay || transformTarget || importImageFile) {return}
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
    ev.preventDefault();
    if (keyCombo.type === "activeTool") {
      dispatch(setActiveTool(keyCombo.payload));
    } else {
      dispatch(menuAction(keyCombo.payload));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay, transformTarget, importImageFile]);

  const handleKeyUp = useCallback(ev => {
    ev.preventDefault();
    if (ev.key === "Alt") {
      setTimeout(() => inputRef.current.click(), 10);
    }
  }, [])

  useEventListener("keydown", handleKeyDown)
  useEventListener("keypress", handleKeyUp)

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
      <HiddenInputSC onClick={() => console.log("CLIIIICK")} ref={inputRef} />
    </AppSC>
  );
}

export default App;
