/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
	ResponsiveContainer,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	AreaChart,
	Area
} from 'recharts';
import { chartDataType } from '../types';

export const TimeChart = ({ chartData }) => (
	<ResponsiveContainer width="100%" height={225}>
		<AreaChart data={chartData.displayData}>
			<defs>
				<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
					<stop offset="10%" stopColor="#D4E4FE" stopOpacity={1} />
					<stop offset="100%" stopColor="#D4E4FE" stopOpacity={0} />
				</linearGradient>
			</defs>
			<CartesianGrid strokeDasharray="3" vertical={false} />
			<XAxis
				dataKey="datetime"
				className="datetime"
				tickLine={false}
				axisLine={false}
				tickCount={5}
			/>
			<YAxis
				domain={[0, chartData.dataMax]}
				dataKey="count"
				tickLine={false}
				axisLine={false}
			/>
			<Tooltip
				cursor={{
					stroke: 'rgba(0, 0, 0, 0.23)',
					strokeWidth: 1,
					cy: '10'
				}}
			/>
			<Area
				type="monotone"
				dataKey="count"
				stroke="rgba(183, 211, 255, 1)"
				strokeWidth={2}
				fillOpacity={1}
				activeDot={{
					stroke: 'rgba(0, 0, 0, 0.23)',
					fill: 'rgba(255, 255, 255, 1)'
				}}
				fill="url(#colorUv)"
			/>
		</AreaChart>
	</ResponsiveContainer>
);

TimeChart.propTypes = {
	chartData: chartDataType.isRequired
};

export default TimeChart;
