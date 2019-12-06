import React, { useState } from 'react';
import styled from 'styled-components';

import AboutModal from './components/AboutModal.js';
import Workspace from './panels/Workspace.js';
import ToolPanel from './panels/ToolPanel.js';
import LayerPanel from './panels/LayerPanel.js';

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

const TitleSC = styled.h1`
  color: white;
  font-size: 4rem;
  margin: 0;
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

  const handleModalButton = ev => {
    ev.preventDefault();
    setModalOn(true);
  }

  return (
    <AppSC>
      {modalOn && <AboutModal turnOff={() => setModalOn(false)}/>}
      <TitleSC>PhotoSmith</TitleSC>
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
