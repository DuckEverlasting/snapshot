import React from "react";
import styled from "styled-components";

const CheckboxSC = styled.div`
  display: flex;

  & label {
    padding: 2px 10px;
    white-space: ${props => props.noWrap ? "nowrap" : "normal"};
  }
`

export default function RadioInput({name, selected, onChange, noWrap=false}) {
  return (
    <CheckboxSC noWrap>
        <label>
          {name}
          <input
            type="checkbox"
            value={name}
            checked={selected}
            onChange={() => onChange(!selected)}
          />
        </label>
    </CheckboxSC>
  );
}


