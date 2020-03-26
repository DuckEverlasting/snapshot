import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import { setFilterTool } from "../actions/redux";
import filterAction from "../actions/redux/filterAction";

import SliderInput from "./SliderInput";

const FilterToolSC = styled.div`
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  z-index: 99;
`

const InnerModalSC = styled.div`
  border-radius: 10px;
  background: rgba(0, 0, 0, .95);
  color: white;
  padding: 40px;
  max-width: 800px;
`

const SpacerSC = styled.div`
  height: 20px;
`

export default function FilterTool() { 
  const [showPreview, setShowPreview] = useState(false)
  const [input, setInput] = useState({})
  const dispatch = useDispatch();
  const filter = useSelector(state => state.ui.currentFilter)

  useEffect(() => {
    setInput(filter.initImput)
  }, [])

  const handleKeyDown = ev => {
    if (ev.key === "Escape") {
      dispatch(setFilterTool("off"));
    }
    ev.stopPropagation();
  }

  const handleApply = () => {
    console.log(input)
    dispatch(filterAction(filter.apply, input))
    dispatch(setFilterTool("off"));
  }

  return (
    <FilterToolSC
      onClick={ev => ev.stopPropagation()}
      onKeyDown={handleKeyDown}
    >
      <InnerModalSC>
        <h3>{filter.name}</h3>
        <SpacerSC/>
        {
          Object.keys(filter.initImput).map(el => {
            return <SliderInput
              name={el}
              value={input[el]}
              onChange={value => setInput({...input, [el]: value})}
              max={100}
              min={-100}
              step={1}
            />
          })
        }
        <label>
          Preview
          <input type="checkbox" value={showPreview} onChange={() => setShowPreview(!showPreview)}/>
        </label>
        <button onClick={() => dispatch(setFilterTool("off"))}>CANCEL</button>
        <button onClick={handleApply}>APPLY</button>
      </InnerModalSC>
    </FilterToolSC>
  );
}
