/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Card, { CardContent } from 'material-ui/Card';
import { chartDataType } from '../types'

const TimeChart = ({ chartData }) => (
  <div>
    <Card>
      <CardContent className="CardContent">
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
  chartData: chartDataType.isRequired,
};

export default TimeChart;
