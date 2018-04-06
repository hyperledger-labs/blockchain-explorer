import 'react-select/dist/react-select.css';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import {
  Nav, Navbar, NavbarBrand, NavbarToggler
} from 'reactstrap';
import AdminPanel from '../Panels/Admin';
import Logo from '../../static/images/Explorer_Logo.svg';
import FontAwesome from 'react-fontawesome';
import Drawer from 'material-ui/Drawer';

import NotificationPanel from '../Panels/Notifications';
class HeaderView extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isOpen: false,
      notifyDrawer: false,
      adminDrawer: false,
      channels: [],
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

    this.setState({ selectedOption: arr[0] })

  }
  componentWillReceiveProps(nextProps) {
    // console.log(nextProps.trades);
    // this.setState({loading:false});
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption: selectedOption });
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
    return (
      <div>
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
            </div>
            <div className="admin-buttons">
              <FontAwesome name="cog" className="bell" onClick={() => this.handleDrawOpen("adminDrawer")} />
            </div>
          </Nav>
        </Navbar>
        <Drawer anchor="right" open={this.state.notifyDrawer} onClose={()=> this.handleDrawClose("notifyDrawer")}>
          <div
            tabIndex={0}
            role="button" >
            <NotificationPanel />
          </div>
        </Drawer>
        <Drawer anchor="right" open={this.state.adminDrawer} onClose={()=> this.handleDrawClose("adminDrawer")}>
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
    channel: state.channel.channel
  }
}
// function mapDispatchToProps(dispatch){
//   return {actions: bindActionCreators({...partActions,...secActions}, dispatch)}
// }
export default connect(mapStateToProps/*,mapDispatchToProps*/)(HeaderView);
