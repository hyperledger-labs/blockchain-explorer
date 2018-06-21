/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import beautify from 'js-beautify';
import FontAwesome from "react-fontawesome";
import {
  Card,
  CardBody,
  CardTitle
} from "reactstrap";
const styles = theme => ({
  container: {
    border: '3px solid #afeeee'
  },
  container1: {
    display: 'flex',
    flexWrap: 'wrap'
  }
});

export class ChaincodeModal extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const formattedSrc = beautify(this.props.chaincode.source, { indent_size: 4 });
    const srcHeader = this.props.chaincode.chaincodename + " " + this.props.chaincode.version;
    const { classes } = this.props;

    return (
      <div className="dialog">
        <Card>
          <CardTitle className="dialogTitle">
            <FontAwesome name="file-text" className="cubeIcon" />{srcHeader}
          </CardTitle>
          <CardBody>
            <textarea className="source-code" readOnly>
              {formattedSrc}
            </textarea>
          </CardBody>
        </Card>
      </div>
    );
  }
}

ChaincodeModal.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ChaincodeModal);
