/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card, { CardContent } from 'material-ui/Card';

const TimeChart = ({ chartData }) => {

  return (
    <div>
      <Card >
        <CardContent >
          <ResponsiveContainer width="100%" height={255}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="datetime" />
              <YAxis domain={[0, chartData.dataMax]} dataKey="count" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={chartData.displayData} fill="#5bc5c2" line={{ stroke: '#5bc5c2', strokeWidth: 2 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div >
  );
}

export default TimeChart;
