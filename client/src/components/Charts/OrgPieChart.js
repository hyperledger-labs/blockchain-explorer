/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
} from 'recharts';
import { transactionByOrgType } from '../types';


const colors = ['#0B091A', '#6283D0', '#0D3799', '#7C7C7C'];

class OrgPieChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        { value: 3, name: 'OrdererMSP', fill: '#0B091A' },
        { value: 40, name: 'Org1MSP', fill: '#6283D0' },
        { value: 23, name: 'Org2MSP', fill: '#0D3799' },
      ],
    };
  }

  componentDidMount() {
    const { transactionByOrg } = this.props;
    this.orgDataSetup(transactionByOrg);
  }

  componentWillReceiveProps(nextProps) {
    const { transactionByOrg } = this.props;
    if (nextProps.transactionByOrg !== transactionByOrg) {
      this.orgDataSetup(nextProps.transactionByOrg);
    }
  }

  orgDataSetup = (orgData) => {
    const temp = [];
    let index = 0;
    orgData.forEach((element) => {
      temp.push({
        value: parseInt(element.count, 10),
        name: element.creator_msp_id,
        fill: colors[index],
      });
      index += 1;
    });
    this.setState({ data: temp });
  }

  render() {
    const { data } = this.state;
    return (
      <div className="org-pie">
        <PieChart width={485} height={290} className="pie-chart">
          <Legend align="right" height={10} />
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label fill="fill" />
          <Tooltip />
        </PieChart>
      </div>
    );
  }
}

OrgPieChart.propTypes = {
  transactionByOrg: transactionByOrgType.isRequired,
};

export default OrgPieChart;
