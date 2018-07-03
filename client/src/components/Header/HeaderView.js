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
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler
} from 'reactstrap';
import Switch from 'material-ui/Switch';
import AdminPanel from '../Panels/AdminPanel';
import Logo from '../../static/images/Explorer_Logo.svg';
import FontAwesome from 'react-fontawesome';
import Drawer from 'material-ui/Drawer';
import Button from 'material-ui/Button';
import NotificationsPanel from '../Panels/NotificationsPanel';
import Websocket from 'react-websocket';
import Badge from 'material-ui/Badge';
import {
  getChannelList,
  getChannel,
  getNotification,
} from '../../store/selectors/selectors'
import chartsOperations from '../../state/redux/charts/operations'
import tablesOperations from '../../state/redux/tables/operations'
const {
  blockPerHour,
  blockPerMin,
  transactionPerHour,
  transactionPerMin,
  transactionByOrg,
  notification,
  dashStats,
  channel,
  channelList,
  changeChannel,
  peerStatus
} = chartsOperations

const {
  blockList,
  chaincodeList,
  channels,
  peerList,
  transactionInfo,
  transactionList
} = tablesOperations

const styles = theme => ({
  margin: {
    margin: theme.spacing.unit,
  },
  padding: {
    padding: `0 ${theme.spacing.unit * 2}px`,
  },
  menuButtons:{
    margin: theme.spacing.unit,
    fontSize:'1.05rem !important',
    fontWeight:'800'
  }
});

export class HeaderView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      notifyDrawer: false,
      adminDrawer: false,
      channels: [],
      notifyCount: 0,
      notifications: [],
      modalOpen: false,
      isLight: true
    }
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleData(notification) {
    this.props.getNotification(notification);
    let notifyArr = this.state.notifications;
    notifyArr.unshift(JSON.parse(notification));
    this.setState({ notifications: notifyArr });
    this.setState({ notifyCount: this.state.notifyCount + 1 });
  }

  componentDidMount() {
    let arr = [];
    this.props.channelList.forEach(element => {
      arr.push({
        value: element,
        label: element
      })
    });

    this.setState({ channels: arr });
    this.setState({ selectedOption: this.props.channel.currentChannel })

    setInterval(
      () => this.syncData(this.props.channel.currentChannel),
      30000
    );
  }

  syncData(currentChannel) {
    this.props.getPeerList(currentChannel);
    this.props.getDashStats(currentChannel);
    this.props.getPeerStatus(currentChannel);
    this.props.getTxPerHour(currentChannel);
    this.props.getTxPerMin(currentChannel);
    this.props.getBlocksPerHour(currentChannel);
    this.props.getBlocksPerMin(currentChannel);
    this.props.getTransactionList(currentChannel, 0);
    this.props.getBlockList(currentChannel, 0);
    this.props.getTxByOrg(currentChannel);
    this.props.getChaincodes(currentChannel);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.channel.currentChannel !== this.props.channel.currentChannel) {
      this.syncData(nextProps.channel.currentChannel)
    }
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption: selectedOption.value });
    this.props.getChangeChannel(selectedOption.value);
  }

  handleOpen = () => {
    this.setState({ modalOpen: true });
  }

  handleClose = () => {
    this.setState({ modalOpen: false });
  }

  handleDrawOpen = (drawer) => {
    switch (drawer) {
      case 'notifyDrawer': {
        this.setState({ notifyDrawer: true });
        this.setState({ notifyCount: 0 });
        break;
      }
      case 'adminDrawer': {
        this.setState({ adminDrawer: true });
        break;
      }
      default: {
        break;
      }
    }
  }

  handleDrawClose = (drawer) => {
    switch (drawer) {
      case 'notifyDrawer': {
        this.setState({ notifyDrawer: false });
        break;
      }
      case 'adminDrawer': {
        this.setState({ adminDrawer: false });
        break;
      }
      default: {
        break;
      }
    }
  }
  handleThemeChange = () => {
    const theme = !this.state.isLight;
    this.setState({ isLight: theme });
  }

  render() {
    const { classes } = this.props;
    const { hostname, port } = window.location;
    var webSocketUrl = `ws://${hostname}:${port}/`;

    return (
      <div>
        {/* production */}
        {/* development */}
        <Websocket url={webSocketUrl}
          onMessage={this.handleData.bind(this)} reconnect={true} />
        <Navbar className="navbar-header" expand="md" fixed="top">
          <NavbarBrand href="/"> <img src={Logo} className="logo" alt="Hyperledger Logo" /></NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Nav className="ml-auto" navbar>
            <Button href="/#" className={classes.menuButtons} >DASHBOARD</Button>
            <Button href="#/network" className={classes.menuButtons} >NETWORK</Button>
            <Button href="#/blocks" className={classes.menuButtons} >BLOCKS</Button>
            <Button href="#/transactions" className={classes.menuButtons} >TRANSACTIONS</Button>
            <Button href="#/chaincodes" className={classes.menuButtons} >CHAINCODES</Button>
            <Button href="#/channels" className={classes.menuButtons} >CHANNELS</Button>
            <div className="channel-dropdown">
              <Select
                placeholder="Select Channel..."
                required={true}
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
              <FontAwesome name="cog" className="cog" onClick={() => this.handleDrawOpen("adminDrawer")} />
            </div>
            <div className="admin-buttons theme-switch">
              <Switch
                onChange={() => this.handleThemeChange()}
                value={this.state.isLight} />
            </div>
          </Nav>
        </Navbar>
        <Drawer anchor="right" open={this.state.notifyDrawer} onClose={() => this.handleDrawClose("notifyDrawer")}>
          <div
            tabIndex={0}
            role="button" >
            <NotificationsPanel notifications={this.state.notifications} />
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

export default compose(withStyles(styles), connect((state) => ({
  channel: getChannel(state),
  channelList: getChannelList(state),
  notification: getNotification(state)
}), {
    getNotification: notification,
    getChangeChannel: changeChannel,
    getDashStats: dashStats,
    getTxPerHour: transactionPerHour,
    getTxPerMin: transactionPerMin,
    getBlocksPerHour: blockPerHour,
    getBlocksPerMin: blockPerMin,
    getTransactionList: transactionList,
    getBlockList: blockList,
    getPeerList: peerList,
    getPeerStatus: peerStatus,
    getChaincodes: chaincodeList,
    getTxByOrg: transactionByOrg
  }))(HeaderView)
