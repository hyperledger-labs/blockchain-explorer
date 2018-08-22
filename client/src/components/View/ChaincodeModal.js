/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import beautify from 'js-beautify';
import FontAwesome from 'react-fontawesome';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { chaincodeType } from '../types';
import Modal from '../Styled/Modal';

const styles = theme => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    code: {
      display: 'block',
      marginLeft: '1%',
      marginRight: '1%',
      width: '98%',
      height: 600,
      backgroundColor: dark ? '#443e68' : undefined,
      color: dark ? '#ffffff' : undefined
    },
    cubeIcon: {
      color: '#ffffff',
      marginRight: 20
    },
    source: {
      '& ::-webkit-scrollbar': {
        width: '1em'
      },
      '& ::-webkit-scrollbar-track': {
        background: dark ? '#8375c4' : 'rgb(238, 237, 237)'
      },
      '& ::-webkit-scrollbar-thumb': {
        background: dark ? '#6a5e9e' : 'rgb(192, 190, 190)'
      },
      '& ::-webkit-scrollbar-corner': {
        background: dark ? '#443e68' : 'rgb(238, 237, 237)'
      }
    }
  };
};
export class ChaincodeModal extends Component {
  handleClose = () => {
    const { onClose } = this.props;
    onClose();
  };

  render() {
    const { chaincode, classes } = this.props;

    const formattedSrc = beautify(chaincode.source, {
      indent_size: 4
    });
    const srcHeader = `${chaincode.chaincodename} ${chaincode.version}`;

    return (
      <Modal>
        {modalClasses => (
          <div className={classes.source}>
            <div className={modalClasses.dialog}>
              <Card className={modalClasses.card}>
                <CardTitle className={modalClasses.title}>
                  <FontAwesome name="file-text" className={classes.cubeIcon} />
                  {srcHeader}
                  <button
                    type="button"
                    onClick={this.handleClose}
                    className={modalClasses.closeBtn}
                  >
                    <FontAwesome name="close" />
                  </button>
                </CardTitle>
                <CardBody className={modalClasses.body}>
                  <textarea
                    className={classes.code}
                    value={formattedSrc}
                    readOnly
                  />
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </Modal>
    );
  }
}

ChaincodeModal.propTypes = {
  chaincode: chaincodeType
};

ChaincodeModal.defaultProps = {
  chaincode: null
};

export default withStyles(styles)(ChaincodeModal);
