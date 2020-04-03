import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import { setFilterTool } from "../actions/redux";
import filterAction from "../actions/redux/filterAction";

import SliderInput from "./SliderInput";
import Button from "./Button";

const FilterToolSC = styled.div`
  position: fixed;
  top: 0;
  height: 100vh;
  width: 100vw;
  z-index: 100;
  user-select: none;
  outline: none;
`

const InnerModalSC = styled.div.attrs(props => ({
  style: {
    transform: `translateX(${props.offset.x + 200}px)
    translateY(${props.offset.y + 100}px)`
  }
}))`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 3px;
  background: rgba(100, 100, 100, .9);
  box-shadow: 0 .5px 3px #222222;
  color: white;
`

const TitleSC = styled.h3.attrs(props => ({
  style: {
    background: props.caution ? "#ffe312" : "#303030",
    transition: props.caution ? "none" : "background 1s"
  }
}))`
  background: #303030;
  width: 100%;
  padding: 10px;
`

const ContentSC = styled.div`
  padding: 10px;
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: null, y: null });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [caution, setCaution] = useState(false);
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

  const handleMouseDown = ev => {
    if (ev.button !== 0) return;
    setIsDragging(true);
    setDragOrigin({x: ev.nativeEvent.screenX - offset.x, y: ev.nativeEvent.screenY - offset.y});
  };

  const handleMouseMove = ev => {
    if (!isDragging) {return}
    const x = ev.nativeEvent.screenX - dragOrigin.x;
    const y = ev.nativeEvent.screenY - dragOrigin.y;
    setOffset({x: Math.max(x, -48), y: Math.max(y, -63.5)})
  }

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
  }

  const handleClickOutside = () => {
    setCaution(true)
    setTimeout(() => setCaution(false), 100)
  }

  return (
    <FilterToolSC
      onMouseDown={handleClickOutside}
      onKeyDown={handleKeyDown}
      tabIndex={1}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <InnerModalSC onMouseDown={ev => ev.stopPropagation()} offset={offset}>
        <TitleSC
          caution={caution}
          onMouseDown={handleMouseDown}
        >{filter.name}</TitleSC>
        <ContentSC>
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
        </ContentSC>
      </InnerModalSC>
    </FilterToolSC>
  );
}
