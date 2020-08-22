import React from "react";

import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import selectFromActiveProject from "../utils/selectFromActiveProject";

import { MenuBar, Menu, MenuBranch, MenuItem } from "../components/Menu";
import menuAction from "../actions/redux/menuAction";
import { setOverlay, setExportOptions } from "../actions/redux/index";

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
  const overlay = useSelector(state => state.ui.overlay);
  const menuIsDisabled = useSelector(state => state.ui.menuIsDisabled);
  const dispatch = useDispatch();

  return (
    <TopBarSC overlay={!!overlay}>
      <MenuBar disabled={menuIsDisabled}>
        <FileMenu dispatch={dispatch} />
        <EditMenu dispatch={dispatch} />
        <ImageMenu dispatch={dispatch} />
        <LayerMenu dispatch={dispatch} />
        <SelectionMenu dispatch={dispatch} />
        <HelpMenu dispatch={dispatch} />
      </MenuBar>
      <RightBoxSC>
        <TitleSC>SnapShot Image Editor</TitleSC>
      </RightBoxSC>
    </TopBarSC>
  );
}


const FileMenu = ({dispatch}) => {
  function exportAs(type, compression) {
    return async dispatch => {
      await dispatch(setExportOptions(type, compression));
      await dispatch(menuAction("export"));
      dispatch(setExportOptions());
    }  
  }
  return (
    <Menu id="File" label="File">
      <MenuItem 
        label="New"
        onClick={() => dispatch(setOverlay("newDocument"))}
      />
      <MenuItem disabled>Save</MenuItem>
      <MenuItem onClick={() => dispatch(menuAction("import"))}>Import</MenuItem>
      <MenuBranch id="exportAs" label="Export As">
        <MenuItem disabled>PDF</MenuItem>
        <MenuItem onClick={() => dispatch(exportAs("image/jpeg"))}>JPG</MenuItem>
        <MenuItem onClick={() => dispatch(exportAs("image/png"))}>PNG</MenuItem>
      </MenuBranch>
    </Menu>
  )
}

const EditMenu = ({dispatch}) => {
  const activeProject = useSelector(state => state.main.activeProject);
  const [activeLayer, selectionPath] = useSelector(selectFromActiveProject("activeLayer", "selectionPath"));
  const clipboardIsUsed = useSelector(state => state.main.clipboardIsUsed);
  const [pastLength, futureLength] = useSelector(state => {
    return activeProject ? [
      state.main.projects[activeProject].past.length,
      state.main.projects[activeProject].future.length
    ] : [null, null]
  });
  const mod = window.navigator.platform.includes("Mac") ? "Cmd" : "Ctrl";

  return (
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
  )
}

const ImageMenu = ({dispatch}) => (
  <Menu id="image" label="Image">
    <MenuBranch id="adjust" label="Adjust">
      <MenuItem 
        label="Brightness / Contrast"
        onClick={() => dispatch(setOverlay("filter", {filter: filter.brightnessContrast}))}
      />
      <MenuItem
        label="Hue / Saturation"
        onClick={() => dispatch(setOverlay("filter", {filter: filter.hueSaturation}))}
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
      onClick={() => dispatch(setOverlay("resize"))}
    />
    <MenuItem
      label="Histogram"
      onClick={() => dispatch(setOverlay("histogram"))}
    />
    <MenuBranch id="filter" label="Filter">
      <MenuItem 
        label="Blur"
        onClick={() => dispatch(setOverlay("filter", {filter: filter.blur}))}
      />
      <MenuItem 
        label="Motion Blur"
        onClick={() => dispatch(setOverlay("filter", {filter: filter.motionBlur}))}
      />
      <MenuItem 
        label="Sharpen"
        onClick={() => dispatch(setOverlay("filter", {filter: filter.sharpen}))}
      />
      <MenuItem 
        label="Find Edges"
        onClick={() => dispatch(setOverlay("filter", {filter: filter.findEdges}))}
      />
      <MenuItem 
        label="Emboss"
        onClick={() => dispatch(setOverlay("filter", {filter: filter.emboss}))}
      />
      <MenuItem 
        label="Dodge"
        onClick={() => dispatch(setOverlay("filter", {filter: filter.dodge}))}
      />
      <MenuItem 
        label="Burn"
        onClick={() => dispatch(setOverlay("filter", {filter: filter.burn}))}
      />
      <MenuItem 
        label="Posterize"
        onClick={() => dispatch(setOverlay("filter", {filter: filter.posterize}))}
      />
    </MenuBranch>
  </Menu>
);

const LayerMenu = ({dispatch}) => {
  const activeLayer = useSelector(selectFromActiveProject("activeLayer"));
  const mod = window.navigator.platform.includes("Mac") ? "Cmd" : "Ctrl";

  return (
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
  )
}

const SelectionMenu = ({dispatch}) => {
  const mod = window.navigator.platform.includes("Mac") ? "Cmd" : "Ctrl";
  const [selectionActive, previousSelection] = useSelector(selectFromActiveProject(
    "selectionActive", "previousSelection"
  ));

  return (
    <Menu id="Selection" label="Selection">
      <MenuItem
        label="Deselect"
        hotkey={`${mod}+D`}
        onClick={() => dispatch(menuAction("deselect"))}
        disabled={!selectionActive}
      />
      <MenuItem
        label="Reselect"
        hotkey={`${mod}+Shift+D`}
        onClick={() => dispatch(menuAction("reselect"))}
        disabled={!previousSelection}
      />
    </Menu>
  )
}

const HelpMenu = ({dispatch}) => (
  <Menu id="help" label="Help">
    <MenuItem
      label="About SnapShot"
      onClick={() => dispatch(setOverlay("about"))}
    />
    <MenuItem
      label="SnapShot Help"
      onClick={() => dispatch(setOverlay("help"))}
      disabled
    />
  </Menu>
)