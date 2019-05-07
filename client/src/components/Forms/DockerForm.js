/* eslint-disable arrow-parens */
/* eslint-disable comma-dangle */
/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { Button } from 'reactstrap';

const styles = theme => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    container: {
      border: '3px solid #afeeee'
    },
    header: {
      backgroundColor: '#24272a',
      color: '#f7f7f7',
      font: 'bold'
    },
    form: {
      display: 'flex',
      flexWrap: 'wrap'
    },
    textField: {
      width: '100%'
    },
    button: {
      backgroundColor: '#afeeee',
      fontSize: 16,
      color: 'black',
      padding: '14px 70px',
      margin: 'auto',
      display: 'block',
      border: 'none',
      boxShadow: '0px 9px 10px  rgba(0,0,0,0.05)'
    },
    card: {
      backgroundColor: dark ? '#453e68' : undefined,
      color: dark ? '#ffffff' : undefined
    },
    content: {
      backgroundColor: dark ? '#453e68' : undefined,
      color: dark ? '#ffffff' : undefined,
      '& > h1': {
        fontSize: '25pt'
      }
    }
  };
};

export class DockerForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      request: {
        org: {},
        peers: ''
      }
    };
  }

  handleChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value
    });
  };

  render() {
    const { classes } = this.props;
    const { org, peers } = this.state;
    const isActive = org && peers >= 1;
    const url = `/api/orgs/docker?newOrg=${org}&numPeers=${peers}`;
    return (
      // TODO : Replace with liform-react
      <div className={['card', classes.container].join(' ')}>
        <div className="card-header" align="center">
          <h3>Add Chaincode</h3>
        </div>
        <div className="card-body">
          <form className={classes.container1} onSubmit={this.handleSubmit}>
            <TextField
              id="org"
              label="Organisation name"
              name="org"
              onChange={this.handleChange}
              className={classes.textField}
              margin="normal"
            />
            <TextField
              id="peers"
              label="Peers"
              name="peers"
              onChange={this.handleChange}
              className={classes.textField}
              margin="normal"
              type="number"
            />
            <Button className={classes.button} href={url} disabled={!isActive}>
              Download
            </Button>
          </form>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(DockerForm);
