import React, { useState } from 'react';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import styled from 'styled-components';
import { Divider } from '@material-ui/core';

const expandObj = {
	status: 200,
	row: {
		txhash: 'af1b10424186debd35a46ba40e2423377f97d9c439c292d65de59a9a4f825f8e',
		validation_code: 'VALID',
		payload_proposal_hash:
			'ba9067fe9f7ff7b8398a4e255ecc9286192222bfd97d9f4dd5409b74046c4e57',
		creator_msp_id: 'YardMSP',
		endorser_msp_id: '{"GovMSP"}',
		chaincodename: 'panki-cc',
		type: 'ENDORSER_TRANSACTION',
		createdt: '2022-11-29T05:10:07.704Z',
		read_set: [
			{
				chaincode: '_lifecycle',
				set: [
					{
						key: 'namespaces/fields/panki-cc/Sequence',
						version: {
							block_num: {
								low: 7,
								high: 0,
								unsigned: true
							},
							tx_num: {
								low: 0,
								high: 0,
								unsigned: true
							}
						}
					}
				]
			},
			{
				chaincode: 'panki-cc',
				set: []
			}
		],
		write_set: [
			{
				chaincode: '_lifecycle',
				set: []
			},
			{
				chaincode: 'panki-cc',
				set: [
					{
						key: 'ct/100/1552218',
						is_delete: false,
						value: '{"coating":"3333","ctgMeasureId":100}'
					}
				]
			}
		],
		channelname: 'mychannel'
	}
};

const BlockBar = ({ block }) => {
	const [isOpen, setIsOpen] = useState(false);
	const { blocknum, txcount, datahash } = block;

	const handleToggle = () => {
		setIsOpen(prev => !prev);
	};

	let expandData = JSON.stringify(expandObj);
	expandData = JSON.parse(expandData);

	const data = JSON.parse(expandData.row.write_set[1].set[0].value);
	let dataArr = [];

	for (const property in data) {
		dataArr.push({ [property]: data[property] });
	}

	return (
		<>
			<Bar onClick={handleToggle} isOpen={isOpen}>
				<Helmet isOpen={isOpen} />
				<Label gap={16}>
					<div variant="h1">Block No {blocknum}</div>
					<Divider orientation="vertical" flexItem />
					<div>Tx : {txcount}</div>
				</Label>
				{isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
			</Bar>

			<DropDownContainer isOpen={isOpen}>
				<HashContainer>
					<Label gap={56}>
						<div>Data Hash</div>
						<Value>{datahash}</Value>
					</Label>
					<Label gap={56}>
						<div>Prev Hash</div>
						<Value>{datahash}</Value>
					</Label>
				</HashContainer>

				<TransactionTitle>Transactions</TransactionTitle>

				{dataArr.map(data => (
					<TransactionCard>
						<Label gap={79}>
							<div>type</div>
							<Value>{Object.keys(data)}</Value>
						</Label>

						<Label gap={71}>
							<div>Value</div>
							<TransactionValueContainer>
								<Value>{Object.values(data)}</Value>
							</TransactionValueContainer>
						</Label>
					</TransactionCard>
				))}
			</DropDownContainer>
		</>
	);
};

const Bar = styled.div`
	padding: 14px 26px 14px 36px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border: 1px solid rgba(0, 0, 0, 0.12);
	border-radius: 8px;
	margin-bottom: ${({ isOpen }) => (isOpen ? '0px' : '12px')};
	position: relative;
	border-bottom-right-radius: ${({ isOpen }) => (isOpen ? '0px' : '8px')};
	border-bottom-left-radius: ${({ isOpen }) => (isOpen ? '0px' : '8px')};
	cursor: pointer;
`;

const Label = styled.div`
	display: flex;
	gap: ${({ gap }) => `${gap}px`};
	font-size: 14px;
	font-weight: 500;
`;

const Value = styled.div`
	color: rgba(0, 0, 0, 0.6);
`;

const Helmet = styled.div`
	width: 8px;
	height: 100%;
	border-top-left-radius: 8px;
	border-bottom-left-radius: ${({ isOpen }) => (isOpen ? '0px' : '8px')};
	background-color: rgba(24, 32, 97, 1);
	position: absolute;
	left: 0;
`;

const DropDownContainer = styled.div`
	display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
	background-color: rgba(250, 250, 250, 1);
	margin-bottom: ${({ isOpen }) => (isOpen ? '12px' : '0px')};
	padding-bottom: 26px;
`;

const HashContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 24px 29px;
`;

const TransactionTitle = styled.div`
	width: 100%;
	padding: 9px 29px;
	margin-top: 24px;
	font-size: 16px;
	font-weight: 500;
	line-height: 24px;
	color: rgba(0, 0, 0, 0.6);
	background-color: #eeeeee;
`;

const TransactionValueContainer = styled.div`
	width: 100%;
	border-radius: 6px;
	background-color: #eeeeee;
`;

const TransactionCard = styled.div`
	background-color: rgba(245, 245, 245, 1);
	border: 1px solid rgba(0, 0, 0, 0.12);
	border-radius: 8px;
	margin: 26px 29px;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export default BlockBar;
