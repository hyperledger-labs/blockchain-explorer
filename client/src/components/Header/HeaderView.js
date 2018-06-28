/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import "react-select/dist/react-select.css";
import React, { Component, PropTypes } from "react";
import compose from "recompose/compose";
import { connect } from "react-redux";
import { withStyles } from "material-ui/styles";
import Select from "react-select";
import { Nav, Navbar, NavbarBrand, NavbarToggler } from "reactstrap";
import { HashRouter as Router, Link } from "react-router-dom";
import Switch from "material-ui/Switch";
import AdminPanel from "../Panels/AdminPanel";
import Logo from "../../static/images/Explorer_Logo.svg";
import FontAwesome from "react-fontawesome";
import Drawer from "material-ui/Drawer";
import Button from "material-ui/Button";
import NotificationsPanel from "../Panels/NotificationsPanel";
import Websocket from "react-websocket";
import Badge from "material-ui/Badge";
import { notification } from "../../store/actions/notification/action-creators";
import { changeChannel } from "../../store/actions/channel/action-creators";
import {
  getChannelList,
  getChannel,
  getNotification,
  getCountHeader,
  getChannels
} from "../../store/selectors/selectors";
import { countHeader } from "../../store/actions/header/action-creators";
import { peerList, peerStatus } from "../../store/actions/peer/action-creators";
import { blockList } from "../../store/actions/block/action-creators";
import { transactionList } from "../../store/actions/transactions/action-creators";
import { chaincodes } from "../../store/actions/chaincodes/action-creators";
import { channelsData } from "../../store/actions/channels/action-creators";

import {
  txByOrg,
  blocksPerHour,
  blocksPerMin,
  txPerHour,
  txPerMin
} from "../../store/actions/charts/action-creators";
import { isNullOrUndefined } from "util";

