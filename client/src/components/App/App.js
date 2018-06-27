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
import LandingPage from "../View/LandingPage";
import "../../static/css/main.css";
import "../../static/css/main-dark.css";

sessionStorage.getItem("toggleTheme")
  ? (document.body.style.backgroundColor = "#F0F5F9")
  : (document.body.style.backgroundColor = "#F0F5F9");

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
      loading: true,
      toggleClass: sessionStorage.getItem("toggleTheme")
    };
  }

  componentWillMount() {
    /* if (sessionStorage.getItem("toggleTheme") === "true") {
      require("../../static/css/main.css");
    } else {
      require("../../static/css/main-dark.css");
    } */
    setTimeout(() => this.setState({ loading: false }), 6000);
  }
  refreshComponent = val => {
    this.setState({ toggleClass: val });
    this.state.toggleClass
      ? (document.body.style.backgroundColor = "#F0F5F9")
      : (document.body.style.backgroundColor = "#242036");

    //this.forceUpdate();
    // window.location.reload(true);
  };

  render() {
    if (this.state.loading) {
      return <LandingPage />;
    }

    return (
      <MuiThemeProvider theme={muiTheme}>
        <div className={this.state.toggleClass ? "dark-theme" : ""}>
          <HeaderView refresh={this.refreshComponent.bind(this)} />
          <Main />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
