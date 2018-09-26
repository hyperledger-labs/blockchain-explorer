/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { Button } from 'reactstrap';

const styles = (theme) => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    container: {
      border: '3px solid #afeeee',
    },
    header: {
      backgroundColor: '#24272a',
      color: '#f7f7f7',
      font: 'bold',
    },
    form: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: {
      width: '100%',
    },
    button: {
      backgroundColor: '#afeeee',
      fontSize: 16,
      color: 'black',
      padding: '14px 70px',
      margin: 'auto',
      display: 'block',
      border: 'none',
      boxShadow: '0px 9px 10px  rgba(0,0,0,0.05)',
    },
    card: {
      backgroundColor: dark ? '#453e68' : undefined,
      color: dark ? '#ffffff' : undefined,
    },
    content: {
      backgroundColor: dark ? '#453e68' : undefined,
      color: dark ? '#ffffff' : undefined,
      '& > h1': {
        fontSize: '25pt',
      },
    },
  };
};

class ChaincodeForm extends Component {
  render() {
    const { classes } = this.props;
    return (
      // TODO : Replace with liform-react
      <div className={`${classes.card} ${classes.container}`}>
        <div className={classes.header} align="center">
          <h3>
Add Chaincode
          </h3>
        </div>
        <div className={classes.content}>
          <form className={classes.form}>
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
            <Button className={classes.button}>
Submit
            </Button>
          </form>
        </div>
      </div>
    );
  }
}
export default withStyles(styles)(ChaincodeForm);
