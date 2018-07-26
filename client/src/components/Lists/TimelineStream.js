/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Timeline, TimelineEvent } from 'react-event-timeline';
import Dialog from '@material-ui/core/Dialog';
import FontAwesome from 'react-fontawesome';
import Typography from '@material-ui/core/Typography';
import { Badge } from 'reactstrap';
import Timeago from 'react-timeago';
import find from 'lodash/find';
import BlockView from '../View/BlockView';
import blockOpen from '../../static/images/blockOpen.png';
import { blockListType, notificationsType } from '../types';

class TimelineStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpenBlockHash: false,
      blockHash: {}
    };
  }

  handleDialogOpenBlockHash = rowValue => {
    const { blockList } = this.props;
    const data = find(blockList, item => item.blockhash === rowValue);
    this.setState({
      dialogOpenBlockHash: true,
      blockHash: data
    });
  };

  handleDialogCloseBlockHash = () => {
    this.setState({ dialogOpenBlockHash: false });
  };

  render() {
    const { notifications } = this.props;
    const { blockHash, dialogOpenBlockHash } = this.state;
    return (
      <div>
        <div className="scrollable-card">
          <Timeline>
            {notifications.map(item => (
              <TimelineEvent
                key={item.title}
                title={item.title}
                icon={<FontAwesome name="cube" />}
                iconColor="#0D3799"
                container="card"
                className="timeline-event"
                titleStyle={{ fontWeight: 'bold' }}
                style={{ width: '65%' }}
                cardHeaderStyle={{
                  backgroundColor: '#6283D0',
                  fontSize: '13pt'
                }}
                contentStyle={{
                  backgroundColor: 'transparent'
                }}
                buttons={
                  <a
                    className="blockLink"
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
                  <b className="timeLineText"> Datahash:</b> {item.datahash}{' '}
                  <br />
                  <b className="timeLineText"> Number of Tx:</b> {item.txcount}
                </Typography>
                <h5 className="timeLineText">
                  <Badge className="timeLineText">
                    <Timeago
                      className="timeLineText"
                      date={item.time}
                      live={false}
                      minPeriod={60}
                    />
                  </Badge>
                </h5>
              </TimelineEvent>
            ))}
          </Timeline>
        </div>

        <Dialog
          open={dialogOpenBlockHash}
          onClose={this.handleDialogCloseBlockHash}
          fullWidth
          maxWidth="md"
        >
          <BlockView
            blockHash={blockHash}
            onClose={this.handleDialogCloseBlockHash}
          />
        </Dialog>
      </div>
    );
  }
}

TimelineStream.propTypes = {
  blockList: blockListType.isRequired,
  notifications: notificationsType.isRequired
};

export default TimelineStream;
