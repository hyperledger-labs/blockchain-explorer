import React from 'react';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import styled from 'styled-components';

const BlockBar = ({ block }) => {
	console.log(block);
	return (
		<Container>
			<p>{block.blockNo}</p>
			<KeyboardArrowDown />
			<KeyboardArrowUp />
		</Container>
	);
};

const Container = styled.div`
	display: flex;
`;

export default BlockBar;
