/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import 'react-select/dist/react-select.css';

import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withStyles } from 'material-ui/styles';
import Select from 'react-select';
import {
  Nav, Navbar, NavbarBrand, NavbarToggler
} from 'reactstrap';
import AdminPanel from '../Panels/Admin';
import Logo from '../../static/images/Explorer_Logo.svg';
import FontAwesome from 'react-fontawesome';
import Drawer from 'material-ui/Drawer';
import NotificationPanel from '../Panels/Notifications';
import Websocket from 'react-websocket';
// import { Badge } from 'reactstrap';
import Badge from 'material-ui/Badge';
import { getNotification as getNotificationCreator } from '../../store/actions/notification/action-creators';
import { changeChannel as changeChannelCreator } from '../../store/actions/channel/action-creators';
import { getHeaderCount as getCountHeaderCreator } from '../../store/actions/header/action-creators';
import { getPeerList as getPeerListCreator } from '../../store/actions/peer/action-creators';
import { getBlockList as getBlockListCreator } from '../../store/actions/block/action-creators';
import { getTransactionList as getTransactionListCreator } from '../../store/actions/transactions/action-creators';
import { getHeaderCount as getHeaderCountCreator } from '../../store/actions/header/action-creators';
import { getChaincodes as getChaincodesCreator } from '../../store/actions/chaincodes/action-creators';
import { getTxByOrg as getTxByOrgCreator } from '../../store/actions/charts/action-creators';
import {
  blocksPerHour as getBlocksPerHourCreator,
  blocksPerMin as getBlocksPerMinCreator,
  txPerHour as getTxPerHourCreator,
  txPerMin as getTxPerMinCreator
} from '../../store/actions/charts/action-creators';


const styles = theme => ({
  margin: {
    margin: theme.spacing.unit,
  },
  padding: {
    padding: `0 ${theme.spacing.unit * 2}px`,
  },
});
class HeaderView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      notifyDrawer: false,
      adminDrawer: false,
      channels: [],
      notifyCount: 0,
      notifications: [],
      modalOpen: false
    }
    this.toggle = this.toggle.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleDrawOpen = this.handleDrawOpen.bind(this);
    this.handleDrawClose = this.handleDrawClose.bind(this);

  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  handleData(notification) {
    this.props.getNotification(notification);
    var notifyArr = this.state.notifications;
    notifyArr.unshift(JSON.parse(notification));
    this.setState({ notifications: notifyArr });
    this.setState({ notifyCount: this.state.notifyCount + 1 });
  }
  componentDidMount() {
    // this.props.actions.loadTrades();
    var arr = [];
    this.props.channelList.channels.forEach(element => {
      arr.push({
        value: element,
        label: element
      })
    });

    this.setState({ channels: arr });

    this.setState({ selectedOption: this.props.channel.currentChannel })

  }
  componentWillReceiveProps(nextProps) {
    // this.setState({loading:false});
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption: selectedOption.value });
    this.props.changeChannel(selectedOption.value);
    setTimeout(() => {
      this.props.getPeerList(selectedOption.value);
      this.props.getHeaderCount(selectedOption.value);
      this.props.getTxPerHour(selectedOption.value);
      this.props.getTxPerMin(selectedOption.value);
      this.props.getBlocksPerHour(selectedOption.value);
      this.props.getBlocksPerMin(selectedOption.value);
      this.props.getTransactionList(selectedOption.value, 0);
      this.props.getBlockList(selectedOption.value, 0);
      this.props.getChaincodes(selectedOption.value);
      this.props.getTxByOrg(selectedOption.value);
    }, 5000);
  }

  handleOpen() {




    this.setState({ modalOpen: true });
  }

  handleClose() {
    this.setState({ modalOpen: false });
  }
  handleDrawOpen(drawer) {
    switch (drawer) {
      case "notifyDrawer":
        this.setState({ notifyDrawer: true });
        this.setState({ notifyCount: 0 });

        break;
      case "adminDrawer":
        this.setState({ adminDrawer: true });

        break;

      default:
        break;
    }
  }
  handleDrawClose(drawer) {
    switch (drawer) {
      case "notifyDrawer":
        this.setState({ notifyDrawer: false });

        break;
      case "adminDrawer":
        this.setState({ adminDrawer: false });

        break;

      default:
        break;
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <Websocket url='ws://localhost:8080/'
          onMessage={this.handleData.bind(this)} reconnect={true} />
        <Navbar color="faded" light expand="md">
          <NavbarBrand href="/"> <img src={Logo} className="logo" alt="Hyperledger Logo" /></NavbarBrand>
          {/* <NavbarBrand href="/"> HYPERLEDGER EXPLORER</NavbarBrand> */}
          <NavbarToggler onClick={this.toggle} />
          <Nav className="ml-auto" navbar>
            <div className='channel-dropdown'>
              <Select
                placeholder='Select Channel...'
                required='true'
                name="form-field-name"
                value={this.state.selectedOption}
                onChange={this.handleChange}
                options={this.state.channels} />
            </div>
            <div className="admin-buttons">
              <FontAwesome name="bell" className="bell" onClick={() => this.handleDrawOpen("notifyDrawer")} />
              <Badge className={classes.margin} badgeContent={this.state.notifyCount} color="primary"></Badge>
            </div>
            <div className="admin-buttons">
              <FontAwesome name="cog" className="bell" onClick={() => this.handleDrawOpen("adminDrawer")} />
            </div>
          </Nav>
        </Navbar>
        <Drawer anchor="right" open={this.state.notifyDrawer} onClose={() => this.handleDrawClose("notifyDrawer")}>
          <div
            tabIndex={0}
            role="button" >
            <NotificationPanel notifications={this.state.notifications} />
          </div>
        </Drawer>
        <Drawer anchor="right" open={this.state.adminDrawer} onClose={() => this.handleDrawClose("adminDrawer")}>
          <div
            tabIndex={0}
            role="button">
            <AdminPanel />
          </div>
        </Drawer>
      </div>
    );
  }

}
function mapStateToProps(state, ownProps) {
  return {
    channelList: state.channelList.channelList,
    channel: state.channel.channel,
    notification: state.notification.notification
  }
}
const mapDispatchToProps = (dispatch) => ({
  getNotification: (notification) => dispatch(getNotificationCreator(notification)),
  changeChannel: (curChannel) => dispatch(changeChannelCreator(curChannel)),
  getCountHeader: (curChannel) => dispatch(getCountHeaderCreator(curChannel)),
  getHeaderCount: (curChannel) => dispatch(getHeaderCountCreator(curChannel)),
  getTxPerHour: (curChannel) => dispatch(getTxPerHourCreator(curChannel)),
  getTxPerMin: (curChannel) => dispatch(getTxPerMinCreator(curChannel)),
  getBlocksPerHour: (curChannel) => dispatch(getBlocksPerHourCreator(curChannel)),
  getBlocksPerMin: (curChannel) => dispatch(getBlocksPerMinCreator(curChannel)),
  getTransactionList: (curChannel, offset) => dispatch(getTransactionListCreator(curChannel, offset)),
  getBlockList: (curChannel, offset) => dispatch(getBlockListCreator(curChannel, offset)),
  getPeerList: (curChannel) => dispatch(getPeerListCreator(curChannel)),
  getChaincodes: (curChannel) => dispatch(getChaincodesCreator(curChannel)),
  getTxByOrg: (curChannel) => dispatch(getTxByOrgCreator(curChannel))
});
export default compose(withStyles(styles), connect(mapStateToProps, mapDispatchToProps))(HeaderView);
