/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  form: {
    width: 310
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 130
  },
  fileField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 300
  },
  menu: {
    width: 200
  }
});

class ChannelForm extends Component {
  render() {
    const { classes } = this.props;

    return (
      // TODO : Replace with liform-react
      <div>
        <form className={classes.container}>
          <TextField
            id="channel-name"
            label="Name"
            className={classes.textField}
            margin="normal"
          />
          <TextField
            id="org-name"
            label="Org Name"
            className={classes.textField}
            margin="normal"
          />
        </form>
        <br />
        <form className={classes.form}>
          <TextField
            type="file"
            id="org-path"
            label="Org Path"
            className={classes.fileField}
            helperText="path to org config"
            margin="normal"
          />
          <TextField
            type="file"
            id="channel-path"
            label="Channel Path"
            className={classes.fileField}
            helperText="path to channel config"
            margin="normal"
          />
          <TextField
            type="file"
            id="network-path"
            label="Network Path"
            className={classes.fileField}
            helperText="path to network config"
            margin="normal"
          />
          <Button size="small" color="primary">
            Submit
          </Button>
        </form>
      </div>
    );
  }
}

export default withStyles(styles)(ChannelForm);
