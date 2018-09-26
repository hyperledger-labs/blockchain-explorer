/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import MultiSelect from '@khanacademy/react-multi-select';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    multi: {
      '& .multi-select': {
        backgroundColor: dark ? '#7165ae !important' : undefined,
      },
      '& .multi-select .select-item': {
        textAlign: 'left !important',
      },
      '& .dropdown ': {
        backgroundColor: dark ? '#7165ae !important' : undefined,
      },
      '& .dropdown-heading': {
        backgroundColor: dark ? '#7165ae !important' : undefined,
        color: dark ? '#fff !important' : undefined,
      },
      '& .multi-select * input': {
        backgroundColor: dark ? '#7165ae! important' : undefined,
        color: dark ? '#fff !important' : undefined,
      },
      '& .multi-select .select-item,.dropdown-content': {
        backgroundColor: dark ? '#7165ae !important' : undefined,
        color: dark ? '#fff !important' : undefined,
      },
      '& .multi-select .select-item:hover': {
        backgroundColor: dark ? '#594aa5 !important' : undefined,
      },
      '& .multi-select .select-item:visited': {
        backgroundColor: dark ? '#594aa5 !important' : undefined,
      },
      '& ::-webkit-input-placeholder ': {
        /* Chrome/Opera/Safari */
        color: dark ? '#fff !important' : undefined,
      },
      '& .dropdown-heading-value': {
        color: dark ? '#fff !important' : undefined,
      },
    },
  };
};

const MultiSelectcomponent = (props) => {
  const { classes, ...rest } = props;
  return (
    <div className={classes.multi}>
      <MultiSelect {...rest} />
    </div>
  );
};

export default withStyles(styles)(MultiSelectcomponent);
