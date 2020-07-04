import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import styled from "styled-components";

const MenuGroupSC = styled.div`
  display: flex;
  height: 100%;
  background: ${(props) => props.color};
  font-size: ${(props) => props.size * 0.9}rem;
  justify-content: flex-start;
  align-items: flex-end;
  overflow: visible;
  cursor: ${(props) => props.cursor || "auto"};
  user-select: none;
`;
const MenuItemSC = styled.div`
  display: flex;
  justify-content: space-between;
  white-space: nowrap;
  padding: ${(props) => props.size * 7}px ${(props) => props.size * 4}px;
  background: ${(props) =>
    props.active && !props.disabled ? props.color : "none"};
  color: ${(props) => (props.disabled ? "grey" : "inherit")};

  &:hover {
    background: ${(props) => (!props.disabled ? props.color : "none")};
  }
`;
const MenuItemSectionSC = styled.p`
  &:first-child {
    padding-left: ${(props) => props.size * 16}px;
    padding-right: ${(props) => props.size * 32}px;
  }

  &:last-child {
    padding-right: ${(props) => props.size * 16}px;
  }
`;
const MenuSC = styled.div`
  width: 100%;
  height: 100%;
  background: ${(props) =>
    props.active ? props.colors.secondary : props.colors.primary};
`;
const MenuPanelSC = styled.div`
  position: absolute;
  background: ${(props) => props.color};
  padding: ${(props) => props.size * 4}px 0;
`;
const MenuLabelSC = styled.div`
  display: flex;
  align-items: flex-end;
  height: 100%;

  &:hover {
    background: ${(props) => props.color};
  }

  & p {
    padding: ${(props) =>
      props.size * 10 + "px " + props.size * 8 + "px " + props.size * 6 + "px"};
  }
`;
const MenuBranchSC = styled.div`
  position: relative;
`;
const MenuBranchPanelSC = styled.div`
  position: absolute;
  width: auto;
  background: ${(props) => props.color};
  left: 100%;
  top: -${(props) => props.size * 4}px;
  padding: ${(props) => props.size * 4}px 0;
`;

const MenuSettings = React.createContext();

const initMenuState = {
  menuIsActive: false,
  menuIsDisabled: false,
  activeMenu: null,
  activeMenuBranch: null,
  colors: {
    primary: "#303030",
    secondary: "#444444",
    terciary: "#555555",
  },
  size: 1,
};

const parseSize = (newSize) => {
  const sizes = {
    small: 0.8,
    medium: 1,
    large: 1.2,
  };

  if (typeof newSize === "number") {
    return newSize;
  } else if (newSize.toLowerCase() in sizes) {
    return sizes[newSize.toLowerCase()];
  } else {
    return "medium";
  }
};

const parseInit = (init) => {
  if (init && "size" in init) {
    init.size = parseSize(init.size);
  }
  return init;
};

function MenuSettingsProvider({ overrideInit, children }) {
  const [state, setState] = useState({
    ...initMenuState,
    ...parseInit(overrideInit),
  });

  const actions = {
    setMenuIsActive: (bool) =>
      setState((prevState) => ({
        ...prevState,
        menuIsActive: bool,
      })),
    setMenuIsDisabled: (bool) =>
      setState((prevState) => ({
        ...prevState,
        menuIsDisabled: bool,
      })),
    setActiveMenu: (menuId) =>
      setState((prevState) => ({
        ...prevState,
        activeMenu: menuId,
      })),
    setActiveMenuBranch: (branchId) =>
      setState((prevState) => ({
        ...prevState,
        activeMenuBranch: branchId,
      })),
    setColors: (newColors) =>
      setState((prevState) => ({
        ...prevState,
        colors: {
          ...prevState.colors,
          ...newColors,
        },
      })),
    setSize: (newSize) =>
      setState((prevState) => ({
        ...prevState,
        size: parseSize(newSize),
      })),
    resetMenu: () =>
      setState({
        ...initMenuState,
        ...parseInit(overrideInit),
      })
  };

  return (
    <MenuSettings.Provider value={{ ...state, ...actions }}>
      <MenuGroup>{children}</MenuGroup>
    </MenuSettings.Provider>
  );
}

