/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import Peers from '../Lists/Peers';

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

export class NetworkView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className="view-fullwidth">
        <div className="view-display">
          <Peers peerList={this.props.peerList} />
        </div>
      </div>
    );
  }
}

NetworkView.propTypes = {
  classes: PropTypes.object.isRequired,
  peerList: PropTypes.array.isRequired
};

export default compose(
  withStyles(styles)
)(NetworkView);
