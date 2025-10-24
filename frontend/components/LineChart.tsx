import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { View } from 'react-native';

export type LineChartProps = {
  values: number[]; // 0..100 risk scores
  width?: number;
  height?: number;
  color?: string;
};

export const LineChart: React.FC<LineChartProps> = ({ values, width = 300, height = 140, color = '#0ea5e9' }) => {
  if (!values || values.length === 0) return <View style={{ width, height }} />;

  const padding = 16;
  const w = width - padding * 2;
  const h = height - padding * 2;
  const max = 100; // risk score max
  const stepX = values.length > 1 ? w / (values.length - 1) : 0;

  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    const y = padding + (1 - Math.min(Math.max(v, 0), max) / max) * h;
    return { x, y };
  });

  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  return (
    <Svg width={width} height={height}>
      {/* axes */}
      <Line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#94a3b8" strokeWidth={1} />
      <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#94a3b8" strokeWidth={1} />

      {/* path */}
      <Path d={d} stroke={color} strokeWidth={2} fill="none" />

      {/* dots */}
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
    </Svg>
  );
};
