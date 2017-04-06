import styled from 'styled-components';
import React from 'react';

const AppHeader = styled.div`
  background-color: ${props => props.backgroundColor};
  color: ${props => props.textColor};
  text-align: center;
  padding: 10px 0;
`;

AppHeader.propTypes = {
  backgroundColor: React.PropTypes.string,
  textColor: React.PropTypes.string
};

export default AppHeader;