export function MenuBar({ colors: initColors, children, disabled=false}) {
  return (
    <MenuSettingsProvider overrideInit={initColors}>
      <MenuGroup disabled={disabled}>{children}</MenuGroup>
    </MenuSettingsProvider>
  );
}

function MenuGroup({ children, disabled }) {
  const { menuIsActive, setMenuIsActive, setMenuIsDisabled, colors, size } = useContext(
    MenuSettings
  );

  const handleClickOutside = useCallback(() => {
    if (menuIsActive) {
      setMenuIsActive(false);
    }
  }, [menuIsActive, setMenuIsActive]);

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    setMenuIsDisabled(disabled);
  }, [disabled])

  function handleClickInside(ev) {
    ev.stopPropagation();
    setMenuIsActive(!menuIsActive);
  }

  return (
    <MenuGroupSC color={colors.primary} size={size} onClick={handleClickInside}>
      {children}
    </MenuGroupSC>
  );
}

export function Menu({ id, label, children }) {
  const { menuIsActive, activeMenu, setActiveMenu, colors, size } = useContext(
    MenuSettings
  );
  const isActiveMenu = activeMenu === id;

  function handleMouseOver() {
    setActiveMenu(id);
  }

  return (
    <MenuSC colors={colors} active={menuIsActive && isActiveMenu}>
      <MenuLabelSC
        color={colors.secondary}
        size={size}
        onMouseOver={handleMouseOver}
      >
        <p>{label}</p>
      </MenuLabelSC>
      {menuIsActive && isActiveMenu && (
        <MenuPanelSC color={colors.secondary} size={size}>
          {children}
        </MenuPanelSC>
      )}
    </MenuSC>
  );
}

export function MenuBranch({ id, label, children }) {
  const { colors, size, activeMenuBranch, setActiveMenuBranch } = useContext(MenuSettings);
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  let delay;

  useEffect(() => {
    if (isOpen && activeMenuBranch !== id) {
      setIsOpen(false);
    }
  }, [activeMenuBranch])

  function handleMouseEnter() {
    delay = setTimeout(() => {
      setIsOpen(true);
      setActiveMenuBranch(id);
    }, 500);
  }

  function handleMouseLeave() {
    clearTimeout(delay);
  }

  function handleClick(ev) {
    clearTimeout(delay);
    setIsOpen(true);
    setActiveMenuBranch(id);
    ev.stopPropagation();
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
      onClick={handleClick}
    >
      <MenuItemSC color={colors.terciary} size={size} active={isActive}>
        <MenuItemSectionSC size={size}>{label}</MenuItemSectionSC>
        <MenuItemSectionSC size={size}>{">"}</MenuItemSectionSC>
      </MenuItemSC>
      {isOpen && (
        <MenuBranchPanelSC
          onMouseEnter={handleMouseEnterChildren}
          onMouseLeave={handleMouseLeaveChildren}
          color={colors.secondary}
          size={size}
        >
          {children}
        </MenuBranchPanelSC>
      )}
    </MenuBranchSC>
  );
}

export function MenuItem({
  onClick = null,
  disabled = false,
  label,
  hotkey,
  children,
}) {
  const { menuIsDisabled, colors, size, resetMenu } = useContext(MenuSettings);

  const menuItemRef = useRef(null);

  const clickHandler = (ev) => {
    if (disabled || menuIsDisabled) {
      return ev.stopPropagation();
    }
    resetMenu();
    return onClick(ev);
  };

  return (
    <MenuItemSC
      color={colors.terciary}
      size={size}
      onClick={clickHandler}
      disabled={disabled || menuIsDisabled}
    >
      {children ? (
        <MenuItemSectionSC size={size}>{children}</MenuItemSectionSC>
      ) : (
        <>
          <MenuItemSectionSC size={size}>{label}</MenuItemSectionSC>
          <MenuItemSectionSC size={size}>{hotkey}</MenuItemSectionSC>
        </>
      )}
    </MenuItemSC>
  );
}
