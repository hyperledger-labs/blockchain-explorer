/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import View from '../Styled/View';
import Chaincodes from '../Lists/Chaincodes';
import { chaincodeListType, chaincodeMetaDataType } from '../types';

export const ChaincodeView = ({ chaincodeList,chaincodeMetaData, getChaincodeMetaData, currentChannel  }) => (
  <View>
    <Chaincodes chaincodeList={chaincodeList} chaincodeMetaData={chaincodeMetaData} getChaincodeMetaData={getChaincodeMetaData} currentChannel={currentChannel}/>
  </View>
);

ChaincodeView.propTypes = {
  chaincodeList: chaincodeListType.isRequired,
  chaincodeMetaData: chaincodeMetaDataType.isRequired
};

export default ChaincodeView;
