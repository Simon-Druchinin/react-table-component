import React from 'react';
import styled from 'styled-components';

const Icon = styled.span`
	padding: 2px;
	color: inherit;
	flex-grow: 0;
	flex-shrink: 0;
  position: absolute;
  right: 0.7rem;
  cursor: pointer;
`;

const NativeMenuIcon: React.FC = () => (
	<Icon>
		&#9776;
	</Icon>
);

export default NativeMenuIcon;
