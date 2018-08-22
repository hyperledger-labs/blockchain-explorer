/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import View from '../Styled/View';
import Channels from '../Lists/Channels';
import { channelsType } from '../types';

export const ChannelsView = ({ channels }) => (
  <View>
    <Channels channels={channels} />
  </View>
);

ChannelsView.propTypes = {
  channels: channelsType.isRequired
};

export default ChannelsView;
