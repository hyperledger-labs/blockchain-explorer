import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import FontAwesome from 'react-fontawesome';

const styles = theme => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    container: {
      marginTop: '10%'
    },
    content: {
      color: dark ? '#ffffff' : undefined,
      textAlign: 'center'
    },
    header: {
      color: '#58c5c2 !important',
      fontSize: '12em',
      textAlign: 'center',
      height: 220
    },
    subHeader: {
      color: dark ? '#ffffff' : undefined,
      fontSize: '4em !important',
      textAlign: 'center'
    },
    errorIcon: {
      size: '30px 30px',
      textAlign: 'center',
      color: '#f9be53',
      fontSize: '80%'
    }
  };
};

export const PageNotFound = ({ classes }) => {
  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <FontAwesome
          name="exclamation-triangle"
          className={classes.errorIcon}
        />404
      </div>
      <div className={classes.subHeader}> Page not found </div>
      <div className={classes.content}>
        {' '}
        The page you are trying to access does not exist. Please check the URL
      </div>
    </div>
  );
};

export default withStyles(styles)(PageNotFound);
