import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Button } from 'reactstrap';
import service from '../../services/chaincodeService';

const styles = theme => ({
  progress: {
    'text-align': 'center'
  },
  button: {
    display: 'block',
    'text-align': 'center'
  }
});

class ChaincodeAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFinish: false,
      title: '',
      message: '',
      success: false,
      error: ''
    };
  }

  async componentDidMount() {
    const { payload, reqType } = this.props;
    let resp = {};
    if (reqType === 'install') {
      resp = await service.installChaincode(payload);
      resp.title = 'Response of install chaincode';
    } else if (reqType === 'init') {
      resp = await service.instantiateChaincode(payload);
      resp.title = 'Response of instantiate chaincode';
    }
    this.setState({
      isFinish: true,
      message: resp.message,
      success: resp.success,
      title: resp.title,
      error: resp.error
    });
  }

  render() {
    const { isFinish, message, title, success, error } = this.state;
    const { classes, handleClose, reqType, payload } = this.props;
    if (!isFinish) {
      return (
        <Fragment>
          <DialogTitle id="alert-dialog-title">{'Chaincode...'}</DialogTitle>
          <CircularProgress size="20" />
          <DialogContent className={classes.progress} />
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {message}
              {error}
            </DialogContentText>
          </DialogContent>
          <DialogActions className={classes.button}>
            <Button
              className="btn-confirm"
              onClick={() => handleClose(reqType, success, payload)}
              color="primary"
            >
              CONFIRM
            </Button>
          </DialogActions>
        </Fragment>
      );
    }
  }
}

export default withStyles(styles)(ChaincodeAlert);
