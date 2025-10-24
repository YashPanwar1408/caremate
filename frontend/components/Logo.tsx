import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

// Simple heart + cross logo using SVG
export function Logo({ size = 96, color = '#0ea5e9' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* circular backdrop */}
      <Circle cx="50" cy="50" r="48" fill={color} opacity={0.1} />
      {/* medical cross */}
      <Path d="M45 28h10v14h14v10H55v14H45V52H31V42h14V28z" fill={color} opacity={0.8} />
      {/* heart outline */}
      <Path
        d="M50 76s-18-10.8-24-20.2C22 51 24.5 42 32.8 40c5.2-1.2 9.4 1.4 12.2 5 2.8-3.6 7-6.2 12.2-5C65.5 42 68 51 74 55.8 68 65.2 50 76 50 76z"
        fill={color}
        opacity={0.9}
      />
    </Svg>
  );
}
