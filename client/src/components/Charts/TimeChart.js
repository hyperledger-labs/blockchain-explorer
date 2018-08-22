/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { chartDataType } from '../types';

const styles = theme => {
  const { type } = theme.palette;
  const dark = type === 'dark';
  return {
    content: {
      backgroundColor: dark ? '#3c3558' : undefined,
      '& .recharts-layer': {
        fill: dark ? 'rgb(42, 173, 230) !important' : '#5bc5c2 !important'
      },
      '& .recharts-scatter-line': {
        stroke: dark ? '#ffc145 !important' : '#5bc5c2 !important',
        strokeWidth: '2 !important'
      },
      '& .recharts-text': {
        fill: dark ? '#ffffff !important' : undefined
      },
      '& .recharts-cartesian-axis-line': {
        stroke: dark ? '#ffffff' : undefined
      }
    }
  };
};

export const TimeChart = ({ chartData, classes }) => (
  <div>
    <Card>
      <CardContent className={classes.content}>
        <ResponsiveContainer width="100%" height={255}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="datetime" className="datetime" />
            <YAxis domain={[0, chartData.dataMax]} dataKey="count" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter
              className="datetime"
              data={chartData.displayData}
              line={{}}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>
);

TimeChart.propTypes = {
  chartData: chartDataType.isRequired
};

export default withStyles(styles)(TimeChart);
