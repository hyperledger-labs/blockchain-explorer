/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const styles = (theme) => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    date: {
      [`
        & .react-datepicker__input-container,
        & .react-datepicker-wrapper *,
        & .react-datepicker-wrapper
      `]: {
        width: '100% !important',
        textAlign: 'center',
      },
      '& .react-datepicker-popper': {
        minWidth: 320,
      },
      '& .react-datepicker__time-list': {
        paddingLeft: '0px',
      },
      '& .react-datepicker__input-container *': {
        borderColor: 'rgb(211, 210, 210)',
        borderRadius: 5,
        height: 36,
      },
      '& .react-datepicker': {
        backgroundColor: dark ? '#7165ae !important' : undefined,
      },
      '& .react-datepicker__time': {
        backgroundColor: dark ? '#7165ae !important' : undefined,
      },
      '& .react-datepicker__header': {
        backgroundColor: dark ? '#564d81 !important' : undefined,
      },
      '& .react-datepicker__input-container > input': {
        background: dark ? '#7165ae' : undefined,
        color: dark ? '#ffffff' : undefined,
      },
    },
  };
};

const DatePicker = (props) => {
  const { classes, ...rest } = props;
  return (
    <div className={classes.date}>
      <ReactDatePicker {...rest} />
    </div>
  );
};

export default withStyles(styles)(DatePicker);
