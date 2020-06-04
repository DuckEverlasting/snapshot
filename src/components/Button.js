import styled from "styled-components";

const Button = styled.button`
  width: 52px;
  height: 23px;
  margin: 3px;
  outline: none;
  cursor: pointer;
  padding: 2px 0;
  background: ${props => props.active ? "#ffe312" : "#e3e3e3"};
  border: 1px solid #333333;
  border-radius: 2px;
  
  & img {
    margin-top: 1%;
    height: 90%;
    width: 90%;
  }

  &:hover{
    background: ${props => props.active ? "#ffe312" : "#d6d6d6"};
  }

  &:active{
    box-shadow: inset 0 .5px 3px #222222;
  }
`;

export default Button;