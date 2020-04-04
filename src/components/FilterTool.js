import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import { setFilterTool } from "../actions/redux";
import filterAction from "../actions/redux/filterAction";

import DraggableWindow from "./DraggableWindow";
import SliderInput from "./SliderInput";
import Button from "./Button";

const CheckboxSC = styled.label`
  display: flex;
  justify-content: center;
  padding: 5px 0 10px;
`

const FilterButtonSC = styled(Button)`
  margin-top: 5px;
  width: auto;
  padding: 0 10px;
`

let previewDelay;

export default function FilterTool() { 
  const [showPreview, setShowPreview] = useState(false);
  const [input, setInput] = useState({});
  const dispatch = useDispatch();
  const filter = useSelector(state => state.ui.currentFilter);
  const stagingCanvas = useSelector(state => state.main.present.layerData.staging);

  useEffect(() => {
    const initInput = {};
    Object.keys(filter.inputInfo).forEach(key => {
      initInput[key] = filter.inputInfo[key].init
    })
    setInput(initInput)
  }, [])

  useEffect(() => {
    if (showPreview) {
      dispatch(filterAction(filter.apply, input, true))
    } else if (stagingCanvas) {
      stagingCanvas.getContext("2d").clearRect(0, 0, stagingCanvas.width, stagingCanvas.height);
    }
  }, [showPreview])

  const handleChange = (key, value) => {
    setInput({...input, [key]: value})
    clearTimeout(previewDelay);
    if (showPreview) {
      previewDelay = setTimeout(() => {
        if (showPreview) {
          dispatch(filterAction(filter.apply, input, true))
        }
      }, 20)
    }
  }

  const handleKeyDown = ev => {
    if (ev.key === "Escape") {
      handleCancel();
    }
    ev.stopPropagation();
  }

  const handleApply = () => {
    dispatch(filterAction(filter.apply, input))
    dispatch(setFilterTool("off"));
  }

  const handleCancel = () => {
    stagingCanvas.getContext("2d").clearRect(0, 0, stagingCanvas.width, stagingCanvas.height);
    dispatch(setFilterTool("off"));
  }

  return (
    <DraggableWindow name={filter.name} onKeyDown={handleKeyDown}>
      {
        Object.keys(filter.inputInfo).map(key => {
          const {name, min, max, step, init} = filter.inputInfo[key];
          return <SliderInput
            name={name}
            value={input[key]}
            onChange={value => handleChange(key, value)}
            max={max}
            min={min}
            step={step}
          />
        })
      }
      <CheckboxSC>
        Show Preview
        <input type="checkbox" value={showPreview} onChange={() => setShowPreview(!showPreview)}/>
      </CheckboxSC>
      <div>
        <FilterButtonSC onClick={handleCancel}>CANCEL</FilterButtonSC>
        <FilterButtonSC onClick={handleApply}>APPLY</FilterButtonSC>
      </div>
    </DraggableWindow>
  );
}
