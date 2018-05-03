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

import ChannelForm from '../Forms/Channel';
import FontAwesome from 'react-fontawesome';
// import Select from 'react-select';
import { MenuItem } from 'material-ui/Menu';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Select from 'material-ui/Select';

class AdminPanel extends Component {
    constructor(props, context) {
        super(props, context);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange() {

    }
    render() {

        return (
            <div>
                <Typography variant="headline"><FontAwesome name="cogs" /> ADMIN PANEL</Typography>

                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subheading">MANAGE CHANNEL  </Typography>
                        <Typography variant='caption' color="primary" >
                            {this.props.channel.currentChannel} <br />
                        </Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        {/* <Typography variant='subheading' color="textSecondary">
                            Select Channel
                            </Typography> */}
                        <form>
                            <FormControl className="select-channel">
                                <Select
                                    value={20}
                                    onChange={this.handleChange}
                                    helperText="select channel"
                                    inputProps={{
                                        name: 'age',
                                        id: 'age-simple',
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    <MenuItem value={10}>mock1</MenuItem>
                                    <MenuItem value={20}>mychannel</MenuItem>
                                    <MenuItem value={30}>mock2</MenuItem>
                                </Select>
                                <FormHelperText>select a channel</FormHelperText>

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
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subheading">ADD CHANNEL</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
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
    }
}
// function mapDispatchToProps(dispatch){
//   return {actions: bindActionCreators({...partActions,...secActions}, dispatch)}
// }
export default connect(mapStateToProps/*,mapDispatchToProps*/)(AdminPanel);