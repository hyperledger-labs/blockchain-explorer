/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { Timeline, TimelineEvent } from "react-event-timeline";
import Dialog, { DialogTitle } from "material-ui/Dialog";
import FontAwesome from "react-fontawesome";
import Typography from "material-ui/Typography";
import { Card, CardHeader, CardBody } from "reactstrap";
import { Badge } from "reactstrap";
import Timeago from "react-timeago";
import find from "lodash/find";
import BlockView from "../View/BlockView";
import blockOpen from "../../static/images/blockOpen.png";

class TimelineStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      notifications: [],
      dialogOpenBlockHash: false
    };
  }
  handleDialogOpenBlockHash = rowValue => {
    const data = find(this.props.blockList, function(item) {
      return item.blockhash === rowValue;
    });
    this.setState({ dialogOpenBlockHash: true, blockHash: data });
  };
  handleDialogCloseBlockHash = () => {
    this.setState({ dialogOpenBlockHash: false });
  };

  render() {
    return (
      <div className="activity-stream">
        <Card>
          <CardHeader>
            <h5>Activity</h5>
          </CardHeader>
          <CardBody>
            <div className="scrollable-card">
              <Timeline>
                {this.props.notifications.map(item => (
                  <TimelineEvent
                    key={item.title}
                    title={item.title}
                    icon={<FontAwesome name="cube" />}
                    iconColor="#0D3799"
                    container="card"
                    titleStyle={{ fontWeight: "bold" }}
                    style={{ width: "400px" }}
                    cardHeaderStyle={{
                      backgroundColor: "#6283D0",
                      fontSize: "13pt"
                    }}
                    buttons={
                      <a
                        href="#/"
                        onClick={() =>
                          this.handleDialogOpenBlockHash(item.blockhash)
                        }
                      >
                        <img
                          src={blockOpen}
                          alt="View Blocks"
                          className="blockOpen"
                        />
                      </a>
                    }
                  >
                    <Typography variant="body1">
                      <b> Datahash:</b> {item.datahash} <br />
                      <b> Number of Tx:</b> {item.txcount}
                    </Typography>
                    <h5>
                      <Badge>
                        <Timeago date={item.time} live={false} minPeriod={60} />
                      </Badge>
                    </h5>
                  </TimelineEvent>
                ))}
              </Timeline>
            </div>
          </CardBody>
        </Card>
        <Dialog
          open={this.state.dialogOpenBlockHash}
          onClose={this.handleDialogCloseBlockHash}
          fullWidth={true}
          maxWidth={"md"}
        >
          <BlockView
            blockHash={this.state.blockHash}
            onClose={this.handleDialogCloseBlockHash}
          />
        </Dialog>
      </div>
    );
  }
}

export default TimelineStream;
