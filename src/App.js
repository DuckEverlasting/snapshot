import React from 'react';
import styled from 'styled-components';

import Workspace from './panels/Workspace.js'
import ToolPanel from './panels/ToolPanel.js'
import LayerPanel from './panels/LayerPanel.js'

const AppSC = styled.div`
  text-align: center;
  display: flex;
  justify-content: center;
  margin-top: 10vh;
  user-select: none;
`

function App() {
  return (
    <AppSC>
      <ToolPanel />
      <Workspace />
      <LayerPanel />
    </AppSC>
  );
}

export default App;
