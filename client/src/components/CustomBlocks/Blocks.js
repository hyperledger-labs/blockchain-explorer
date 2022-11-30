import React from 'react';
import Typography from '@material-ui/core/Typography';
import { FullscreenExit } from '@material-ui/icons';
import BlockBar from './BlockBar';
import { Divider } from '@material-ui/core';
import styled from 'styled-components';

const arr = [
	{
		blockNo: 137,
		Data_Hash: 'asdlkfjaslkdfjalsdk',
		Prev_Hash: 'sldfkgjalskdglsahdg',
		txs: [
			{
				type: 'ctg',
				value: 'aslkdjflaskdjflasdjf'
			},
			{
				type: 'Coating Thickness Gauge',
				value: 'ab77weufud9weuodisjowiejf876eui0suwoe9dsdjke'
			},
			{
				type: 'DID',
				value: 'ab77weufud9weuodisjowiejf876eui0suwoe9dsdjke'
			}
		]
	},
	{
		blockNo: 137,
		Data_Hash: 'asdlkfjaslkdfjalsdk',
		Prev_Hash: 'sldfkgjalskdglsahdg',
		txs: [
			{
				type: 'ctg',
				value: 'aslkdjflaskdjflasdjf'
			},
			{
				type: 'Coating Thickness Gauge',
				value: 'ab77weufud9weuodisjowiejf876eui0suwoe9dsdjke'
			},
			{
				type: 'DID',
				value: 'ab77weufud9weuodisjowiejf876eui0suwoe9dsdjke'
			}
		]
	},
	{
		blockNo: 137,
		Data_Hash: 'asdlkfjaslkdfjalsdk',
		Prev_Hash: 'sldfkgjalskdglsahdg',
		txs: [
			{
				type: 'ctg',
				value: 'aslkdjflaskdjflasdjf'
			},
			{
				type: 'Coating Thickness Gauge',
				value: 'ab77weufud9weuodisjowiejf876eui0suwoe9dsdjke'
			},
			{
				type: 'DID',
				value: 'ab77weufud9weuodisjowiejf876eui0suwoe9dsdjke'
			}
		]
	},
	{
		blockNo: 137,
		Data_Hash: 'asdlkfjaslkdfjalsdk',
		Prev_Hash: 'sldfkgjalskdglsahdg',
		txs: [
			{
				type: 'ctg',
				value: 'aslkdjflaskdjflasdjf'
			},
			{
				type: 'Coating Thickness Gauge',
				value: 'ab77weufud9weuodisjowiejf876eui0suwoe9dsdjke'
			},
			{
				type: 'DID',
				value: 'ab77weufud9weuodisjowiejf876eui0suwoe9dsdjke'
			}
		]
	}
];

const Blocks = () => {
	return (
		<>
			<Title>
				<Typography variant="h6">BLOCKS</Typography>
				<FullscreenExit />
			</Title>
			<Divider />
			<Content>
				{arr.map(block => (
					<BlockBar block={block} />
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
