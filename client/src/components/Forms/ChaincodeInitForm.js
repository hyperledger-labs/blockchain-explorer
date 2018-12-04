import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { Button } from 'reactstrap';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  container: {
    border: '3px solid #afeeee'
  },
  container1: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    width: '100%'
  },
  button: {
    'background-color': '#afeeee',
    'font-size': '16px',
    color: 'black',
    padding: '14px 70px',
    margin: 'auto',
    display: 'block',
    border: 'none',
    'box-shadow': '0px 9px 10px  rgba(0,0,0,0.05)'
  },
  paramField: {
    width: '80%'
  },
  paramBtn: {
    width: '10%',
    'margin-left': '30px'
  },
  paramBlock: {
    width: '100%'
  }
});

class ChaincodeInitForm extends Component {
  id = 1;

  constructor(props) {
    super(props);
    this.state = {
      request: {
        peer: '',
        policy: '',
        type: 'init',
        channel: '',
        params: [{ id: 0, data: '', text: '+' }]
      }
    };
  }

  handleSubmit = async e => {
    e.preventDefault();
    const { request } = this.state;
    const { chaincodeInfo } = this.props;
    const { params } = request;
    const args = params.map(arg => arg.data);
    const payload = {
      ...request,
      name: chaincodeInfo.name,
      version: chaincodeInfo.version,
      peer: request.peer.server_hostname,
      params: args
    };

    this.props.handleDialog('init', payload);
  };

  handleChange = e => {
    this.setState({
      request: {
        ...this.state.request,
        [e.target.name]: e.target.value,
        channel: e.target.name === 'peer' ? e.target.value.name : ''
      }
    });
  };

  handleParamCreate = () => {
    const { request } = this.state;
    const { params } = this.state.request;
    const newParams = params
      .map(param => ({ ...param, text: '-' }))
      .concat({
        id: this.id++,
        data: '',
        text: '+'
      });
    this.setState({
      request: {
        ...request,
        params: newParams
      }
    });
  };

  handleParamRemove = id => {
    const { request } = this.state;
    const { params } = this.state.request;
    const newParams = params.filter(param => param.id !== id);
    this.setState({
      request: {
        ...request,
        params: newParams
      }
    });
  };

  handleParams = param => {
    if (param.id === this.id - 1) {
      // last param
      this.handleParamCreate();
    } else {
      this.handleParamRemove(param.id);
    }
  };

  handleParamChange = e => {
    const { request } = this.state;
    const { params } = this.state.request;
    const newParam = params.map(param =>
      e.target.name === param.id.toString()
        ? { ...param, data: e.target.value }
        : param
    );
    this.setState({
      request: {
        ...request,
        params: newParam
      }
    });
  };

  render() {
    const { classes } = this.props;
    const { peerList } = this.props;
    const { chaincodeInfo } = this.props;
    const { request } = this.state;

    return (
      <div className={'card ' + classes.container}>
        <div className="card-header" align="center">
          <h3>
            Instantiate Chaincode ({chaincodeInfo.name} ver:
            {chaincodeInfo.version}){' '}
          </h3>
        </div>
        <div className="card-body">
          <form className={classes.container1} onSubmit={this.handleSubmit}>
            <TextField
              id="initType"
              select
              label="Request Type"
              className={classes.textField}
              value={this.state.request.type}
              onChange={this.handleChange}
              name="type"
              margin="normal"
            >
              <MenuItem value="init">Init</MenuItem>
              <MenuItem value="upgrade">Upgrade</MenuItem>
            </TextField>
            <TextField
              id="peers"
              select
              label="Select Peer"
              className={classes.textField}
              value={this.state.request.peer}
              onChange={this.handleChange}
              name="peer"
              margin="normal"
            >
              {peerList.map(peer => (
                <MenuItem key={peer.requests} value={peer}>
                  {peer.server_hostname}
                </MenuItem>
              ))}
              ;
            </TextField>
            <TextField
              id="endorsement-policy"
              label="Endorsement Policy"
              name="policy"
              rows="4"
              value={this.state.request.policy}
              onChange={this.handleChange}
              className={classes.textField}
              margin="normal"
              multiline="true"
            />
            {request.params.map((param, index) => (
              <div className={classes.paramBlock}>
                <TextField
                  id="param"
                  className={classes.paramField}
                  label={`${index}  Param`}
                  name={param.id}
                  onChange={this.handleParamChange}
                  value={param.data}
                  margin="normal"
                />
                <Button
                  className={classes.paramBtn}
                  onClick={() => this.handleParams(param)}
                >
                  {param.text}
                </Button>
              </div>
            ))}
            <Button className={classes.button}>Submit</Button>
          </form>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ChaincodeInitForm);
