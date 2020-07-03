import React from "react";

import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import { MenuBar, Menu, MenuBranch, MenuItem } from "../components/Menu";
import menuAction from "../actions/redux/menuAction";
import { toggleOverlay, setExportOptions } from "../actions/redux/index";

import filterAction from "../utils/filterAction";
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
  z-index: ${props => props.overlay ? 1 : 3};
  pointer-events: ${props => props.overlay ? "none" : "auto"};
`;

const RightBoxSC = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  width: 30%;
`;

const TitleSC = styled.h1`
  margin: 0;
  padding: 3px 10px 5px;
  font-size: ${props => props.theme.fontSizes.xLarge};
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
  const overlay = useSelector(state => state.ui.overlay);
  const dispatch = useDispatch();
  const mod = window.navigator.platform.includes("Mac") ? "Cmd" : "Ctrl";

  function exportAs(type, compression) {
    return async dispatch => {
      await dispatch(setExportOptions(type, compression));
      await dispatch(menuAction("export"));
      dispatch(setExportOptions());
    }  
  }

  return (
    <TopBarSC overlay={overlay}>
      <MenuBar>
        <Menu id="File" label="File">
          <MenuItem 
            label="New"
            onClick={() => dispatch(toggleOverlay("newDocument"))}
          />
          <MenuItem disabled>Save</MenuItem>
          <MenuItem onClick={() => dispatch(menuAction("import"))}>Import</MenuItem>
          <MenuBranch id="exportAs" label="Export As">
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
          <MenuBranch id="adjust" label="Adjust">
            <MenuItem 
              label="Brightness / Contrast"
              onClick={() => dispatch(toggleOverlay("filter", {filter: filter.brightnessContrast}))}
            />
            <MenuItem
              label="Hue / Saturation"
              onClick={() => dispatch(toggleOverlay("filter", {filter: filter.hueSaturation}))}
            />
            <MenuItem 
              label="Desaturate"
              onClick={() => dispatch(filterAction(filter.saturation.apply, {amount: -100}))}
            />
            <MenuItem 
              label="Invert"
              onClick={() => dispatch(filterAction(filter.invert.apply, {}))}
            />
          </MenuBranch>
          <MenuItem
            label="Resize"
            onClick={() => dispatch(toggleOverlay("resize"))}
          />
          <MenuItem
            label="Histogram"
            onClick={() => dispatch(toggleOverlay("histogram"))}
          />
          <MenuBranch id="filter" label="Filter">
            <MenuItem 
              label="Blur"
              onClick={() => dispatch(toggleOverlay("filter", {filter: filter.blur}))}
            />
            <MenuItem 
              label="Sharpen"
              onClick={() => dispatch(toggleOverlay("filter", {filter: filter.sharpen}))}
            />
            <MenuItem 
              label="Find Edges"
              onClick={() => dispatch(toggleOverlay("filter", {filter: filter.findEdges}))}
            />
            <MenuItem 
              label="Emboss"
              onClick={() => dispatch(toggleOverlay("filter", {filter: filter.emboss}))}
            />
            <MenuItem 
              label="Dodge"
              onClick={() => dispatch(toggleOverlay("filter", {filter: filter.dodge}))}
            />
            <MenuItem 
              label="Burn"
              onClick={() => dispatch(toggleOverlay("filter", {filter: filter.burn}))}
            />
            <MenuItem 
              label="Posterize"
              onClick={() => dispatch(toggleOverlay("filter", {filter: filter.posterize}))}
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
            label="About SnapShot"
            onClick={() => dispatch(toggleOverlay("about"))}
          />
          <MenuItem
            label="SnapShot Help"
            onClick={() => dispatch(toggleOverlay("help"))}
            disabled
          />
        </Menu>
      </MenuBar>
      <RightBoxSC>
        <TitleSC>SnapShot Image Editor</TitleSC>
      </RightBoxSC>
    </TopBarSC>
  );
}
