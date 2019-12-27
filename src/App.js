import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import AboutModal from './components/AboutModal.js';
import TopBar from './panels/TopBar.js';
import Workspace from './panels/Workspace.js';
import ToolPanel from './panels/ToolPanel.js';
import LayerPanel from './panels/LayerPanel.js';

import { updateWorkspaceSettings } from './actions'

const AppSC = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 2vh;
`

const AppContainerSC = styled.div`
  text-align: center;
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
  const dispatch = useDispatch();

  useEffect(() => {
    const adjustSizing = () => {
      dispatch(updateWorkspaceSettings({ width: window.innerWidth * .7, height: window.innerHeight * .8}))
    }
    window.addEventListener("resize", adjustSizing)
    return () => window.removeEventListener("resize", adjustSizing)
  }, [dispatch])

  const handleModalButton = ev => {
    ev.preventDefault();
    setModalOn(true);
  }

  return (
    <AppSC>
      {modalOn && <AboutModal turnOff={() => setModalOn(false)}/>}
      <TopBar/>
      <AppContainerSC>
        <ToolPanel />
        <Workspace />
        <LayerPanel />
      </AppContainerSC>
      <AboutButtonSC onClick={handleModalButton}>About this project</AboutButtonSC>
    </AppSC>
  );
}

export default App;
