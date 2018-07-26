/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import 'react-select/dist/react-select.css';
import React, { Component } from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Select from 'react-select';
import { Nav, Navbar, NavbarBrand, NavbarToggler } from 'reactstrap';
import { HashRouter as Router, NavLink } from 'react-router-dom';
import Switch from '@material-ui/core/Switch';
import FontAwesome from 'react-fontawesome';
import Drawer from '@material-ui/core/Drawer';
import Websocket from 'react-websocket';
import Badge from '@material-ui/core/Badge';
import Dialog from '@material-ui/core/Dialog';
import Loader from 'react-loader-spinner';
import NotificationsPanel from '../Panels/NotificationsPanel';
import Logo from '../../static/images/Explorer_Logo.svg';
import AdminPanel from '../Panels/AdminPanel';
import { chartOperations, chartSelectors } from '../../state/redux/charts';
import { tableOperations, tableSelectors } from '../../state/redux/tables';
import {
  currentChannelType,
  channelsType,
  getBlockListType,
  getBlocksPerHourType,
  getBlocksPerMinType,
  getChaincodeListType,
  getChangeChannelType,
  getDashStatsType,
  getPeerListType,
  getPeerStatusType,
  getTransactionByOrgType,
  getTransactionPerHourType,
  getTransactionPerMinType,
  refreshType
} from '../types';

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

const { blockList, chaincodeList, peerList, transactionList } = tableOperations;

const { currentChannelSelector } = chartSelectors;
const { channelsSelector } = tableSelectors;

