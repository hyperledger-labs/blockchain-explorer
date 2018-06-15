/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import TextField from "material-ui/TextField";
import { withStyles } from "material-ui/styles";
import { Button } from "reactstrap";

const styles = theme => ({
  container: {
    border: "3px solid #afeeee"
  },
  container1: {
    display: "flex",
    flexWrap: "wrap"
  },

  textField: {
    width: "100%"
  },
  button: {
    "background-color": "#afeeee",
    "font-size": "16px",
    color: "black",
    padding: "14px 70px",
    margin: "auto",
    display: "block",
    border: "none",
    "box-shadow": "0px 9px 10px  rgba(0,0,0,0.05)"
  }
});

class ChaincodeForm extends Component {
  render() {
    const { classes } = this.props;

    return (
      // TODO : Replace with liform-react
      <div className={["card", classes.container].join(" ")}>
        <div className="card-header" align="center">
          <h3>Add Chaincode</h3>
        </div>
        <div className="card-body">
          <form className={classes.container1}>
            <TextField
              id="file-path"
              label="File Path"
              className={classes.textField}
              margin="normal"
            />
            <TextField
              id="chaincode-name"
              label="Chaincode Name"
              className={classes.textField}
              margin="normal"
            />
            <TextField
              id="version-number"
              label="Version Number"
              className={classes.textField}
              margin="normal"
            />

            <Button className={classes.button}>Submit</Button>
          </form>
        </div>
      </div>
    );
  }
}
export default withStyles(styles)(ChaincodeForm);
