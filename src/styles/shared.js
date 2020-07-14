import styled from "styled-components";

export const PanelTitleSC = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px 0 10px;
  font-size: ${props => props.theme.fontSizes.large};
  margin: 0;
`

export const TextInputSC = styled.input`
  margin: 1px 0 0;
  border-radius: 3px;
  border: 1px solid #222222;
  padding: 3px;
`;

export const checkerBackground = `
  background-color: #eee;
  background-image: linear-gradient(45deg, grey 25%, transparent 25%, transparent 75%, grey 75%, grey),
    linear-gradient(45deg, grey 25%, transparent 25%, transparent 75%, grey 75%, grey);
  background-size: 60px 60px;
  background-position: 0 0, 30px 30px;
`