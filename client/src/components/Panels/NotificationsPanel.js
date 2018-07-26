/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import FontAwesome from 'react-fontawesome';
import { Badge } from 'reactstrap';
import Timeago from 'react-timeago';

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  },
  avatarBlue: {
    backgroundColor: '#1C3860'
  }
});

export class NotificationsPanel extends Component {
  avatarIcon = (type, classes) => {
    switch (type) {
      case 'block':
        return (
          <Avatar className={classes.avatarBlue}>
            <FontAwesome name="cube" />{' '}
          </Avatar>
        );
      default:
        return (
          <Avatar>
            <FontAwesome name="exclamation" />{' '}
          </Avatar>
        );
    }
  };

  render() {
    const { classes, notifications } = this.props;
    if (notifications.length === 0) {
      return (
        <div className="notificationPanel">
          <div className={classes.root}>
            <List component="nav" className="notificationPanel">
              <ListItem button>
                <Typography variant="title" className="notificationPanel">
                  NO NOTIFICATIONS
                </Typography>
              </ListItem>
            </List>
          </div>
        </div>
      );
    }

    return (
      <div className="notificationPanel">
        <div className={classes.root}>
          <List component="nav" className="notificationPanel">
            {notifications.map((notify, index) => (
              <ListItem key={index} button className="notificationPanel">
                {this.avatarIcon(notify.type, classes)}
                <ListItemText
                  className="notificationPanel"
                  primary={notify.title}
                  secondary={notify.message}
                />
                <Badge className="notificationTime">
                  <Timeago
                    className="notificationTime"
                    date={notify.time}
                    live={false}
                    minPeriod={60}
                  />
                </Badge>
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(NotificationsPanel);
