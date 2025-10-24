import React from 'react';
import { Text, TextProps } from 'react-native';

export const ThemedText: React.FC<TextProps> = ({ children, ...props }) => {
  return (
    <Text accessibilityRole="text" {...props}>
      {children}
    </Text>
  );
};
