import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import AboutModal from './components/AboutModal.js';
import TopBar from './panels/TopBar.js';
import Workspace from './panels/Workspace.js';
import ToolPanel from './panels/ToolPanel.js';
import LayerPanel from './panels/LayerPanel.js';

import { updateWorkspaceSettings, makeActiveTool } from './actions/redux';
import menuAction from './actions/redux/menuAction';

import { hotkey, hotkeyCtrl } from "./enums/hotkeys";

const AppSC = styled.div`
  text-align: center;
  display: flex;
  width: 100%;
  height: ${props => props.height}px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'PT Sans', sans-serif;
`

const AppContainerSC = styled.div`
  text-align: center;
  width: 100%;
  flex-shrink: 1;
  flex-grow: 1;
  display: flex;
  justify-content: center;  
  user-select: none;
`

const AboutButtonSC = styled.button`
  outline: none;
  background: #e3e3e3;
  right: 10px;
  bottom: 10px;
  margin-top: 10px;
`

function App() {
  const [modalOn, setModalOn] = useState(false)
  const height = useSelector(state => state.ui.workspaceSettings.height)
  const dispatch = useDispatch();

  useEffect(() => {
    const adjustSizing = () => {
      dispatch(updateWorkspaceSettings({ width: window.innerWidth, height: window.innerHeight}))
    }
    window.addEventListener("resize", adjustSizing)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("resize", adjustSizing)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleModalButton = ev => {
    ev.preventDefault();
    setModalOn(true);
  }

  const handleKeyDown = ev => {
    ev.preventDefault();
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

  return (
    <AppSC height={height}>
      {modalOn && <AboutModal turnOff={() => setModalOn(false)}/>}
      <TopBar/>
      <AppContainerSC>
        <ToolPanel />
        <Workspace />
        <LayerPanel />
      </AppContainerSC>
      {/* <AboutButtonSC onClick={handleModalButton}>About this project</AboutButtonSC> */}
    </AppSC>
  );
}

export default App;