const styles = theme => ({
  margin: {
    margin: theme.spacing.unit
  },
  padding: {
    padding: `0 ${theme.spacing.unit * 2}px`
  },
  menuButtons: {
    margin: theme.spacing.unit,
    fontSize: "1.05rem !important",
    fontWeight: "800"
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
      isLoading: true,
      modalOpen: false,
      selectedOption: "",
      isLight: true,
      dashboard:"dashButtons activeTab",
      network:"dashButtons",
      transaction:"dashButtons",
      channel:"dashButtons",
      chaincode:"dashButtons",
      block:"dashButtons"
    };
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  handleData(notification) {
    this.props.getNotification(notification);
    let notifyArr = this.state.notifications;
    notifyArr.unshift(JSON.parse(notification));
    this.setState({ notifications: notifyArr });
    this.setState({ notifyCount: this.state.notifyCount + 1 });
  }

  componentDidMount() {
    this.props.getChannelsInfo();
    setInterval(() => this.syncData(this.props.channel.currentChannel), 30000);
  }

  syncData() {
    this.props.getChannelsInfo();
    if (
      this.props.channel.currentChannel != null &&
      this.props.channel.currentChannel != undefined
    ) {
      this.props.getPeerList(this.props.channel.currentChannel);
      this.props.getCountHeader(this.props.channel.currentChannel);
      this.props.getPeerStatus(this.props.channel.currentChannel);
      this.props.getTxPerHour(this.props.channel.currentChannel);
      this.props.getTxPerMin(this.props.channel.currentChannel);
      this.props.getBlocksPerHour(this.props.channel.currentChannel);
      this.props.getBlocksPerMin(this.props.channel.currentChannel);
      this.props.getTransactionList(this.props.channel.currentChannel, 0);
      this.props.getBlockList(this.props.channel.currentChannel, 0);
      this.props.getTxByOrg(this.props.channel.currentChannel);
      this.props.getChaincodes(this.props.channel.currentChannel);
    }
  }

  componentWillReceiveProps(nextProps) {
    let options = [];
    let selectedValue = {};
    if (nextProps.channels.length > 0) {
      nextProps.channels.forEach(element => {
        options.push({
          value: element.genesis_block_hash,
          label: element.channelname
        });
        if (
          nextProps.channel.currentChannel == null ||
          nextProps.channel.currentChannel == undefined
        ) {
          if (element.genesis_block_hash != null) {
            selectedValue = {
              value: element.genesis_block_hash,
              label: element.channelname
            };
          }
        } else if (
          element.genesis_block_hash === nextProps.channel.currentChannel
        ) {
          selectedValue = {
            value: element.genesis_block_hash,
            label: element.channelname
          };
        }
      });
    }

    if (
      nextProps.channel.currentChannel == null ||
      nextProps.channel.currentChannel == undefined
    ) {
      this.props.getChangeChannel(selectedValue.value);
    }

    this.setState({
      channels: options,
      isLoading: false,
      selectedOption: selectedValue
    });
    if (
      nextProps.channel.currentChannel !== this.props.channel.currentChannel
    ) {
      this.syncData(nextProps.channel.currentChannel);
    }
  }

  handleChange = selectedOption => {
    this.setState({ selectedOption });
    this.props.getChangeChannel(selectedOption.value);
  };
  enableTab = val => {
    const active = "dashButtons activeTab";
    const inactive = "dashButtons";
    switch(val){
      case 'dashboard':
      this.setState({dashboard:active,network:inactive,transaction:inactive,chaincode:inactive,block:inactive,channel:inactive})
      break;
      case 'network':
      this.setState({dashboard:inactive,network:active,transaction:inactive,chaincode:inactive,block:inactive,channel:inactive})
      break;
      case 'transaction':
      this.setState({dashboard:inactive,network:inactive,transaction:active,chaincode:inactive,block:inactive,channel:inactive})
      break;
      case 'chaincode':
      this.setState({dashboard:inactive,network:inactive,transaction:inactive,chaincode:active,block:inactive,channel:inactive})
      break;
      case 'block':
      this.setState({dashboard:inactive,network:inactive,transaction:inactive,chaincode:inactive,block:active,channel:inactive})
      break;
      case 'channel':
      this.setState({dashboard:inactive,network:inactive,transaction:inactive,chaincode:inactive,block:inactive,channel:active})
      break;
    }
  }

  handleOpen = () => {
    this.setState({ modalOpen: true });
  };

  handleClose = () => {
    this.setState({ modalOpen: false });
  };

  handleDrawOpen = drawer => {
    switch (drawer) {
      case "notifyDrawer": {
        this.setState({ notifyDrawer: true });
        this.setState({ notifyCount: 0 });
        break;
      }
      case "adminDrawer": {
        this.setState({ adminDrawer: true });
        break;
      }
      default: {
        break;
      }
    }
  };

  handleDrawClose = drawer => {
    switch (drawer) {
      case "notifyDrawer": {
        this.setState({ notifyDrawer: false });
        break;
      }
      case "adminDrawer": {
        this.setState({ adminDrawer: false });
        break;
      }
      default: {
        break;
      }
    }
  };
  handleThemeChange = () => {
    const theme =
      sessionStorage.getItem("toggleTheme") === "true" ? false : true;
    sessionStorage.setItem("toggleTheme", theme);
    this.setState({ isLight: theme });
    this.props.refresh(theme);
  };

  render() {
    const { classes } = this.props;
    const { hostname, port } = window.location;
    var webSocketUrl = `ws://${hostname}:${port}/`;
    const themeIcon = sessionStorage.getItem("toggleTheme") === "true";
    const dashLink = props => (
      <Link to="/" exact activeClassName="active" {...props} />
    );
    const transLink = props => (
      <Link to="/transactions" activeClassName="active" {...props} />
    );

    return (
        <div>
          {/* production */}
          {/* development */}
          <Websocket
            url={webSocketUrl}
            onMessage={this.handleData.bind(this)}
            reconnect={true}
          />
          <Navbar className="navbar-header" expand="md" fixed="top">
            <NavbarBrand href="/">
              {" "}
              <img src={Logo} className="logo" alt="Hyperledger Logo" />
            </NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Nav className="ml-auto " navbar>
              <Button href="#/"  onClick={() => this.enableTab('dashboard')} className={this.state.dashboard}>
                DASHBOARD
              </Button>
              <Button href="#/network" onClick={() => this.enableTab('network')} className={this.state.network}>
                NETWORK
              </Button>
              <Button href="#/blocks" onClick={() => this.enableTab('block')} className={this.state.block}>
                BLOCKS
              </Button>
              <Button href="#/transactions" onClick={() => this.enableTab('transaction')} className={this.state.transaction}>
                TRANSACTIONS
              </Button>
              <Button href="#/chaincodes" onClick={() => this.enableTab('chaincode')} className={this.state.chaincode}>
                CHAINCODES
              </Button>
              <Button href="#/channels" onClick={() => this.enableTab('channel')} className={this.state.channel}>
                CHANNELS
              </Button>
              <div className="channel-dropdown">
                <Select
                  placeholder="Select Channel..."
                  required={true}
                  name="form-field-name"
                  isLoading={this.state.isLoading}
                  value={this.state.selectedOption}
                  onChange={this.handleChange}
                  options={this.state.channels}
                />
              </div>
              {
              <div className="admin-buttons">
                <FontAwesome
                  name="bell"
                  className="bell"
                  onClick={() => this.handleDrawOpen("notifyDrawer")}
                />
                <Badge
                  className="navIcons"
                  badgeContent={this.state.notifyCount}
                  color="primary"
                />
              </div> }
              {/*
              //Use when Admin functionality is required
              <div className="admin-buttons">
                <FontAwesome
                  name="cog"
                  className="cog"
                  onClick={() => this.handleDrawOpen("adminDrawer")}
                />
              </div> */}
              <div className="admin-buttons theme-switch">
                <FontAwesome name="sun-o" className="sunIcon" />
                <Switch
                  onChange={() => this.handleThemeChange()}
                  checked={themeIcon}
                />
                <FontAwesome name="moon-o" className="moonIcon" />
              </div>
            </Nav>
          </Navbar>
          <Drawer
            anchor="right"
            open={this.state.notifyDrawer}
            onClose={() => this.handleDrawClose("notifyDrawer")}
          >
            <div tabIndex={0} role="button">
              <NotificationsPanel notifications={this.state.notifications} />
            </div>
          </Drawer>
          <Drawer
            anchor="right"
            open={this.state.adminDrawer}
            onClose={() => this.handleDrawClose("adminDrawer")}
          >
            <div tabIndex={0} role="button">
              <AdminPanel />
            </div>
          </Drawer>
        </div>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    state => ({
      channel: getChannel(state),
      channelList: getChannelList(state),
      channels: getChannels(state),
      notification: getNotification(state)
    }),
    {
      getNotification: notification,
      getChangeChannel: changeChannel,
      getCountHeader: countHeader,
      getTxPerHour: txPerHour,
      getTxPerMin: txPerMin,
      getBlocksPerHour: blocksPerHour,
      getBlocksPerMin: blocksPerMin,
      getTransactionList: transactionList,
      getBlockList: blockList,
      getPeerList: peerList,
      getPeerStatus: peerStatus,
      getChaincodes: chaincodes,
      getTxByOrg: txByOrg,
      getChannelsInfo: channelsData
    }
  )
)(HeaderView);
