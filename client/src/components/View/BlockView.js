/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Table, Card, CardBody, CardTitle } from 'reactstrap';
import { blockHashType, onCloseType } from '../types';

class BlockView extends Component {
  handleClose = () => {
    const { onClose } = this.props;
    onClose();
  };
  render() {
    const { blockHash } = this.props;
    if (!blockHash) {
      return (
        <Card>
          <CardTitle className="dialogTitle">
            <FontAwesome name="cube" />
            Block Details
          </CardTitle>
          <CardBody>
            <span className="loading-wheel">
              {' '}
              <FontAwesome name="circle-o-notch" size="3x" spin />
            </span>
          </CardBody>
        </Card>
      );
    }
    return (
      <div className="dialog">
        <Card>
          <CardTitle className="dialogTitle">
            <FontAwesome name="cube" className="cubeIcon" />
            Block Details
            <button
              type="button"
              onClick={this.handleClose}
              className="closeBtn"
            >
              <FontAwesome name="close" />
            </button>
          </CardTitle>
          <CardBody>
            <Table striped hover responsive className="table-striped">
              <tbody>
                <tr>
                  <th>Channel name:</th>
                  <td>{blockHash.channelname}</td>
                </tr>
                <tr>
                  <th>ID</th>
                  <td>{blockHash.id}</td>
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
                    <button type="button" className="copyBtn">
                      <div className="copyMessage">Copy</div>
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
                    <button type="button" className="copyBtn">
                      <div className="copyMessage">Copy</div>
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
                    <button type="button" className="copyBtn">
                      <div className="copyMessage">Copy</div>
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
    );
  }
}

BlockView.propTypes = {
  blockHash: blockHashType.isRequired,
  onClose: onCloseType.isRequired
};

export default BlockView;
