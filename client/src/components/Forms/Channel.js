/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
// import { Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Button from 'material-ui/Button';
import Input, { InputLabel } from 'material-ui/Input';
import FormGroup, { FormControl, FormHelperText } from 'material-ui/Form';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 130,
    },
    menu: {
        width: 200,
    },
});

class ChannelForm extends Component {
    constructor(props, context) {
        super(props, context)
    }
    render() {
        const { classes } = this.props;

        return (
            // TODO : Replace with liform-react
            <div>
                <form className={classes.container} >
                    <TextField
                        id="channel-name"
                        label="Name"
                        className={classes.textField}
                        margin="normal"
                    />
                    <TextField
                        id="path"
                        label="Path"
                        className={classes.textField}
                        helperText="path to config"
                        margin="normal"
                    />
                </form>
                <br />
                <form className={classes.container}>
                    <TextField
                        id="peer"
                        label="Peer"
                        className={classes.textField}
                        helperText="consensus type"
                        margin="normal"
                    />
                    <TextField
                        id="type"
                        label="Type"
                        className={classes.textField}
                        helperText="consensus type"
                        margin="normal"
                    />
                    <Button size="small" color="primary">Submit</Button>
                </form>
            </div>
        );
    }
}
export default withStyles(styles)(ChannelForm);