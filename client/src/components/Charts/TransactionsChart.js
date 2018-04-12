/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';

class TransactionsCharts extends Component {
  constructor(props) {
    super(props);
    //this.transactionChartData = this.transactionChartData.bind(this);
    this.state = {
      transactionChartData: [{}]
    };
  }
/*
  transactionChartData() {
    //TODO get data

  }*/


  render() {
    const data = [
      { dtime: '12:16:51 pm ', transactions: 3534 },
      { dtime: '12:17:53 pm ', transactions: 23567789 },
      { dtime: '12:18:45 pm ', transactions: 3555 },
      { dtime: '12:19:55 pm ', transactions: 47458937 },
      { dtime: '12:20:51 pm ', transactions: 5 },
      { dtime: '12:21:58 pm ', transactions: 7537589 },
      { dtime: '12:22:35 pm ', transactions: 77445 },
    ];

    return (
      <div>
        <Card >
          <CardContent>
            <Typography >TRANSACTIONS/MIN</Typography>
            <LineChart width={1170} height={200} data={data}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis dataKey="dtime" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Line type="monotone" dataKey="transactions" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </CardContent>
        </Card>
      </div >
    );
  }
}
export default TransactionsCharts;