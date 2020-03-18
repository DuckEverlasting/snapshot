import React from "react";

import styled from "styled-components";
import { useDispatch } from "react-redux";

import {
  MenuBar,
  Menu,
  MenuBranch,
  MenuItem
} from "../components/Menu";
import menuAction from "../actions/redux/menuAction";

const TopBarSC = styled.div`
  width: 100%;
  height: 35px;
  flex-shrink: 0;
  flex-grow: 0;
  margin: auto;
  position: relative;
  display: flex;
  justify-content: space-between;
`;

const RightBoxSC = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  width: 30%;
`;

const TitleSC = styled.h1`
  margin: 0;
  padding: 3px 10px;
  font-size: 1.6rem;
  font-weight: bold;
  white-space: nowrap;
  user-select: none;
`;

export default function TopBar() {
  const dispatch = useDispatch();
  let mod = window.navigator.platform.includes("Mac") ? "Cmd" : "Ctrl";
  return (
    <TopBarSC>
      <MenuBar>
        <Menu id="File" name="File">
          <MenuItem>New</MenuItem>
          <MenuItem>Save</MenuItem>
          <MenuItem>Import</MenuItem>
          <MenuItem>Export</MenuItem>
        </Menu>
        <Menu id="Edit" name="Edit">
          <MenuItem
            name="Undo"
            hotkey={`${mod}+Z`}
            onClick={() => {dispatch(menuAction("undo"))}}
          />
          <MenuItem
            name="Redo"
            hotkey={`${mod}+Shift+Z`}
            onClick={() => dispatch(menuAction("redo"))}
          />
          <MenuItem
            name="Copy"
            hotkey={`${mod}+C`}
            onClick={() => dispatch(menuAction("copy"))}
          />
          <MenuItem
            name="Paste"
            hotkey={`${mod}+V`}
            onClick={() => dispatch(menuAction("paste"))}
          />
        </Menu>
        <Menu id="Layer" name="Layer">
          <MenuItem
            name="New Layer"
            hotkey={`${mod}+Shift+N`}
            onClick={() => dispatch(menuAction("newLayer"))}
          />
          <MenuItem
            name="Duplicate Layer"
            hotkey={`${mod}+J`}
            onClick={() => dispatch(menuAction("duplicate"))}
          />
          <MenuItem name="Delete Layer" onClick={() => dispatch(menuAction("deleteLayer"))} />
          <MenuItem name="Hide Layer" onClick={() => dispatch(menuAction("hideLayer"))} />
          <MenuItem name="Rename Layer" onClick={() => dispatch(menuAction("renameLayer"))} />
        </Menu>
        <Menu id="Selection" name="Selection">
          <MenuItem
            name="Deselect"
            hotkey={`${mod}+D`}
            onClick={() => dispatch(menuAction("deselect"))}
          />
        </Menu>
      </MenuBar>
      <RightBoxSC>
        <TitleSC>PhotoSmith Image Editor</TitleSC>
      </RightBoxSC>
    </TopBarSC>
  );
}
