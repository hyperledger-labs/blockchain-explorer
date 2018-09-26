/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core/ExpansionPanel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import FontAwesome from 'react-fontawesome';
import { MenuItem } from '@material-ui/core/Menu';
import { FormControl, FormHelperText } from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ChannelForm from '../Forms/ChannelForm';

const styles = (theme) => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    current: {
      color: dark ? 'rgb(42, 173, 230)' : undefined,
    },
    panel: {
      color: dark ? '#ffffff' : undefined,
      backgroundColor: dark ? '#3c3558' : undefined,
    },
    channel: {
      width: 200,
    },
  };
};

class AdminPanel extends Component {
  handleChange = () => {};

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.panel}>
        <Typography variant="headline" className={classes.panel}>
          <FontAwesome name="cogs" className={classes.panel} />
          {' '}
ADMIN PANEL
        </Typography>
        <ExpansionPanel className={classes.panel}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            className={classes.panel}
          >
            <Typography variant="subheading" className={classes.panel}>
              MANAGE CHANNEL
              {' '}
            </Typography>
            <Typography variant="caption" className={classes.current}>
              {this.props.channel.currentChannel}
              {' '}
              <br />
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.panel}>
            {/* <Typography variant='subheading' color="textSecondary">
                            Select Channel
                            </Typography> */}
            <form className={classes.panel}>
              <FormControl className={`${classes.channel} ${classes.panel}`}>
                <Select
                  value={20}
                  onChange={this.handleChange}
                  helperText="select channel"
                  inputProps={{
                    name: 'age',
                    id: 'age-simple',
                  }}
                >
                  <MenuItem value="" className={classes.panel}>
                    <em>
None
                    </em>
                  </MenuItem>
                  <MenuItem className={classes.panel} value={10}>
                    mock1
                  </MenuItem>
                  <MenuItem className={classes.panel} value={20}>
                    mychannel
                  </MenuItem>
                  <MenuItem className={classes.panel} value={30}>
                    mock2
                  </MenuItem>
                </Select>
                <FormHelperText className={classes.panel}>
                  select a channel
                </FormHelperText>
              </FormControl>
            </form>
            {/* <div className='channel-dropdown'>
                                <Select
                                    placeholder='Select Channel...'
                                    required='true'
                                    name="form-field-name"
                                    value={channel}
                                    onChange={handleChange}
                                    options={channels} />
                            </div> */}
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel className={classes.panel}>
          <ExpansionPanelSummary
            className={classes.panel}
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="subheading" className={classes.panel}>
              ADD CHANNEL
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.panel}>
            <ChannelForm />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    channelList: state.channelList.channelList,
    channel: state.channel.channel,
  };
}
// function mapDispatchToProps(dispatch){
//   return {actions: bindActionCreators({...partActions,...secActions}, dispatch)}
// }

export default compose(
  withStyles(styles),
  connect(mapStateToProps /* ,mapDispatchToProps */),
)(AdminPanel);
