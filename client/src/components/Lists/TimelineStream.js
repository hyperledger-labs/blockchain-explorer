/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
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

const styles = (theme) => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    scrollable: {
      height: 300,
      overflowY: 'scroll',
    },
    text: {
      color: dark ? '#ffffff' : undefined,
      '& .badge-secondary': {
        backgroundColor: '#5e548f',
      },
    },
    event: {
      wordWrap: 'break-word',
      width: '90% !important',
      backgroundColor: dark ? '#423b5f !important' : undefined,
      '& p': {
        color: dark ? '#ffffff' : undefined,
      },
      '& > div': {
        color: dark ? 'red' : undefined,
      },
    },
    open: {
      height: 35,
      marginTop: -10,
      backgroundColor: 'transparent',
    },
  };
};

export class TimelineStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpenBlockHash: false,
      blockHash: {},
    };
  }

  handleDialogOpenBlockHash = (rowValue) => {
    const { blockList } = this.props;
    const data = find(blockList, item => item.blockhash === rowValue);
    this.setState({
      dialogOpenBlockHash: true,
      blockHash: data,
    });
  };

  handleDialogCloseBlockHash = () => {
    this.setState({ dialogOpenBlockHash: false });
  };

  render() {
    const { notifications, classes } = this.props;
    const { blockHash, dialogOpenBlockHash } = this.state;
    return (
      <div>
        <div className={classes.scrollable}>
          <Timeline>
            {notifications.map(item => (
              <TimelineEvent
                key={item.title}
                title={item.title}
                icon={<FontAwesome name="cube" />}
                iconColor="#0D3799"
                container="card"
                className={classes.event}
                titleStyle={{ fontWeight: 'bold' }}
                style={{ width: '65%' }}
                cardHeaderStyle={{
                  backgroundColor: '#6283D0',
                  fontSize: '13pt',
                }}
                contentStyle={{
                  backgroundColor: 'transparent',
                }}
                buttons={(
                  <a
                    data-command="block-link"
                    href="#/"
                    onClick={() => this.handleDialogOpenBlockHash(item.blockhash)
                    }
                  >
                    <img
                      src={blockOpen}
                      alt="View Blocks"
                      className={classes.open}
                    />
                  </a>
)}
              >
                <Typography variant="body1">
                  <b className={classes.text}>
                    {' '}
Channel Name:
                  </b>
                  {' '}
                  {item.channelName}
                  {' '}
                  <br />
                  <b className={classes.text}>
                    {' '}
Datahash:
                  </b>
                  {' '}
                  {item.datahash}
                  {' '}
                  <br />
                  <b className={classes.text}>
                    {' '}
Number of Tx:
                  </b>
                  {' '}
                  {item.txcount}
                </Typography>
                <h5 className={classes.text}>
                  <Badge className={classes.text}>
                    <Timeago
                      className={classes.text}
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
  notifications: notificationsType.isRequired,
};

export default withStyles(styles)(TimelineStream);
