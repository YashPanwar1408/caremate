/// <reference types="nativewind/types" />

declare module '@expo/vector-icons/MaterialCommunityIcons' {
	import { ComponentType } from 'react';
	import { TextProps } from 'react-native';
	interface IconProps extends TextProps {
		name: string;
		size?: number;
		color?: string;
	}
	const Icon: ComponentType<IconProps>;
	export default Icon;
}

declare module '@expo/vector-icons' {
	import { ComponentType } from 'react';
	import { TextProps } from 'react-native';
	interface IconProps extends TextProps {
		name: string;
		size?: number;
		color?: string;
	}
	export const MaterialCommunityIcons: ComponentType<IconProps>;
}
