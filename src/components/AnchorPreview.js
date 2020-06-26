import React from 'react';
import styled from 'styled-components';

const PreviewWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const PreviewBG = styled.image`
  transform: translate(${props => props.offsetX}%, ${props => props.offsetY}%);
`;

function AnchorPreview({value}) {
  return (
    <PreviewWrapper>
      <PreviewBG />
    </PreviewWrapper>
  )
}

export default AnchorPreview;
