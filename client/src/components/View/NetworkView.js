/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import View from '../Styled/View';
import Peers from '../Lists/Peers';
import { peerListType } from '../types';

export const NetworkView = ({ peerList }) => (
  <View>
    <Peers peerList={peerList} />
  </View>
);

NetworkView.propTypes = {
  peerList: peerListType.isRequired,
};

export default NetworkView;
