/* eslint-disable comma-dangle */
/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
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

export class ChaincodeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      request: {
        zip: {},
        name: '',
        version: '',
        type: '',
        peer: '',
        channel: ''
      }
    };
  }

  handleChange = event => {
    this.setState({
      request: {
        ...this.state.request,
        [event.target.name]: event.target.value
      }
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.props.handleDialog('install', this.state.request);
  };

  handleFileUpload = event => {
    this.setState({
      request: {
        ...this.state.request,
        [event.target.name]: event.target.files[0]
      }
    });
    console.log(this.state.request);
  };

  render() {
    const { classes, peerList, channels } = this.props;
    return (
      // TODO : Replace with liform-react
      <div className={['card', classes.container].join(' ')}>
        <div className="card-header" align="center">
          <h3>Add Chaincode</h3>
        </div>
        <div className="card-body">
          <form className={classes.container1} onSubmit={this.handleSubmit}>
            <input
              type="file"
              id="file-path"
              label="File Path"
              name="zip"
              onChange={this.handleFileUpload}
              className={classes.textField}
              margin="normal"
            />
            <TextField
              id="channel-name"
              select
              label="Channel Name"
              name="channel"
              value={this.state.request.channel}
              onChange={this.handleChange}
              className={classes.textField}
              margin="normal"
            >
              {channels.map(channel => (
                <MenuItem
                  key={channel.channel_genesis_hash}
                  value={channel.channelname}
                >
                  {channel.channelname}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              id="targetPeer"
              select
              label="Target Peer"
              name="peer"
              value={this.state.request.peer}
              onChange={this.handleChange}
              className={classes.textField}
              margin="normal"
            >
              {peerList.map(peer => (
                <MenuItem key={peer.requests} value={peer.server_hostname}>
                  {peer.server_hostname}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              id="chaincode-name"
              label="Chaincode Name"
              name="name"
              onChange={this.handleChange}
              className={classes.textField}
              margin="normal"
            />
            <TextField
              id="version-number"
              label="Version Number"
              name="version"
              onChange={this.handleChange}
              className={classes.textField}
              margin="normal"
            />
            <TextField
              id="chaincode-type"
              select
              label="Select Chaincode Type"
              className={classes.textField}
              value={this.state.request.type}
              onChange={this.handleChange}
              name="type"
              margin="normal"
            >
              <MenuItem value={'Go'}>Go</MenuItem>
              <MenuItem value={'javascript'}>javascript</MenuItem>
              <MenuItem value={'java'}>Java</MenuItem>
            </TextField>
            <Button className={classes.button}>Submit</Button>
          </form>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ChaincodeForm);
