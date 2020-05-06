import React from "react";
import styled from "styled-components";

const DropZoneSC = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: all;
`

const DropZone = ({ onDrop }) => {
  const handleDragOver = ev => {
    ev.preventDefault();
  };
  const handleDrop = ev => {
    ev.preventDefault();
    onDrop(ev);
  };
  return (
    <DropZoneSC
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    />
  );
};
export default DropZone;
