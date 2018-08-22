/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import FontAwesome from 'react-fontawesome';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Table, Card, CardBody, CardTitle } from 'reactstrap';
import { transactionType } from '../types';
import JSONTree from 'react-json-tree';
import Modal from '../Styled/Modal';

const readTheme = {
  base00: '#f3f3f3',
  base01: '#2e2f30',
  base02: '#515253',
  base03: '#737475',
  base04: '#959697',
  base05: '#b7b8b9',
  base06: '#dadbdc',
  base07: '#fcfdfe',
  base08: '#e31a1c',
  base09: '#e6550d',
  base0A: '#dca060',
  base0B: '#31a354',
  base0C: '#80b1d3',
  base0D: '#3182bd',
  base0E: '#756bb1',
  base0F: '#b15928'
};
const writeTheme = {
  base00: '#ffffff',
  base01: '#2e2f30',
  base02: '#515253',
  base03: '#737475',
  base04: '#959697',
  base05: '#b7b8b9',
  base06: '#dadbdc',
  base07: '#fcfdfe',
  base08: '#e31a1c',
  base09: '#e6550d',
  base0A: '#dca060',
  base0B: '#31a354',
  base0C: '#80b1d3',
  base0D: '#3182bd',
  base0E: '#756bb1',
  base0F: '#b15928'
};

const styles = theme => {
  return {
    listIcon: {
      color: '#ffffff',
      marginRight: 20
    },
    JSONtree: {
      '& ul': {
        backgroundColor: 'transparent !important',
        color: '#fff'
      }
    }
  };
};

const reads = {
  color: '#2AA233'
};
const writes = {
  color: '#DD8016'
};

export class TransactionView extends Component {
  handleClose = () => {
    const { onClose } = this.props;
    onClose();
  };

  render() {
    const { transaction, classes } = this.props;
    if (transaction && !transaction.read_set) {
      return (
        <Modal>
          {modalClasses => (
            <div>
              <CardTitle className={modalClasses.title}>
                <FontAwesome name="list-alt" className={classes.listIcon} />
                Transaction Details
                <button
                  type="button"
                  onClick={this.handleClose}
                  className={modalClasses.closeBtn}
                >
                  <FontAwesome name="close" />
                </button>
              </CardTitle>
              <div align="center">
                <CardBody className={modalClasses.body}>
                  <span>
                    {' '}
                    <FontAwesome name="circle-o-notch" size="3x" spin />
                  </span>
                </CardBody>
              </div>
            </div>
          )}
        </Modal>
      );
    }
    if (transaction) {
      return (
        <Modal>
          {modalClasses => (
            <div className={modalClasses.dialog}>
              <Card className={modalClasses.card}>
                <CardTitle className={modalClasses.title}>
                  <FontAwesome name="list-alt" className={classes.listIcon} />
                  Transaction Details
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
                        <th>Transaction ID:</th>
                        <td>
                          {transaction.txhash}
                          <button
                            type="button"
                            className={modalClasses.copyBtn}
                          >
                            <div className={modalClasses.copy}>Copy</div>
                            <div className={modalClasses.copied}>Copied</div>
                            <CopyToClipboard text={transaction.txhash}>
                              <FontAwesome name="copy" />
                            </CopyToClipboard>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <th>Validation Code:</th>
                        <td>{transaction.validation_code}</td>
                      </tr>
                      <tr>
                        <th>Payload Proposal Hash:</th>
                        <td>{transaction.payload_proposal_hash}</td>
                      </tr>
                      <tr>
                        <th>Creator MSP:</th>
                        <td>{transaction.creator_msp_id}</td>
                      </tr>
                      <tr>
                        <th>Endoser:</th>
                        <td>{transaction.endorser_msp_id}</td>
                      </tr>
                      <tr>
                        <th>Chaincode Name:</th>
                        <td>{transaction.chaincodename}</td>
                      </tr>
                      <tr>
                        <th>Type:</th>
                        <td>{transaction.type}</td>
                      </tr>
                      <tr>
                        <th>Time:</th>
                        <td>{transaction.createdt}</td>
                      </tr>
                      <tr>
                        <th style={reads}>Reads:</th>
                        <td className={classes.JSONtree}>
                          <JSONTree
                            data={transaction.read_set}
                            theme={readTheme}
                            invertTheme={false}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th style={writes}>Writes:</th>
                        <td className={classes.JSONtree}>
                          <JSONTree
                            data={transaction.write_set}
                            theme={writeTheme}
                            invertTheme={false}
                          />
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
    return (
      <Modal>
        {modalClasses => (
          <div>
            <CardTitle className={modalClasses.title}>
              <FontAwesome name="list-alt" className={classes.listIcon} />
              Transaction Details
              <button
                type="button"
                onClick={this.handleClose}
                className={modalClasses.closeBtn}
              >
                <FontAwesome name="close" />
              </button>
            </CardTitle>
            <div align="center">
              <CardBody className={modalClasses.body}>
                <span>
                  {' '}
                  <FontAwesome name="circle-o-notch" size="3x" spin />
                </span>
              </CardBody>
            </div>
          </div>
        )}
      </Modal>
    );
  }
}

TransactionView.propTypes = {
  transaction: transactionType
};

TransactionView.defaultProps = {
  transaction: null
};

export default withStyles(styles)(TransactionView);
