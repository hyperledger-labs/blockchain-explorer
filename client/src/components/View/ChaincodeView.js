/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import View from '../Styled/View';
import Chaincodes from '../Lists/Chaincodes';
import { chaincodeListType, chaincodeMetaDataType } from '../types';

export const ChaincodeView = ({ chaincodeList,chaincodeMetaData, getChaincodeMetaData  }) => (
  <View>
    <Chaincodes chaincodeList={chaincodeList} chaincodeMetaData={chaincodeMetaData} getChaincodeMetaData={getChaincodeMetaData} />
  </View>
);

ChaincodeView.propTypes = {
  chaincodeList: chaincodeListType.isRequired,
  chaincodeMetaData: chaincodeMetaDataType.isRequired
};

export default ChaincodeView;
