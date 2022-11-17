import React, { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import useEventListener from "./hooks/useEventListener";
import styled from "styled-components";

import OverlayHandler from "./components/OverlayHandler.js";
import WaitScreen from "./components/WaitScreen.js";
import TopBar from "./panels/TopBar.js";
import { Workspace, EmptyWorkspace, ToolPanel, LayerPanel, ProjectBar } from "./panels";

import { setActiveTool, setModKeys } from "./store/actions/redux";
import menuAction from "./store/actions/redux/menuAction";

import { hotkey, hotkeyCtrl } from "./constants/hotkeys";

import render from "./store/actions/redux/renderCanvas";

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

const CenterSC = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

function App() {
  const overlay = useSelector(state => state.ui.overlay);
  const transformTarget = useSelector(state => state.ui.transformTarget);
  const importImageFile = useSelector(state => state.ui.importImageFile);
  const appIsWaiting = useSelector(state => state.ui.appIsWaiting);
  const activeProject = useSelector(state => state.main.activeProject);

  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(render())
    }, 100);
  
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = useCallback(e => {
    // Set input on state
    let modifier = window.navigator.platform?.includes("Mac")
      ? e.metaKey
      : e.ctrlKey;
    dispatch(
      setModKeys({
        modKeys: {
          shift: e.shiftKey,
          ctrl: modifier,
          alt: e.altKey
        }
      })
    );

    // Check if is valid key combo
    if (overlay || transformTarget || importImageFile) {return}
    let keyCombo;
    if (modifier) {
      keyCombo = hotkeyCtrl[e.key];
    } else {
      keyCombo = hotkey[e.key];
    }
    if (keyCombo === undefined) {
      return;
    }

    // Overwrite default action with app action
    e.preventDefault();
    if (keyCombo.type === "activeTool") {
      dispatch(setActiveTool(keyCombo.payload));
    } else {
      dispatch(menuAction(keyCombo.payload));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay, transformTarget, importImageFile]);

  const handleKeyUp = useCallback(e => {
    // Set input on state
    let modifier = window.navigator.platform?.includes("Mac")
      ? e.metaKey
      : e.ctrlKey;
    dispatch(
      setModKeys({
        modKeys: {
          shift: e.shiftKey,
          ctrl: modifier,
          alt: e.altKey
        }
      })
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEventListener("keydown", handleKeyDown);
  useEventListener("keydown", handleKeyUp);

  return (
    <AppSC id="App">
      <TopBar />
      <AppContainerSC>
        <ToolPanel />
        <CenterSC>
          <ProjectBar />
          {activeProject ? <Workspace /> : <EmptyWorkspace />}
        </CenterSC>
        <LayerPanel />
        <OverlayHandler />
      </AppContainerSC>
      {appIsWaiting && <WaitScreen />}
    </AppSC>
  );
}

export default App;
