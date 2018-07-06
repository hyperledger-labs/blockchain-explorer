/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import Main from "../Main";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { createMuiTheme } from "material-ui/styles";
import indigo from "material-ui/colors/indigo";
import lightBlue from "material-ui/colors/lightBlue";
import red from "material-ui/colors/red";
import HeaderView from "../Header/HeaderView";
import FooterView from "../Header/footerView";
import LandingPage from "../View/LandingPage";
import "../../static/css/main.css";
import "../../static/css/main-dark.css";
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
const muiTheme = createMuiTheme({
  palette: {
    contrastThreshold: 3,
    tonalOffset: 0.2,
    primary: indigo,
    secondary: lightBlue,
    error: {
      main: red[500]
    },
    toggleClass: true
  }
});

class App extends Component {
  constructor(props) {
    super(props);
    this.refreshComponent = this.refreshComponent.bind(this);
    this.state = {
      loading: true
    };
  }

  componentWillMount() {
    //Check if sessionStorage is true, then theme is true, else false.
    const theme = sessionStorage.getItem("toggleTheme") === "true";
    this.setState({ toggleClass: theme });
    theme
      ? (document.body.className = "dark-theme")
      : (document.body.className = "");
    theme
      ? (document.body.style.backgroundColor = "#242036")
      : (document.body.style.backgroundColor = "#F0F5F9");
  }

  updateLoadStatus = () => {
    this.setState({ loading: false })
  }
  refreshComponent = val => {
    this.setState({ toggleClass: val });
    this.state.toggleClass
      ? (document.body.style.backgroundColor = "#F0F5F9")
      : (document.body.style.backgroundColor = "#242036");
    this.state.toggleClass
      ? (document.body.className = "")
      : (document.body.className = "dark-theme");
  };

  render() {
    if (this.state.loading) {
      return <LandingPage
        updateLoadStatus={this.updateLoadStatus}
      />;
    }

    return (
      <MuiThemeProvider theme={muiTheme}>
        <div>
          <HeaderView refresh={this.refreshComponent.bind(this)} />
          <Main />
          <div class="footerView">
            <FooterView />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
export default App;
/* export default connect((state) => ({
  channel: getChannel(state),
  channelList: getChannelList(state),
  notification: getNotification(state)
}), {
    getBlockList: blockList,
    getBlocksPerHour: blockPerHour,
    getBlocksPerMin: blockPerMin,
    getChaincodeList: chaincodeList,
    getChannel: channel,
    getChannelList: channelList,
    getChannels: channels,
    getDashStats: dashStats,
    getPeerList: peerList,
    getPeerStatus: peerStatus,
    getTransactionByOrg: transactionByOrg,
    getTransactionList: transactionList,
    getTransactionPerHour: transactionPerHour,
    getTransactionPerMin: transactionPerMin,
  })(App); */
