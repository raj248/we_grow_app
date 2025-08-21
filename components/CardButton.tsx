import React from 'react';
import { Pressable, Text, View, Image } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/cn';

interface CardButtonProps {
  icon: any; // require('...') or { uri: '...' }
  title: string;
  description: string;
  bgColor?: string;
  borderColor?: string;
  onPress: () => void;
}

export const CardButton: React.FC<CardButtonProps> = ({
  icon,
  title,
  description,
  bgColor,
  borderColor,
  onPress,
}) => {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-1 items-center justify-center rounded-xl p-4'
        // 'shadow-md dark:shadow-lg',
      )}
      style={{
        backgroundColor: bgColor ?? 'rgba(255, 235, 231, 1)',
        borderColor: borderColor ?? 'rgb(182, 91, 34)',

        borderWidth: 1,
      }}
      android_ripple={{ color: isDarkColorScheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
      <Image source={icon} className="mb-2 h-16 w-16" resizeMode="contain" />
      <Text
        className={cn(
          'text-center text-base font-semibold',
          isDarkColorScheme ? 'text-white' : 'text-gray-800'
        )}>
        {title}
      </Text>
      <Text
        className={cn(
          'mt-1 text-center text-xs',
          isDarkColorScheme ? 'text-gray-300' : 'text-gray-500'
        )}>
        {description}
      </Text>
    </Pressable>
  );
};
