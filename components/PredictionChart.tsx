
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type PredictionResult } from '../types';

interface PredictionChartProps {
  data: PredictionResult[];
}

const PredictionChart: React.FC<PredictionChartProps> = ({ data }) => {
  const chartData = data.sort((a, b) => a.digit - b.digit);
  const topPredictionDigit = data.reduce((max, p) => p.probability > max.probability ? p : max, data[0]).digit;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
        barCategoryGap="20%"
      >
        <XAxis dataKey="digit" stroke="#9ca3af" tick={{ fill: '#d1d5db' }} />
        <YAxis stroke="#9ca3af" tick={{ fill: '#d1d5db' }} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
        <Tooltip
          cursor={{ fill: 'rgba(107, 114, 128, 0.2)' }}
          contentStyle={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            borderColor: '#4b5563',
            color: '#e5e7eb'
          }}
          formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Confidence']}
          labelFormatter={(label) => `Digit: ${label}`}
        />
        <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.digit === topPredictionDigit ? '#22d3ee' : '#4b5563'} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PredictionChart;
