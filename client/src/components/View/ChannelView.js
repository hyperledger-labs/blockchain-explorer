/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import View from '../Styled/View';
import Channels from '../Lists/Channels';
import { channelPeerDataType, channelsType } from '../types';

export const ChannelView = ({
	currentChannel,
	getChannelPeerData,
	channels,
	channelPeerData
}) => (
	<View>
		<Channels
			currentChannel={currentChannel}
			channels={channels}
			channelPeerData={channelPeerData}
			getChannelPeerData={getChannelPeerData}
		/>
	</View>
);

ChannelView.propTypes = {
	channels: channelsType.isRequired,
	channelPeerData: channelPeerDataType.isRequired
};

export default ChannelView;
