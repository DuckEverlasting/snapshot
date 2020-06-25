import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import useWait from "../hooks/useWait";

import { toggleOverlay, setAppIsWaiting } from "../actions/redux";
import render from "../actions/redux/renderCanvas";
import filterAction from "../utils/filterAction";

import DraggableWindow from "./DraggableWindow";
import SliderInput from "./SliderInput";
import RadioInput from "./RadioInput";
import CheckboxInput from "./CheckboxInput";
import Button from "./Button";

const FilterToolSC = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: -5px;
  align-items: center;
  min-width: 180px;
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
  const stagingCanvas = useSelector(state => state.main.present.layerCanvas.staging);

  const [isWaiting, withWaiting] = useWait(2);

  useEffect(() => {
    const initInput = {};
    Object.keys(filter.inputInfo).forEach(key => {
      initInput[key] = filter.inputInfo[key].init
    })
    setInput(initInput)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isWaiting && filter.delay > 50) {
      dispatch(setAppIsWaiting(true));
    } else {
      dispatch(setAppIsWaiting(false));
    }
    return () => dispatch(setAppIsWaiting(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWaiting]);
  
  useEffect(() => {
    if (showPreview) {
      withWaiting(() => {
        dispatch(filterAction(
          filter.apply,
          {...input, width: stagingCanvas.width},
          true
        ))
      })
    } else if (stagingCanvas) {
      stagingCanvas.getContext("2d").clearRect(0, 0, stagingCanvas.width, stagingCanvas.height);
      dispatch(render());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview]);

  const handleChange = async (key, value) => {
    setInput({...input, [key]: value})
  }

  useEffect(() => {
    clearTimeout(previewDelay);
    if (showPreview) {
      previewDelay = setTimeout(() => {
        if (showPreview) {
          withWaiting(() => {
              dispatch(filterAction(
              filter.apply,
              { ...input, width: stagingCanvas.width },
              true
            ))
          });
        }
      }, filter.delay);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const handleKeyDown = ev => {
    if (ev.key === "Escape") {
      handleCancel();
    }
    ev.stopPropagation();
  }

  const handleApply = () => {
    withWaiting(() => {
      dispatch(filterAction(
        filter.apply,
        {...input, width: stagingCanvas.width}
      ));
      dispatch(toggleOverlay("filter"));
    }, true);
  }

  const handleCancel = () => {
    stagingCanvas.getContext("2d").clearRect(0, 0, stagingCanvas.width, stagingCanvas.height);
    dispatch(render());
    dispatch(toggleOverlay("filter"));
  }

  const checkRequirementsMet = () => {
    let result = true;
    Object.keys(filter.inputInfo).forEach(key => {
      const info = filter.inputInfo[key];
      if (info.required && !input[key] && input[key] !== 0) {
        result = false;
      }
    })
    return result;
  }

  return (
    <DraggableWindow name={filter.name} onKeyDown={handleKeyDown} resizable={false}>
      <FilterToolSC>
        {
          Object.keys(filter.inputInfo).map((key, i) => {
            const info = filter.inputInfo[key];
            if (info.type === "Number") {
              return <SliderInput
                name={info.name}
                key={i + " " + key}
                value={input[key]}
                onChange={value => handleChange(key, value)}
                max={info.max}
                min={info.min}
                step={info.step}
              />
            } else if (info.type === "Radio") {
              return <RadioInput
                name={info.name}
                key={i + " " + key}
                selected={input[key]}
                onChange={value => handleChange(key, value)}
                options={info.options}
              />
            } else if (info.type === "Checkbox") {
              return <CheckboxInput
                name={info.name}
                key={i + " " + key}
                selected={input[key]}
                onChange={value => handleChange(key, value)}
              />
            } else {
              return null;
            }
          })
        }
        <CheckboxSC>
          Show Preview
          <input type="checkbox" value={showPreview} onChange={() => setShowPreview(!showPreview)}/>
        </CheckboxSC>
        <div>
          <FilterButtonSC onClick={handleCancel}>CANCEL</FilterButtonSC>
          <FilterButtonSC disabled={!checkRequirementsMet()} onClick={handleApply}>APPLY</FilterButtonSC>
        </div>
      </FilterToolSC>
    </DraggableWindow>
  );
}
