/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, {Component} from "react";
import {withStyles} from "material-ui/styles";
import List, {ListItem, ListItemText} from "material-ui/List";
import Typography from "material-ui/Typography";
import Avatar from "material-ui/Avatar";
import FontAwesome from "react-fontawesome";
import {Badge} from "reactstrap";
import Timeago from "react-timeago";

const styles = theme => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  },
  avatarBlue: {
    backgroundColor: "#1C3860"
  }
});

export class NotificationsPanel extends Component {
  constructor(props) {
    super(props);
  }

  avatarIcon = (type, classes) => {
    switch (type) {
      case "block":
        return (
          <Avatar className={classes.avatarBlue}>
            <FontAwesome name="cube" />{" "}
          </Avatar>
        );
        break;
      default:
        return (
          <Avatar>
            <FontAwesome name="exclamation" />{" "}
          </Avatar>
        );
        break;
    }
  };

  render() {
    const {classes} = this.props;
    if (this.props.notifications.length === 0) {
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
              {this.props.notifications.map((notify, index) => (
                <ListItem key={index} button className="notificationPanel">
                  {this.avatarIcon(notify.type, classes)}
                  <ListItemText className="notificationPanel"
                    primary={notify.title}
                    secondary={notify.message}
                  />
                  <Badge className="notificationTime">
                    <Timeago className="notificationTime" date={notify.time} live={false} minPeriod={60} />
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
