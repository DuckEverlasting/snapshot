import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { setOverlay, createNewProject } from "../actions/redux";
import render from "../actions/redux/renderCanvas";

import Button from "../components/Button";
import NumberInput from "../components/NumberInput";
import DraggableWindow from "../components/DraggableWindow";
import selectFromActiveProject from "../utils/selectFromActiveProject";

const NewDocumentModalSC = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: ${props => props.theme.fontSizes.small};
`;

const InputRowSC = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  opacity: ${props => props.disabled ? ".333" : "1"};
  pointer-events: ${props => props.disabled ? "none" : "auto"};
`;

export default function NewDocumentModal() {
  const dispatch = useDispatch();

  const documentSettings = useSelector(selectFromActiveProject("documentSettings"));
  const {documentWidth, documentHeight} = documentSettings ? documentSettings : {};
  const [width, setWidth] = useState(documentWidth || 500);
  const [height, setHeight] = useState(documentHeight || 500);
  const [name, setName] = useState("My Great Document")

  function handleCreate(e) {
    create();
    e.stopPropagation();
  }

  function create() {
    dispatch(async dispatch => {
      await dispatch(createNewProject(name, width, height));
      dispatch(render());
    });
    dispatch(setOverlay(null));
  }
  
  function handleCancel(e) {
    cancel();
    e.stopPropagation();
  }

  function cancel() {
    dispatch(setOverlay(null));
  }

  function handleInput(e, type) {
    switch (type) {
      case "width":
        setWidth(e);
        break;
      case "height":
        setHeight(e);
        break;
      case "name":
        setName(e.target.value);
        break;
      default:
        break;
    }
  }

  return (
    <DraggableWindow
      name={"New Document"}
      onEscape={cancel}
      onEnter={create}
    >
      <NewDocumentModalSC>
        <InputRowSC>
            <label>
              Name
              <input
                type="text"
                onChange={value => {handleInput(value, "name")}}
                value={name}
              />
            </label>
        </InputRowSC>
        <InputRowSC>
          <NumberInput
            onChange={value => handleInput(value, "width")}
            value={width}
            name={"Width"}
            min={1}
            max={5000}
            rounding={2}
            inputWidth={"50px"}
            stopKeydown={false}
          />
          <NumberInput
            onChange={value => handleInput(value, "height")}
            value={height}
            name={"Height"}
            min={1}
            max={5000}
            rounding={2}
            inputWidth={"50px"}
            stopKeydown={false}
          />
        </InputRowSC>
        <InputRowSC>
          <Button onClick={handleCreate}>Create</Button>
          <Button onClick={handleCancel}>Cancel</Button>
        </InputRowSC>
      </NewDocumentModalSC>
    </DraggableWindow>
  );
}
