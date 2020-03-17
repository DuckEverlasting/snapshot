import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { toggleMenu, setActiveMenuList } from "../actions/redux";
import PropTypes from "prop-types";

const MenuSC = styled.div`
  position: relative;
  display: flex;
  background: #222222;
  justify-content: flex-start;
  align-items: flex-start;
  overflow: visible;
  cursor: pointer;
  z-index: 99;
`;
const MenuItemSC = styled.div`
  padding: 5px;

  &:hover {
    background: #444444;
  }
`;
const MenuListSC = styled.div`
  width: 100%;
  background: ${props => (props.active ? "#303030" : "#222222")};
`;
const MenuListPanelSC = styled.div`
  position: absolute;
  background: #303030;
`
const MenuNameSC = styled.p`
  padding: 10px 10px;

  &:hover {
    background: #303030;
  }
`;
const MenuSubListSC = styled.div`
  position: relative;
`;
const MenuSubListPanelSC = styled.div`
  position: absolute;
  width: 100%;
  background: #303030;
  left: 100%;
  top: 0;
`;

export function MenuContainer({ children }) {
  const isActive = useSelector(state => state.ui.menuIsActive);
  const dispatch = useDispatch();

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  });

  function handleClickInside(ev) {
    ev.stopPropagation();
    dispatch(toggleMenu());
  }

  function handleClickOutside() {
    if (isActive) {
      dispatch(toggleMenu());
    }
  }

  return <MenuSC onClick={handleClickInside}>{children}</MenuSC>;
}

export function MenuList({ id, name, children }) {
  const dispatch = useDispatch();
  const activeMenuList = useSelector(state => state.ui.activeMenuList === id);
  const menuIsActive = useSelector(state => state.ui.menuIsActive);

  function handleMouseOver() {
    dispatch(setActiveMenuList(id));
  }

  return (
    <MenuListSC active={activeMenuList && menuIsActive}>
      <MenuNameSC onMouseOver={handleMouseOver}>{name}</MenuNameSC>
      {menuIsActive && activeMenuList && (
        <MenuListPanelSC>{children}</MenuListPanelSC>
      )}
    </MenuListSC>
  );
}

export function MenuSubList({ name, children }) {
  const [isOpen, setIsOpen] = useState(false);
  let delay;

  function handleMouseEnter() {
    delay = setTimeout(() => setIsOpen(true), 500);
  }

  function handleMouseLeave() {
    clearTimeout(delay);
  }

  return (
    <MenuSubListSC
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <MenuItemSC>{name}</MenuItemSC>
      {isOpen && <MenuSubListPanelSC>{children}</MenuSubListPanelSC>}
    </MenuSubListSC>
  );
}

export function MenuItem({ onClick = () => null, children }) {
  return (
    <MenuItemSC onClick={onClick}>
      {typeof children === "string" ? <p>{children}</p> : children}
    </MenuItemSC>
  );
}

MenuList.propTypes = {
  activeList: PropTypes.string,
  handleHover: PropTypes.func,
  name: PropTypes.string.isRequired
};
