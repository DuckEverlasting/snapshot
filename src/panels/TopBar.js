import React, { useState } from "react";

import styled from "styled-components";

const TopBarSC = styled.div`
  width: 100%;
  height: 30px;
  flex-shrink: 0;
  margin: auto;
  position: relative;
  display: flex;
  justify-content: space-between;
`;

const LeftBoxSC = styled.div`
  display: flex;
  align-items: flex-end;
  width: 30%;
  padding-left: 20px;
`;

const RightBoxSC = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  width: 30%;
`;

const MenuSC = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 5px 15px;
  font-size: 1rem;
  max-width: 5rem;
  font-weight: bold;
  border-bottom: none;
  flex-grow: 1;
  user-select: none;
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
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [menuTree, setMenuTree] = useState(null);

  return (
    <TopBarSC>
      <LeftBoxSC>
        <MenuSC>
          File
          <div />
        </MenuSC>
        <MenuSC>
          Edit
          <div />
        </MenuSC>
        <MenuSC>
          Layer
          <div />
        </MenuSC>
      </LeftBoxSC>
      <RightBoxSC>
        <TitleSC>PhotoSmith Image Editor</TitleSC>
      </RightBoxSC>
    </TopBarSC>
  );
}
