import React from "react";

import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import { MenuBar, Menu, MenuBranch, MenuItem } from "../components/Menu";
import menuAction from "../actions/redux/menuAction";
import { toggleAboutModal } from "../actions/redux/index";

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
  const activeLayer = useSelector(state => state.main.present.activeLayer);
  const selectionPath = useSelector(state => state.main.present.selectionPath);
  const pastLength = useSelector(state => state.main.past.length);
  const futureLength = useSelector(state => state.main.future.length);
  const clipboardIsUsed = useSelector(
    state => state.main.present.clipboardIsUsed
  );
  const dispatch = useDispatch();
  let mod = window.navigator.platform.includes("Mac") ? "Cmd" : "Ctrl";
  return (
    <TopBarSC>
      <MenuBar>
        <Menu id="File" label="File">
          <MenuItem disabled>New</MenuItem>
          <MenuItem disabled>Save</MenuItem>
          <MenuItem disabled>Import</MenuItem>
          <MenuBranch label="Export As">
            <MenuItem disabled>PDF</MenuItem>
            <MenuItem disabled>JPG</MenuItem>
            <MenuItem disabled>PNG</MenuItem>
          </MenuBranch>
        </Menu>
        <Menu id="Edit" label="Edit">
          <MenuItem
            label="Undo"
            hotkey={`${mod}+Z`}
            onClick={() => {
              dispatch(menuAction("undo"));
            }}
            disabled={!pastLength}
          />
          <MenuItem
            label="Redo"
            hotkey={`${mod}+Shift+Z`}
            onClick={() => dispatch(menuAction("redo"))}
            disabled={!futureLength}
          />
          <MenuItem
            label="Copy"
            hotkey={`${mod}+C`}
            onClick={() => dispatch(menuAction("copy"))}
            disabled={!selectionPath}
          />
          <MenuItem
            label="Paste"
            hotkey={`${mod}+V`}
            onClick={() => dispatch(menuAction("paste"))}
            disabled={!clipboardIsUsed}
          />
          <MenuItem
            label="Clear"
            hotkey={`Delete`}
            onClick={() => dispatch(menuAction("clear"))}
            disabled={!selectionPath}
          />
        </Menu>
        <Menu id="image" label="Image">
          <MenuItem 
            label="Brightness / Contrast"
            disabled
          />
          <MenuItem 
            label="Hue / Saturation"
            onClick={() => dispatch(menuAction("saturate"))}
          />
          <MenuItem 
            label="Desaturate"
            disabled
          />
          <MenuBranch label="Filter">
            <MenuItem 
              label="Blur"
              disabled
            />
            <MenuItem 
              label="Sharpen"
              disabled
            />
          </MenuBranch>
        </Menu>
        <Menu id="Layer" label="Layer">
          <MenuItem
            label="New Layer"
            hotkey={`${mod}+Shift+N`}
            onClick={() => dispatch(menuAction("newLayer"))}
          />
          <MenuItem
            label="Duplicate Layer"
            hotkey={`${mod}+J`}
            onClick={() => dispatch(menuAction("duplicate"))}
            disabled={!activeLayer}
          />
          <MenuItem
            label="Delete Layer"
            onClick={() => dispatch(menuAction("deleteLayer"))}
            disabled={!activeLayer}
          />
          <MenuItem
            label="Hide Layer"
            onClick={() => dispatch(menuAction("hideLayer"))}
            disabled={!activeLayer}
          />
          <MenuItem
            label="Rename Layer"
            onClick={() => dispatch(menuAction("renameLayer"))}
            disabled={!activeLayer}
          />
        </Menu>
        <Menu id="Selection" label="Selection">
          <MenuItem
            label="Deselect"
            hotkey={`${mod}+D`}
            onClick={() => dispatch(menuAction("deselect"))}
            disabled={!selectionPath}
          />
        </Menu>
        <Menu id="help" label="Help">
          <MenuItem
            label="About Photosmith"
            onClick={() => dispatch(toggleAboutModal())}
          />
        </Menu>
      </MenuBar>
      <RightBoxSC>
        <TitleSC>PhotoSmith Image Editor</TitleSC>
      </RightBoxSC>
    </TopBarSC>
  );
}
