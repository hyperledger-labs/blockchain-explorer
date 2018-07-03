/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { withStyles } from "material-ui/styles";
import PropTypes from "prop-types";
import FontAwesome from "react-fontawesome";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Typography from "material-ui/Typography";

import moment from "moment-timezone";
import {
  Table,
  Card,
  CardBody,
  CardTitle } from "reactstrap";

const styles = theme => ({
  root: {
    flexGrow: 1,
    paddingTop: 42,
    position: "relative"
  }
});
const reads = {
  color: "#2AA233"
};
const writes = {
  color: "#DD8016"
};

export class TransactionView extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ loading: false });
  }
  componentWillMount() {
    const theme = sessionStorage.getItem("toggleTheme") === "true";
    this.setState({ toggleClass: theme });
  }

  handleClose = () => {
    this.props.onClose();
  };

  render() {
    if (this.props.transaction && !this.props.transaction.read_set) {
      return (
        <div className={this.state.toggleClass ? "dark-theme" : ""}>
          <div>
            <CardTitle className="dialogTitle">
              <FontAwesome name="list-alt" className="listIcon" />Transaction
              Details
              <button onClick={this.handleClose} className="closeBtn">
                <FontAwesome name="close" />
              </button>
            </CardTitle>
            <div align="center">
              <CardBody className="card-body">
                <span className="loading-wheel">
                  {" "}
                  <FontAwesome name="circle-o-notch" size="3x" spin />
                </span>
              </CardBody>
            </div>
          </div>
        </div>
      );
    } else if (this.props.transaction) {
      return (
        <div className={this.state.toggleClass ? "dark-theme" : ""}>
          <div className="dialog">
            <Card>
              <CardTitle className="dialogTitle">
                <FontAwesome name="list-alt" className="listIcon" />Transaction
                Details
                <button onClick={this.handleClose} className="closeBtn">
                  <FontAwesome name="close" />
                </button>
              </CardTitle>
              <CardBody>
                <Table striped hover responsive className="table-striped">
                  <tbody>
                    <tr>
                      <th>Transaction ID:</th>
                      <td>
                        {this.props.transaction.txhash}
                        <button className="copyBtn">
                          <CopyToClipboard text={this.props.transaction.txhash}>
                            <FontAwesome name="copy" />
                          </CopyToClipboard>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <th>Validation Code:</th>
                      <td>{this.props.transaction.validation_code}</td>
                    </tr>
                    <tr>
                      <th>Payload Proposal Hash:</th>
                      <td>{this.props.transaction.payload_proposal_hash}</td>
                    </tr>
                    <tr>
                      <th>Creator MSP:</th>
                      <td>{this.props.transaction.creator_msp_id}</td>
                    </tr>
                    <tr>
                      <th>Endoser:</th>
                      <td>{this.props.transaction.endorser_msp_id}</td>
                    </tr>
                    <tr>
                      <th>Chaincode Name:</th>
                      <td>{this.props.transaction.chaincodename}</td>
                    </tr>
                    <tr>
                      <th>Type:</th>
                      <td>{this.props.transaction.type}</td>
                    </tr>
                    <tr>
                      <th>Time:</th>
                      <td>
                        {moment(this.props.transaction.createdt)
                          .tz(moment.tz.guess())
                          .format("M-D-YYYY h:mm A zz")}
                      </td>
                    </tr>
                    <tr>
                      <th style={reads}>Reads:</th>
                      <td>
                        {" "}
                        {this.props.transaction.read_set.map(function(
                          item,
                          index
                        ) {
                          return item === null ? (
                            ""
                          ) : (
                            <li key={index}>
                              <Typography
                                variant="subheading"
                                className="dialogCells"
                              >
                                {" "}
                                {item.chaincode}
                              </Typography>
                              <ul>
                                {item.set.map(function(x, index) {
                                  var block_num = "";
                                  var tx_num = "";
                                  if (x.version !== null) {
                                    block_num = x.version.block_num;
                                    tx_num = x.version.tx_num;
                                  }
                                  return x === null ? (
                                    ""
                                  ) : (
                                    <li key={index}>
                                      key:{x.key} ,version:( block:{block_num},tx:{
                                        tx_num
                                      }){" "}
                                    </li>
                                  );
                                })}
                              </ul>
                              <br />
                            </li>
                          );
                        })}
                      </td>
                    </tr>
                    <tr>
                      <th style={writes}>Writes:</th>
                      <td>
                        {" "}
                        {this.props.transaction.write_set.map(function(
                          item,
                          index
                        ) {
                          return item === null ? (
                            ""
                          ) : (
                            <li key={index}>
                              <Typography
                                variant="subheading"
                                className="dialogCells"
                              >
                                {" "}
                                {item.chaincode}
                              </Typography>
                              <ul>
                                {item.set.map(function(x, index) {
                                  return x === null ? (
                                    ""
                                  ) : (
                                    <li key={index}>
                                      key:{x.key} ,is_delete:{x.is_delete.toString()},value:{
                                        x.value
                                      }{" "}
                                    </li>
                                  );
                                })}
                              </ul>
                              <br />
                            </li>
                          );
                        })}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </div>
        </div>
      );
    }
    return (
      <div className={this.state.toggleClass ? "dark-theme" : ""}>
        <CardTitle className="dialogTitle">
          <FontAwesome name="list-alt" className="listIcon" />Transaction
          Details
          <button onClick={this.handleClose} className="closeBtn">
            <FontAwesome name="close" />
          </button>
        </CardTitle>
        <div align="center">
          <CardBody className="card-body">
            <span className="loading-wheel">
              {" "}
              <FontAwesome name="circle-o-notch" size="3x" spin />
            </span>
          </CardBody>
        </div>
      </div>
    );
  }
}

TransactionView.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TransactionView);
