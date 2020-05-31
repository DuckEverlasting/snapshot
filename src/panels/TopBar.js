import React from "react";

import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import { MenuBar, Menu, MenuBranch, MenuItem } from "../components/Menu";
import menuAction from "../actions/redux/menuAction";
import { toggleAboutModal, setFilterTool, toggleHelp, setExportOptions } from "../actions/redux/index";

import { filter } from "../utils/filters";

const TopBarSC = styled.div`
  position: relative;
  width: 100%;
  height: 35px;
  flex-shrink: 0;
  flex-grow: 0;
  margin: auto;
  position: relative;
  display: flex;
  justify-content: space-between;
  z-index: ${props => props.overlayVisible ? 1 : 3};
  pointer-events: ${props => props.overlayVisible ? "none" : "auto"};
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
  const overlayVisible = useSelector(state => state.ui.overlayVisible);
  const dispatch = useDispatch();
  let mod = window.navigator.platform.includes("Mac") ? "Cmd" : "Ctrl";

  function exportAs(type, compression) {
    return async dispatch => {
      await dispatch(setExportOptions(type, compression));
      await dispatch(menuAction("export"));
      dispatch(setExportOptions());
    }  
  }

  return (
    <TopBarSC overlayVisible={overlayVisible}>
      <MenuBar>
        <Menu id="File" label="File">
          <MenuItem disabled>New</MenuItem>
          <MenuItem disabled>Save</MenuItem>
          <MenuItem onClick={() => dispatch(menuAction("import"))}>Import</MenuItem>
          <MenuBranch label="Export As">
            <MenuItem disabled>PDF</MenuItem>
            <MenuItem onClick={() => dispatch(exportAs("image/jpeg"))}>JPG</MenuItem>
            <MenuItem onClick={() => dispatch(exportAs("image/png"))}>PNG</MenuItem>
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
          <MenuItem
            label="Free Transform"
            hotkey={`${mod}+R`}
            onClick={() => dispatch(menuAction("transform"))}
            disabled={!activeLayer}
          />
        </Menu>
        <Menu id="image" label="Image">
          <MenuItem 
            label="Brightness / Contrast"
            onClick={() => dispatch(setFilterTool("on", filter.brightness))}
          />
          <MenuItem
            label="Hue / Saturation"
            onClick={() => dispatch(setFilterTool("on", filter.saturation))}
          />
          <MenuItem 
            label="Desaturate"
            disabled
          />
          <MenuBranch label="Filter">
            <MenuItem 
              label="Blur"
              onClick={() => dispatch(setFilterTool("on", filter.blur))}
            />
            <MenuItem 
              label="Box Blur"
              onClick={() => dispatch(setFilterTool("on", filter.boxBlur))}
            />
            <MenuItem 
              label="Sharpen"
              onClick={() => dispatch(setFilterTool("on", filter.sharpen))}
            />
            <MenuItem 
              label="Find Edges"
              onClick={() => dispatch(setFilterTool("on", filter.findEdges))}
            />
            <MenuItem 
              label="Emboss"
              onClick={() => dispatch(setFilterTool("on", filter.emboss))}
            />
            <MenuItem 
              label="Dodge"
              onClick={() => dispatch(setFilterTool("on", filter.dodge))}
            />
            <MenuItem 
              label="Burn"
              onClick={() => dispatch(setFilterTool("on", filter.burn))}
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
          <MenuItem
            label="Photosmith Help"
            onClick={() => dispatch(toggleHelp())}
            disabled
          />
        </Menu>
      </MenuBar>
      <RightBoxSC>
        <TitleSC>PhotoSmith Image Editor</TitleSC>
      </RightBoxSC>
    </TopBarSC>
  );
}
