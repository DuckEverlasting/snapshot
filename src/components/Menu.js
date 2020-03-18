import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";

const MenuGroupSC = styled.div`
  display: flex;
  height: 100%;
  background: ${props => props.color};
  justify-content: flex-start;
  align-items: flex-end;
  overflow: visible;
  cursor: pointer;
  user-select: none;
  z-index: 99;
`;
const MenuItemSC = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 5px;
  background: ${props => props.active ? props.color : "none"};

  &:hover {
    background: ${props => props.color};
  }
`;
const MenuItemSectionSC = styled.p`
  &:first-child {
    padding-left: 20px;
    padding-right: 40px;
  }

  &:last-child {
    padding-right: 20px;
  }
`
const MenuSC = styled.div`
  width: 100%;
  background: ${props =>
    props.active ? props.colors.secondary : props.colors.primary
  };
`;
const MenuPanelSC = styled.div`
  position: absolute;
  background: ${props => props.color};
  padding: 5px 0;
`;
const MenuNameSC = styled.p`
  padding: 13px 10px 7px;
  font-size: 16px;

  &:hover {
    background: ${props => props.color};
  }
`;
const MenuBranchSC = styled.div`
  position: relative;
`;
const MenuBranchPanelSC = styled.div`
  position: absolute;
  width: 100%;
  background: ${props => props.color};
  left: 100%;
  top: -5px;
  padding: 5px 0;
`;

const MenuSettings = React.createContext();

const initMenuState = {
  menuIsActive: false,
  activeMenu: null,
  colors: {
    primary: "#303030",
    secondary: "#444444",
    terciary: "#555555"
  }
};

function MenuSettingsProvider({ overwriteInit, children }) {
  const [state, setState] = useState({ ...initMenuState, ...overwriteInit });

  const actions = {
    toggle: () =>
      setState({
        ...state,
        menuIsActive: !state.menuIsActive
      }),
    setActiveMenu: listId =>
      setState({
        ...state,
        activeMenu: listId
      }),
    setColors: newColors =>
      setState({
        ...state,
        colors: {
          ...state.colors,
          ...newColors
        }
      })
  };

  return (
    <MenuSettings.Provider value={{ ...state, ...actions }}>
      <MenuGroup>{children}</MenuGroup>
    </MenuSettings.Provider>
  );
}

export function MenuBar({ colors: initColors, children }) {
  return (
    <MenuSettingsProvider overwriteInit={initColors}>
      <MenuGroup>{children}</MenuGroup>
    </MenuSettingsProvider>
  );
}

function MenuGroup({ children }) {
  const { menuIsActive, toggle, colors } = useContext(MenuSettings);

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  });

  function handleClickInside(ev) {
    ev.stopPropagation();
    toggle();
  }

  function handleClickOutside() {
    if (menuIsActive) {
      toggle();
    }
  }

  return (
    <MenuGroupSC color={colors.primary} onClick={handleClickInside}>
      {children}
    </MenuGroupSC>
  );
}

export function Menu({ id, name, children }) {
  const {
    menuIsActive,
    activeMenu,
    setActiveMenu,
    colors
  } = useContext(MenuSettings);
  const isActiveMenu = activeMenu === id;

  function handleMouseOver() {
    setActiveMenu(id);
  }

  return (
    <MenuSC colors={colors} active={menuIsActive && isActiveMenu}>
      <MenuNameSC color={colors.secondary} onMouseOver={handleMouseOver}>
        {name}
      </MenuNameSC>
      {menuIsActive && isActiveMenu && (
        <MenuPanelSC color={colors.secondary}>{children}</MenuPanelSC>
      )}
    </MenuSC>
  );
}

export function MenuBranch({ name, children }) {
  const { colors } = useContext(MenuSettings);
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  let delay;

  function handleMouseEnter() {
    delay = setTimeout(() => setIsOpen(true), 500);
  }

  function handleMouseLeave() {
    clearTimeout(delay);
  }

  function handleMouseEnterChildren() {
    setIsActive(true);
  }

  function handleMouseLeaveChildren() {
    setIsActive(false);
  }

  return (
    <MenuBranchSC
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MenuItemSC color={colors.terciary} active={isActive}>
        <MenuItemSectionSC>{name}</MenuItemSectionSC>
        <MenuItemSectionSC>{">"}</MenuItemSectionSC>
      </MenuItemSC>
      {isOpen && (
        <MenuBranchPanelSC 
          onMouseEnter={handleMouseEnterChildren}
          onMouseLeave={handleMouseLeaveChildren}
          color={colors.secondary}
        >
          {children}
        </MenuBranchPanelSC>
      )}
    </MenuBranchSC>
  );
}

export function MenuItem({ onClick = () => null, name, hotkey, children }) {
  const { colors } = useContext(MenuSettings);

  return (
    <MenuItemSC color={colors.terciary} onClick={onClick}>
      {children ? (
        <MenuItemSectionSC>{children}</MenuItemSectionSC>
      ) : (
        <>
          <MenuItemSectionSC>{name}</MenuItemSectionSC>
          <MenuItemSectionSC>{hotkey}</MenuItemSectionSC>
        </>
      )}
    </MenuItemSC>
  );
}
