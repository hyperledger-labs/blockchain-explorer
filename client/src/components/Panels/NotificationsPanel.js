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

const styles = theme => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper
    },
    avatarBlue: {
      backgroundColor: '#1C3860'
    },
    panel: {
      color: dark ? '#ffffff' : undefined,
      backgroundColor: dark ? '#5e558e' : undefined
    },
    badge: {
      marginLeft: '60% !important',
      color: dark ? '#ffffff' : undefined,
      backgroundColor: dark ? '#242036' : undefined
    },
    time: {
      color: dark ? '#ffffff' : undefined,
      backgroundColor: dark ? '#242036' : undefined
    }
  };
};

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
        <div className={classes.panel}>
          <div className={classes.root}>
            <List component="nav" className={classes.panel}>
              <ListItem button>
                <Typography variant="title" className={classes.panel}>
                  NO NOTIFICATIONS
                </Typography>
              </ListItem>
            </List>
          </div>
        </div>
      );
    }

    return (
      <div className={classes.panel}>
        <div className={classes.root}>
          <List component="nav" className={classes.panel}>
            {notifications.map((notify, index) => (
              <div>
                <ListItem key={index} button className={classes.panel}>
                  {this.avatarIcon(notify.type, classes)}
                  <ListItemText
                    className={classes.panel}
                    primary={notify.title}
                    secondary={notify.message}
                  />
                </ListItem>
                <Badge className={classes.badge}>
                  <Timeago
                    className={classes.time}
                    date={notify.time}
                    live={false}
                    minPeriod={60}
                  />
                </Badge>
              </div>
            ))}
          </List>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(NotificationsPanel);
