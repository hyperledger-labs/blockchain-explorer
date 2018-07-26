/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Channels from '../Lists/Channels';
import { channelsType } from '../types';

const styles = theme => ({
  root: {
    flexGrow: 1,
    paddingTop: 42,
    position: 'relative'
  },
  card: {
    height: 250,
    minWidth: 1290,
    margin: 20,
    textAlign: 'left',
    display: 'inline-block'
  },
  title: {
    fontSize: 16,
    color: theme.palette.text.secondary,
    position: 'absolute',
    left: 40,
    top: 60
  },
  content: {
    fontSize: 12,
    color: theme.palette.text.secondary,
    position: 'absolute',
    left: 40,
    top: 70
  }
});

export const ChannelsView = ({ channels }) => (
  <div className="view-fullwidth">
    <div className="view-display">
      <Card className="table-card">
        <Channels channels={channels} />
      </Card>
    </div>
  </div>
);

ChannelsView.propTypes = {
  channels: channelsType.isRequired
};

export default compose(withStyles(styles))(ChannelsView);
