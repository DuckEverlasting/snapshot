import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { toggleOverlay, resetState, updateDocumentSettings } from "../actions/redux";

import Button from "../components/Button";
import NumberInput from "../components/NumberInput";
import DraggableWindow from "../components/DraggableWindow";

const NewDocumentModalSC = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: ${props => props.theme.fontSizes.small};
`

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

  const {documentWidth, documentHeight} = useSelector(
    state => state.main.present.documentSettings
  );
  const [width, setWidth] = useState(documentWidth);
  const [height, setHeight] = useState(documentHeight);
  const [name, setName] = useState("My Great Document")

  function keydownHandler(ev) {
    ev.stopPropagation();
  }


  function handleCreate(ev) {
    dispatch(async dispatch => {
      await dispatch(resetState());
      dispatch(updateDocumentSettings({
        documentWidth: width,
        documentHeight: height,
        documentName: name
      }, true));
    });
    ev.stopPropagation();
  }
  
  function handleCancel(ev) {
    dispatch(toggleOverlay("resize"));
    ev.stopPropagation();
  }

  function handleInput(ev, type) {
    switch (type) {
      case "width":
        setWidth(ev);
        break;
      case "height":
        setHeight(ev);
        break;
      case "name":
        setName(ev.target.value);
        break;
      default:
        break;
    }
  }

  return (
    <DraggableWindow
      name={"New Document"}
    >
      <NewDocumentModalSC>
        <InputRowSC>
            <label>
              Name
              <input
                type="text"
                onKeyDown={keydownHandler}
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
          />
          <NumberInput
            onChange={value => handleInput(value, "height")}
            value={height}
            name={"Height"}
            min={1}
            max={5000}
            rounding={2}
            inputWidth={"50px"}
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
