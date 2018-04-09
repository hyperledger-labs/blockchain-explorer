/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import List, { ListItem,  ListItemText } from 'material-ui/List';

const styles = theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
});

class NotificationPanel extends Component {

    constructor(props, context) {
        super(props, context);
    }
    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <List component="nav">
                    <ListItem button>
                        <ListItemText primary="Notification2"
                        secondary="peer1.org1.example.com added to channel" />
                    </ListItem>
                    <ListItem button >
                        <ListItemText primary="Notification1" />
                    </ListItem>
                </List>
            </div>
        );
    }

}
export default withStyles(styles)(NotificationPanel);
