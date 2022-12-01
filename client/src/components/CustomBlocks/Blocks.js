import React from 'react';
import Typography from '@material-ui/core/Typography';
import { FullscreenExit } from '@material-ui/icons';
import BlockBar from './BlockBar';
import { Divider } from '@material-ui/core';
import styled from 'styled-components';

const blockObj = {
	status: 200,
	rows: [
		{
			channelname: 'mychannel',
			blocknum: 26,
			txcount: 1,
			datahash: 'd2f1af195a4d3efed439a35b025f6b81451fc37380269f651548f392869bbae1',
			blockhash:
				'23bbed9359c1edc95b8a5088c9e2a5ff8cab3e625826e4bad94a5703cf178df9',
			prevhash: 'c4bd1f2cad9dca76c2e8631c9ea471f2838d672457c4cbf046a059972ccee44a',
			createdt: '2022-11-29T05:12:45.249Z',
			blksize: 4,
			txhash: []
		},
		{
			channelname: 'mychannel',
			blocknum: 25,
			txcount: 1,
			datahash: 'e103e164e0b97a9d99fa32d61913eaaa492914565bf98ce0dbe8006c8e32a973',
			blockhash:
				'c4bd1f2cad9dca76c2e8631c9ea471f2838d672457c4cbf046a059972ccee44a',
			prevhash: 'f7e9a59099f98f313f9e2d74d5e7d87f075bd43f72fe1491563b10b3ce27698f',
			createdt: '2022-11-29T05:10:07.704Z',
			blksize: 4,
			txhash: ['af1b10424186debd35a46ba40e2423377f97d9c439c292d65de59a9a4f825f8e']
		}
	]
};

const Blocks = () => {
	let json = JSON.stringify(blockObj);
	json = JSON.parse(json);

	const { rows } = json;

	return (
		<>
			<Title>
				<Typography variant="h6">BLOCKS</Typography>
				<FullscreenExit />
			</Title>
			<Divider />

			<Content>
				{rows.map(block => (
					<BlockBar key={block.blocknum} block={block} />
				))}
			</Content>
		</>
	);
};

const Title = styled.div`
	padding: 24px;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const Content = styled.div`
	padding: 20px 25px 26px 24px;
`;

export default Blocks;
