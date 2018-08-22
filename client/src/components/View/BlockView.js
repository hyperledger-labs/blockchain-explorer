/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import FontAwesome from 'react-fontawesome';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Table, Card, CardBody, CardTitle } from 'reactstrap';
import { blockHashType, onCloseType } from '../types';
import Modal from '../Styled/Modal';

const styles = theme => {
  return {
    cubeIcon: {
      color: '#ffffff',
      marginRight: 20
    }
  };
};

class BlockView extends Component {
  handleClose = () => {
    const { onClose } = this.props;
    onClose();
  };

  render() {
    const { blockHash, classes } = this.props;
    if (!blockHash) {
      return (
        <Modal>
          {modalClasses => (
            <Card className={modalClasses.card}>
              <CardTitle className={modalClasses.title}>
                <FontAwesome name="cube" />
                Block Details
              </CardTitle>
              <CardBody className={modalClasses.body}>
                <span>
                  {' '}
                  <FontAwesome name="circle-o-notch" size="3x" spin />
                </span>
              </CardBody>
            </Card>
          )}
        </Modal>
      );
    }
    return (
      <Modal>
        {modalClasses => (
          <div className={modalClasses.dialog}>
            <Card className={modalClasses.card}>
              <CardTitle className={modalClasses.title}>
                <FontAwesome name="cube" className={classes.cubeIcon} />
                Block Details
                <button
                  type="button"
                  onClick={this.handleClose}
                  className={modalClasses.closeBtn}
                >
                  <FontAwesome name="close" />
                </button>
              </CardTitle>
              <CardBody className={modalClasses.body}>
                <Table striped hover responsive className="table-striped">
                  <tbody>
                    <tr>
                      <th>Channel name:</th>
                      <td>{blockHash.channelname}</td>
                    </tr>
                    <tr>
                      <th>Block Number</th>
                      <td>{blockHash.blocknum}</td>
                    </tr>
                    <tr>
                      <th>Created at</th>
                      <td>{blockHash.createdt}</td>
                    </tr>

                    <tr>
                      <th>Number of Transactions</th>
                      <td>{blockHash.txcount}</td>
                    </tr>
                    <tr>
                      <th>Block Hash</th>
                      <td>
                        {blockHash.blockhash}
                        <button type="button" className={modalClasses.copyBtn}>
                          <div className={modalClasses.copy}>Copy</div>
                          <div className={modalClasses.copied}>Copied</div>
                          <CopyToClipboard text={blockHash.blockhash}>
                            <FontAwesome name="copy" />
                          </CopyToClipboard>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th>Data Hash</th>
                      <td>
                        {blockHash.datahash}
                        <button type="button" className={modalClasses.copyBtn}>
                          <div className={modalClasses.copy}>Copy</div>
                          <div className={modalClasses.copied}>Copied</div>
                          <CopyToClipboard text={blockHash.datahash}>
                            <FontAwesome name="copy" />
                          </CopyToClipboard>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th>Prehash</th>
                      <td>
                        {blockHash.prehash}
                        <button type="button" className={modalClasses.copyBtn}>
                          <div className={modalClasses.copy}>Copy</div>
                          <div className={modalClasses.copied}>Copied</div>
                          <CopyToClipboard text={blockHash.prehash}>
                            <FontAwesome name="copy" />
                          </CopyToClipboard>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </div>
        )}
      </Modal>
    );
  }
}

BlockView.propTypes = {
  blockHash: blockHashType.isRequired,
  onClose: onCloseType.isRequired
};

export default withStyles(styles)(BlockView);
