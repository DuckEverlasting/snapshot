import React from "react";
import styled from "styled-components";

const RadioInputSC = styled.div`
  display: flex;
  flex-direction: column;
`
const RadioButtonsSC = styled.div`
  display: flex;

  & label {
    padding: 10px;
  }
`

export default function RadioInput({name, selected, options, onChange}) {
  return (
    <RadioInputSC>
      {name ? name : null}
      <RadioButtonsSC>
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


