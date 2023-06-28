/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import View from '../Styled/View';
import Blocks from '../Lists/Blocks';
import {
  blockListSearchType,
  blockRangeSearchType,
  currentChannelType,
  getTransactionType,
  transactionType,
  txnListType,
	getTxnListType
} from '../types';

export const BlocksView = ({
  blockRangeSearch,
  currentChannel,
  getTransaction,
  transaction,
  blockListSearch,
  getBlockListSearch,
  transactionByOrg,
	getBlockRangeSearch,
	blockRangeLoaded,
	blockListSearchTotalPages,
	blockListSearchPageParam,
	blockListSearchQuery,
	getTxnList,
	txnList
}) => (
  <View>
    <Blocks
      currentChannel={currentChannel}
      transaction={transaction}
      getTransaction={getTransaction}
			getTxnList={getTxnList}
			txnList={txnList}
      transactionByOrg={transactionByOrg}
      blockListSearch={blockListSearch}
      getBlockListSearch={getBlockListSearch}
      blockRangeSearch={blockRangeSearch}
			blockRangeLoaded={blockRangeLoaded}
      blockListSearchTotalPages={blockListSearchTotalPages}
			blockListSearchPageParam={blockListSearchPageParam}
			blockListSearchQuery={blockListSearchQuery}
			getBlockRangeSearch={getBlockRangeSearch}
    />
  </View>
);

BlocksView.propTypes = {
  blockRangeSearch: blockRangeSearchType.isRequired,
  blockListSearch: blockListSearchType.isRequired,
  currentChannel: currentChannelType.isRequired,
  getTransaction: getTransactionType.isRequired,
  transaction: transactionType,
	txnList: txnListType,
	getTxnList: getTxnListType
};

BlocksView.defaultProps = {
  transaction: null,
};

export default BlocksView;
