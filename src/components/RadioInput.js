import React from "react";
import styled from "styled-components";

const RadioInputSC = styled.div`
  display: flex;
  flex-direction: column;
`
const RadioButtonsSC = styled.div`
  display: flex;
  flex-direction: ${props => props.vertical ? "column" : "row"};

  & label {
    padding: 2px 10px;
  }
`

export default function RadioInput({name, selected, options, onChange, vertical}) {
  return (
    <RadioInputSC>
      {name ? name : null}
      <RadioButtonsSC vertical={vertical}>
        {
          options && options.map(option => <label>
            {option}
            <input
              type="radio"
              name="type"
              value={option}
              checked={selected === option}
              onChange={() => onChange(option)}
            />
          </label>)
        }
      </RadioButtonsSC>
    </RadioInputSC>
  );
}


