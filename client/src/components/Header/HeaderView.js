import 'react-select/dist/react-select.css';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import { Nav, Navbar, NavbarBrand, NavbarToggler } from 'reactstrap';

class HeaderView extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      isOpen: false,
      channels: []
    }
    this.toggle = this.toggle.bind(this);

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

    this.setState({channels: arr});

    this.setState({ selectedOption: arr[0] })

  }
  componentWillReceiveProps(nextProps) {
    // console.log(nextProps.trades);
    // this.setState({loading:false});
  }

  handleChange = (selectedOption) => {
    this.setState({ selectedOption: selectedOption });
  }

  render() {
    return (
      <div>
        <Navbar color="faded" light expand="md">
          <NavbarBrand href="/"> HYPERLEDGER EXPLORER</NavbarBrand>
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
          </Nav>
        </Navbar>
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
