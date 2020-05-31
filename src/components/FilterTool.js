import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import { setFilterTool } from "../actions/redux";
import filterAction from "../utils/filterAction";

import DraggableWindow from "./DraggableWindow";
import SliderInput from "./SliderInput";
import Button from "./Button";

const FilterToolSC = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: -5px;
  align-items: center;
  width: 180px;
`

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
      dispatch(filterAction(filter.apply, {...input, width: stagingCanvas.width}, true))
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
          dispatch(filterAction(filter.apply, {...input, width: stagingCanvas.width}, true))
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
    dispatch(filterAction(filter.apply, {...input, width: stagingCanvas.width}))
    dispatch(setFilterTool("off"));
  }

  const handleCancel = () => {
    stagingCanvas.getContext("2d").clearRect(0, 0, stagingCanvas.width, stagingCanvas.height);
    dispatch(setFilterTool("off"));
  }

  return (
    <DraggableWindow name={filter.name} onKeyDown={handleKeyDown} resizable={false}>
      <FilterToolSC>
        {
          Object.keys(filter.inputInfo).map(key => {
            const info = filter.inputInfo[key];
            if (info.type === "Number") {
              return <SliderInput
                name={info.name}
                value={input[key]}
                onChange={value => handleChange(key, value)}
                max={info.max}
                min={info.min}
                step={info.step}
              />
            } else if (info.type === "Radio") {
              return <div>
                {
                  info.options.map(option => <input
                    type="radio"
                    name="type"
                    value={option}
                    onChange={() => handleChange(key, option)}
                  />)
                }
              </div>
            }
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
      </FilterToolSC>
    </DraggableWindow>
  );
}
