import React, { useState, useEffect, useContext, useCallback } from "react";
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
  width: 100%;
  background: ${(props) => props.color};
  left: 100%;
  top: -${(props) => props.size * 4}px;
  padding: ${(props) => props.size * 4}px 0;
`;

const MenuSettings = React.createContext();

const initMenuState = {
  menuIsActive: false,
  activeMenu: null,
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

function MenuSettingsProvider({ overwriteInit, children }) {
  const [state, setState] = useState({
    ...initMenuState,
    ...parseInit(overwriteInit),
  });

  const actions = {
    setMenuIsActive: (bool) =>
      setState((prevState) => ({
        ...prevState,
        menuIsActive: bool,
      })),
    setActiveMenu: (listId) =>
      setState((prevState) => ({
        ...prevState,
        activeMenu: listId,
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
  const { menuIsActive, setMenuIsActive, colors, size } = useContext(
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

export function MenuBranch({ label, children }) {
  const { colors, size } = useContext(MenuSettings);
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
  const { colors, size } = useContext(MenuSettings);

  const clickHandler = (ev) => {
    if (disabled) {
      return ev.stopPropagation();
    }
    return onClick(ev);
  };

  return (
    <MenuItemSC
      color={colors.terciary}
      size={size}
      onClick={clickHandler}
      disabled={disabled}
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
