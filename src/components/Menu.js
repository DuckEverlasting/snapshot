import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const MenuSC = styled.div`
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
const MenuListSC = styled.div`
  width: 100%;
  background: ${props =>
    props.active ? props.colors.secondary : props.colors.primary
  };
`;
const MenuListPanelSC = styled.div`
  position: absolute;
  background: ${props => props.color};
  padding: 5px 0;
`;
const MenuListNameSC = styled.p`
  padding: 13px 10px 7px;
  font-size: 16px;

  &:hover {
    background: ${props => props.color};
  }
`;
const MenuSubListSC = styled.div`
  position: relative;
`;
const MenuSubListPanelSC = styled.div`
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
  activeMenuList: null,
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
    setActiveMenuList: listId =>
      setState({
        ...state,
        activeMenuList: listId
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
      <Menu>{children}</Menu>
    </MenuSettings.Provider>
  );
}

export function MenuContainer({ colors: initColors, children }) {
  return (
    <MenuSettingsProvider overwriteInit={initColors}>
      <Menu>{children}</Menu>
    </MenuSettingsProvider>
  );
}

function Menu({ children }) {
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

  function handleClickOutside(ev) {
    if (menuIsActive) {
      toggle();
    }
  }

  return (
    <MenuSC color={colors.primary} onClick={handleClickInside}>
      {children}
    </MenuSC>
  );
}

export function MenuList({ id, name, children }) {
  const {
    menuIsActive,
    activeMenuList,
    setActiveMenuList,
    colors
  } = useContext(MenuSettings);
  const isActiveList = activeMenuList === id;

  function handleMouseOver() {
    setActiveMenuList(id);
  }

  return (
    <MenuListSC colors={colors} active={menuIsActive && isActiveList}>
      <MenuListNameSC color={colors.secondary} onMouseOver={handleMouseOver}>
        {name}
      </MenuListNameSC>
      {menuIsActive && isActiveList && (
        <MenuListPanelSC color={colors.secondary}>{children}</MenuListPanelSC>
      )}
    </MenuListSC>
  );
}

export function MenuSubList({ name, children }) {
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
    <MenuSubListSC
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MenuItemSC color={colors.terciary} active={isActive}>
        <MenuItemSectionSC>{name}</MenuItemSectionSC>
        <MenuItemSectionSC>{">"}</MenuItemSectionSC>
      </MenuItemSC>
      {isOpen && (
        <MenuSubListPanelSC 
          onMouseEnter={handleMouseEnterChildren}
          onMouseLeave={handleMouseLeaveChildren}
          color={colors.secondary}
        >
          {children}
        </MenuSubListPanelSC>
      )}
    </MenuSubListSC>
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

MenuList.propTypes = {
  activeList: PropTypes.string,
  handleHover: PropTypes.func,
  name: PropTypes.string.isRequired
};