const styles = theme => ({
  margin: {
    margin: theme.spacing.unit
  },
  padding: {
    padding: `0 ${theme.spacing.unit * 2}px`
  },
  menuButtons: {
    margin: theme.spacing.unit,
    fontSize: '1.05rem !important',
    fontWeight: '800'
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
      selectedChannel: {}
    };
  }

  componentDidMount() {
    const { channels, currentChannel } = this.props;
    const arr = [];
    let selectedValue = {};
    channels.forEach(element => {
      if (element.genesis_block_hash === currentChannel) {
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

    this.interVal = setInterval(() => {
      this.syncData(currentChannel);
    }, 60000);
  }
  componentWillUnmount() {
    clearInterval(this.interVal);
  }

  componentWillReceiveProps(nextProps) {
    const { currentChannel, getChangeChannel } = this.props;
    const options = [];
    let selectedValue = {};
    if (nextProps.channels.length > 0) {
      nextProps.channels.forEach(element => {
        options.push({
          value: element.genesis_block_hash,
          label: element.channelname
        });
        if (
          nextProps.currentChannel == null ||
          nextProps.currentChannel === undefined
        ) {
          if (element.genesis_block_hash != null) {
            selectedValue = {
              value: element.genesis_block_hash,
              label: element.channelname
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
      nextProps.currentChannel === null ||
      nextProps.currentChannel === undefined
    ) {
      getChangeChannel(selectedValue.value);
    }

    this.setState({
      channels: options,
      isLoading: false,
      selectedChannel: selectedValue
    });
    if (nextProps.currentChannel !== currentChannel) {
      this.syncData(nextProps.currentChannel);
    }
  }

  toggle = () => {
    const { isOpen } = this.state;
    this.setState({
      isOpen: !isOpen
    });
  };

  handleChange = async selectedChannel => {
    if (this.state.channels.length > 1) {
      const { currentChannel, getChangeChannel } = this.props;
      clearInterval(this.interVal);
      await this.handleOpen();
      this.setState({ selectedChannel });
      getChangeChannel(selectedChannel.value);
      await this.syncData(selectedChannel.value);
      this.interVal = setInterval(() => {
        this.syncData(selectedChannel.value);
      }, 60000);
    }
    //  this.handleClose();
  };

  handleOpen = () => {
    this.setState({ modalOpen: true });
  };

  handleClose = () => {
    this.setState({ modalOpen: false });
  };

  handleDrawOpen = drawer => {
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
  };

  handleDrawClose = drawer => {
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
  };

  handleThemeChange = () => {
    const { refresh } = this.props;
    const theme = sessionStorage.getItem('toggleTheme') !== 'true';
    sessionStorage.setItem('toggleTheme', theme);
    this.setState({ isLight: theme });
    refresh(theme);
  };

  handleData(notification) {
    // this.props.getNotification(notification);
    const { notifications, notifyCount } = this.state;
    const notifyArr = notifications;
    notifyArr.unshift(JSON.parse(notification));
    this.setState({ notifications: notifyArr });
    this.setState({ notifyCount: notifyCount + 1 });
  }

  async syncData(currentChannel) {
    const {
      getBlockList,
      getBlocksPerHour,
      getBlocksPerMin,
      getChaincodeList,
      getDashStats,
      getPeerList,
      getPeerStatus,
      getTransactionByOrg,
      getTransactionList,
      getTransactionPerHour,
      getTransactionPerMin
    } = this.props;

    await Promise.all([
      getBlockList(currentChannel),
      getBlocksPerHour(currentChannel),
      getBlocksPerMin(currentChannel),
      getChaincodeList(currentChannel),
      getDashStats(currentChannel),
      getPeerList(currentChannel),
      getPeerStatus(currentChannel),
      getTransactionByOrg(currentChannel),
      getTransactionList(currentChannel),
      getTransactionPerHour(currentChannel),
      getTransactionPerMin(currentChannel)
    ]);
    this.handleClose();
  }

  render() {
    const { hostname, port } = window.location;
    const webSocketUrl = `ws://${hostname}:${port}/`;
    const themeIcon = sessionStorage.getItem('toggleTheme') === 'true';
    const {
      isLoading,
      selectedChannel,
      channels,
      notifyCount,
      notifyDrawer,
      adminDrawer,
      modalOpen,
      notifications
    } = this.state;

    return (
      <div>
        {/* production */}
        {/* development */}
        <Websocket
          url={webSocketUrl}
          onMessage={this.handleData.bind(this)}
          reconnect
        />
        <Router>
          <div>
            <Navbar className="navbar-header" expand="md" fixed="top">
              <NavbarBrand href="/">
                {' '}
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
                    required
                    name="form-field-name"
                    isLoading={isLoading}
                    value={selectedChannel}
                    onChange={this.handleChange}
                    options={channels}
                  />
                </div>
                {
                  <div className="admin-buttons">
                    <FontAwesome
                      name="bell"
                      className="bell"
                      onClick={() => this.handleDrawOpen('notifyDrawer')}
                    />
                    <Badge
                      className="navIcons"
                      badgeContent={notifyCount}
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
              open={notifyDrawer}
              onClose={() => this.handleDrawClose('notifyDrawer')}
            >
              <div tabIndex={0} role="button">
                <NotificationsPanel notifications={notifications} />
              </div>
            </Drawer>
            <Drawer
              anchor="right"
              open={adminDrawer}
              onClose={() => this.handleDrawClose('adminDrawer')}
            >
              <div tabIndex={0} role="button">
                <AdminPanel />
              </div>
            </Drawer>
            <Dialog
              open={modalOpen}
              onClose={this.handleClose}
              fullWidth={false}
              maxWidth="md"
            >
              <div className="channel-loader">
                <h4 className="loader-message">Loading Channel Details</h4>
                <Loader
                  type="ThreeDots"
                  color="#005069"
                  height={70}
                  width={70}
                  className="loader"
                />
              </div>
            </Dialog>
          </div>
        </Router>
      </div>
    );
  }
}

HeaderView.propTypes = {
  currentChannel: currentChannelType.isRequired,
  channels: channelsType.isRequired,
  getBlockList: getBlockListType.isRequired,
  getBlocksPerHour: getBlocksPerHourType.isRequired,
  getBlocksPerMin: getBlocksPerMinType.isRequired,
  getChangeChannel: getChangeChannelType.isRequired,
  getChaincodeList: getChaincodeListType.isRequired,
  getDashStats: getDashStatsType.isRequired,
  getPeerList: getPeerListType.isRequired,
  getPeerStatus: getPeerStatusType.isRequired,
  getTransactionByOrg: getTransactionByOrgType.isRequired,
  getTransactionPerHour: getTransactionPerHourType.isRequired,
  getTransactionPerMin: getTransactionPerMinType.isRequired,
  refresh: refreshType.isRequired
};

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
      getChangeChannel: changeChannel, // not in syncdata
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
