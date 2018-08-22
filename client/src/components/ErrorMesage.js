import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Alert } from 'reactstrap';

const styles = theme => {
  return {
    error: {
      marginTop: 50,
      marginBottom: -95,
      paddingTop: 30,
      textAlign: 'center',
      width: '100%'
    }
  };
};

export const ErrorMessage = ({ message, classes }) => {
  return (
    <div className={classes.error}>
      <Alert color="danger">{message}</Alert>
    </div>
  );
};

export default withStyles(styles)(ErrorMessage);
