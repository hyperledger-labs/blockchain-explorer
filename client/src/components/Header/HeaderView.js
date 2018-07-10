/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import "react-select/dist/react-select.css";
import React, {Component} from "react";
import compose from "recompose/compose";
import {connect} from "react-redux";
import {withStyles} from "material-ui/styles";
import Select from "react-select";
import {Nav, Navbar, NavbarBrand, NavbarToggler} from "reactstrap";
import {HashRouter as Router, NavLink, Link} from "react-router-dom";
import Switch from "material-ui/Switch";
import AdminPanel from "../Panels/AdminPanel";
import Logo from "../../static/images/Explorer_Logo.svg";
import FontAwesome from "react-fontawesome";
import Drawer from "material-ui/Drawer";
import Button from "material-ui/Button";
import NotificationsPanel from "../Panels/NotificationsPanel";
import Websocket from "react-websocket";
import Badge from "material-ui/Badge";
import {chartOperations, chartSelectors} from "../../state/redux/charts/";
import {tableOperations, tableSelectors} from "../../state/redux/tables/";

const {
  blockPerHour,
  blockPerMin,
  transactionPerHour,
  transactionPerMin,
  transactionByOrg,
  dashStats,
  changeChannel,
  peerStatus
} = chartOperations;

const {blockList, chaincodeList, peerList, transactionList} = tableOperations;

const {currentChannelSelector} = chartSelectors;
const {channelsSelector} = tableSelectors;

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
      selectedChannel: {},
      isLight: true
    };
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  handleData(notification) {
    // this.props.getNotification(notification);
    let notifyArr = this.state.notifications;
    notifyArr.unshift(JSON.parse(notification));
    this.setState({notifications: notifyArr});
    this.setState({notifyCount: this.state.notifyCount + 1});
  }

  componentDidMount() {
    let arr = [];
    let selectedValue ={}
    this.props.channels.forEach(element => {
      if (element.genesis_block_hash === this.props.currentChannel) {
        selectedValue = {
          value: element.genesis_block_hash,
          label: element.channelname
        };

      }
      arr.push({
        value: element.genesis_block_hash,
        label: element.channelname
      });
    });

    this.setState({
      channels: arr,
      isLoading: false,
      selectedChannel: selectedValue
    });

    setInterval(() => this.syncData(this.props.currentChannel), 60000);
  }

  syncData(currentChannel) {
    this.props.getBlockList(currentChannel, 0);
    this.props.getChaincodeList(currentChannel);
    this.props.getDashStats(currentChannel);
    this.props.getPeerList(currentChannel);
    this.props.getPeerStatus(currentChannel);
    this.props.getTransactionByOrg(currentChannel);
    this.props.getTransactionList(currentChannel, 0);
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
          nextProps.currentChannel == null ||
          nextProps.currentChannel == undefined
        ) {
          if (element.genesis_block_hash != null) {
            selectedValue = {
              "value": element.genesis_block_hash,
              "label": element.channelname
            };
          }
        } else if (element.genesis_block_hash === nextProps.currentChannel) {
          selectedValue = {
            value: element.genesis_block_hash,
            label: element.channelname
          };
        }
      });
    }

    if (
      nextProps.currentChannel == null ||
      nextProps.currentChannel == undefined
    ) {
      this.props.getChangeChannel(selectedValue.value);
    }

    this.setState({
      channels: options,
      isLoading: false,
      selectedChannel: selectedValue
    });
    if (nextProps.currentChannel !== this.props.currentChannel) {
      this.syncData(nextProps.currentChannel);
    }
  }

  handleChange = selectedChannel => {
    this.setState({selectedChannel});
    this.props.getChangeChannel(selectedChannel.value);
    this.syncData(selectedChannel.value);
  };

  handleOpen = () => {
    this.setState({modalOpen: true});
  };

  handleClose = () => {
    this.setState({modalOpen: false});
  };

  handleDrawOpen = drawer => {
    switch (drawer) {
      case "notifyDrawer": {
        this.setState({notifyDrawer: true});
        this.setState({notifyCount: 0});
        break;
      }
      case "adminDrawer": {
        this.setState({adminDrawer: true});
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
        this.setState({notifyDrawer: false});
        break;
      }
      case "adminDrawer": {
        this.setState({adminDrawer: false});
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
    this.setState({isLight: theme});
    this.props.refresh(theme);
  };

  render() {
    const {classes} = this.props;
    const {hostname, port} = window.location;
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
        <Router>
          <div>
            <Navbar className="navbar-header" expand="md" fixed="top">
              <NavbarBrand href="/">
                {" "}
                <img src={Logo} className="logo" alt="Hyperledger Logo" />
              </NavbarBrand>
              <NavbarToggler onClick={this.toggle} />
              <Nav className="ml-auto " navbar>
                <li>
                  <NavLink
                    to="/"
                    exact
                    className="dashButtons"
                    activeClassName="activeTab"
                  >
                    DASHBOARD
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/network"
                    className="dashButtons"
                    activeClassName="activeTab"
                  >
                    NETWORK
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/blocks"
                    className="dashButtons"
                    activeClassName="activeTab"
                  >
                    BLOCKS
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/transactions"
                    className="dashButtons"
                    activeClassName="activeTab"
                  >
                    TRANSACTIONS
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/chaincodes"
                    className="dashButtons"
                    activeClassName="activeTab"
                  >
                    CHAINCODES
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/channels"
                    className="dashButtons"
                    activeClassName="activeTab"
                  >
                    CHANNELS
                  </NavLink>
                </li>

                <div>
                  <Select
                    className="channel-dropdown"
                    placeholder="Select Channel..."
                    required={true}
                    name="form-field-name"
                    isLoading={this.state.isLoading}
                    value={this.state.selectedChannel}
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
                  </div>
                }
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
        </Router>
      </div>
    );
  }
}

export default compose(
  withStyles(styles),
  connect(
    state => ({
      currentChannel: currentChannelSelector(state),
      channels: channelsSelector(state)
    }),
    {
      getBlockList: blockList,
      getBlocksPerHour: blockPerHour,
      getBlocksPerMin: blockPerMin,
      getChaincodeList: chaincodeList,
      getChangeChannel: changeChannel, //not in syncdata
      getDashStats: dashStats,
      getPeerList: peerList,
      getPeerStatus: peerStatus,
      getTransactionByOrg: transactionByOrg,
      getTransactionList: transactionList,
      getTransactionPerHour: transactionPerHour,
      getTransactionPerMin: transactionPerMin
    }
  )
)(HeaderView);
