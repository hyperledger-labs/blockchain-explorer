/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import Chaincodes from '../Lists/Chaincodes';

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

export class ChaincodeView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className="view-fullwidth">
        <div className="view-display">
          <Chaincodes
            chaincodes={this.props.chaincodes}
          />
        </div>
      </div>
    );
  }
}

ChaincodeView.propTypes = {
  classes: PropTypes.object.isRequired
};

export default compose(
  withStyles(styles)
)(ChaincodeView);
