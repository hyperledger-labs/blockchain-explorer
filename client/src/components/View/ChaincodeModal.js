/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import beautify from 'js-beautify';
import FontAwesome from 'react-fontawesome';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { chaincodeType } from '../types';

const styles = () => ({
  container: {
    border: '3px solid #afeeee'
  },
  container1: {
    display: 'flex',
    flexWrap: 'wrap'
  }
});

export const ChaincodeModal = ({ chaincode }) => {
  const formattedSrc = beautify(chaincode.source, {
    indent_size: 4
  });
  const srcHeader = `${chaincode.chaincodename} ${chaincode.version}`;

  return (
    <div className="sourceCodeDialog">
      <div className="dialog">
        <Card>
          <CardTitle className="dialogTitle">
            <FontAwesome name="file-text" className="cubeIcon" />
            {srcHeader}
          </CardTitle>
          <CardBody>
            <textarea className="source-code" value={formattedSrc} readOnly />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

ChaincodeModal.propTypes = {
  chaincode: chaincodeType
};

ChaincodeModal.defaultProps = {
  chaincode: null
};

export default withStyles(styles)(ChaincodeModal);
