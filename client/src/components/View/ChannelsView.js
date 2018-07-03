/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withStyles } from 'material-ui/styles';
import Channels from '../Lists/Channels';
import Card from 'material-ui/Card';

const styles = theme => ({
  root: {
    flexGrow: 1,
    paddingTop: 42,
    position: 'relative',
  },
  card: {
    height: 250,
    minWidth: 1290,
    margin: 20,
    textAlign: 'left',
    display: 'inline-block',
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

export class ChannelsView extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.getChannels()
  }

  render() {
    return (
      <div className="view-fullwidth" >
        <div className="view-display">
          <Card className="table-card">
            <Channels channels={this.props.channels} getChannels={this.props.getChannels} />
          </Card>
        </div>
      </div>
    );
  }
}

export default compose(
  withStyles(styles)
)(ChannelsView);
