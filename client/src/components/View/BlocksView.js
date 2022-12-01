/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import View from '../Styled/View';
import Blocks from '../CustomBlocks/Blocks';

// import Blocks from '../Lists/Blocks'; 기존에 있었던 BLOCKS탭 컴포넌트
// import {
// 	blockListType,
// 	currentChannelType,
// 	getTransactionType,
// 	transactionType
// } from '../types';

export const BlocksView = () => (
	<View>
		<Blocks />
	</View>
);

// BlocksView.propTypes = {
// 	blockList: blockListType.isRequired,
// 	currentChannel: currentChannelType.isRequired,
// 	getTransaction: getTransactionType.isRequired,
// 	transaction: transactionType
// };

// BlocksView.defaultProps = {
// 	transaction: null
// };

export default BlocksView;

// 기존에 받아오던 props들
// blockList={blockList}
// 			currentChannel={currentChannel}
// 			transaction={transaction}
// 			getTransaction={getTransaction}
// 			transactionByOrg={transactionByOrg}
// 			blockListSearch={blockListSearch}
// 			getBlockListSearch={getBlockListSearch}
