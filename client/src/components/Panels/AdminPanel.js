/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import ExpansionPanel, {
    ExpansionPanelSummary,
    ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Typography from 'material-ui/Typography';
import ChannelForm from '../Forms/ChannelForm';
import FontAwesome from 'react-fontawesome';
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Select from 'material-ui/Select';

class AdminPanel extends Component {
    constructor(props, context) {
        super(props, context);
    }

    handleChange = () => {}

  render() {
    return (
      <div className="admin-panel">
        <Typography variant="headline" className="admin-panel">
          <FontAwesome name="cogs" className="admin-panel"/> ADMIN PANEL
        </Typography>
        <ExpansionPanel className="admin-panel">
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            className="admin-panel"
          >
            <Typography variant="subheading" className="admin-panel">
              MANAGE CHANNEL{" "}
            </Typography>
            <Typography variant="caption" className="admin-panelCurrent">
              {this.props.channel.currentChannel} <br />
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className="admin-panel">
            {/* <Typography variant='subheading' color="textSecondary">
                            Select Channel
                            </Typography> */}
            <form className="admin-panel">
              <FormControl className="select-channel" className="admin-panel">
                <Select
                  value={20}
                  onChange={this.handleChange}
                  helperText="select channel"
                  inputProps={{
                    name: "age",
                    id: "age-simple"
                  }}
                >
                  <MenuItem value="" className="admin-panel">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem className="admin-panel" value={10}>
                    mock1
                  </MenuItem>
                  <MenuItem className="admin-panel" value={20}>
                    mychannel
                  </MenuItem>
                  <MenuItem className="admin-panel" value={30}>
                    mock2
                  </MenuItem>
                </Select>
                <FormHelperText className="admin-panel">
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
        <ExpansionPanel className="admin-panel">
          <ExpansionPanelSummary
            className="admin-panel"
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="subheading" className="admin-panel">
              ADD CHANNEL
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className="admin-panel">
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
    channel: state.channel.channel
  };
}
// function mapDispatchToProps(dispatch){
//   return {actions: bindActionCreators({...partActions,...secActions}, dispatch)}
// }
export default connect(mapStateToProps/*,mapDispatchToProps*/)(AdminPanel);
