import React from "react";
import styled from "styled-components";

const CheckboxSC = styled.div`
  display: flex;

  & label {
    padding: 2px 10px;
  }
`

export default function RadioInput({name, selected, onChange}) {
  return (
    <CheckboxSC>
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


