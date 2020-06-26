import React from "react";
import styled from "styled-components";

const AnchorInputSC = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
`;
const AnchorButtonBoxSC = styled.div`
  display: flex;
  flex-direction: column;
`;

const AnchorRowSC = styled.div`
  display: flex;
  flex-direction: row;
`;

export default function AnchorInput({ name, selected, onChange }) {
  return (
    <AnchorInputSC>
      {name ? name : null}
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
    <label>
      <input
        type="radio"
        name="anchor"
        value={value}
        checked={selected === value}
        onChange={() => onChange(value)}
      />
    </label>
  );
}
