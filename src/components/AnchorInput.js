import React from "react";
import styled from "styled-components";

const AnchorInputSC = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40%;
  margin: 10px 0;
  
  & p {
    margin-bottom: 5px;
  }
`;

const AnchorButtonBoxSC = styled.div`
  display: flex;
  width: 72px;
  flex-direction: column;
  border: 1px solid black;
`;

const AnchorButtonSC = styled.label`
  width: 24px;
  height: 24px;
  cursor: pointer;
  background: ${props => props.checked ? props.theme.colors.highlight : "white"};
  border: 1px solid black;

  & input {
    visibility: hidden;
    width: 0;
    height: 0;
  }
`;

const AnchorRowSC = styled.div`
  display: flex;
  flex-direction: row;
`;

export default function AnchorInput({ name, selected, onChange }) {
  return (
    <AnchorInputSC>
      <p>
        {name ? name : null}
      </p>
      <AnchorButtonBoxSC>
        <AnchorRowSC>
          <AnchorButton value="top-left" onChange={onChange} selected={selected} />
          <AnchorButton value="top-center" onChange={onChange} selected={selected} />
          <AnchorButton value="top-right" onChange={onChange} selected={selected} />
        </AnchorRowSC>
        <AnchorRowSC>
          <AnchorButton value="center-left" onChange={onChange} selected={selected} />
          <AnchorButton value="center-center" onChange={onChange} selected={selected} />
          <AnchorButton value="center-right" onChange={onChange} selected={selected} />
        </AnchorRowSC>
        <AnchorRowSC>
          <AnchorButton value="bottom-left" onChange={onChange} selected={selected} />
          <AnchorButton value="bottom-center" onChange={onChange} selected={selected} />
          <AnchorButton value="bottom-right" onChange={onChange} selected={selected} />
        </AnchorRowSC>
      </AnchorButtonBoxSC>
    </AnchorInputSC>
  );
}

function AnchorButton({ value, selected, onChange }) {
  return (
    <AnchorButtonSC checked={selected === value}>
      <input
        type="radio"
        name="anchor"
        value={value}
        checked={selected === value}
        onChange={() => onChange(value)}
      />
    </AnchorButtonSC>
  );
}
