import React from 'react';
import { Pressable, Text, View, Image } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/cn';

interface CardButtonProps {
  icon: any; // require('...') or { uri: '...' }
  title: string;
  description: string;
  onPress: () => void;
}

export const CardButton: React.FC<CardButtonProps> = ({
  icon,
  title,
  description,
  onPress
}) => {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'rounded-xl p-4 items-center justify-center flex-1',
        'shadow-md dark:shadow-lg',
        isDarkColorScheme ? 'bg-gray-800' : 'bg-white'
      )}
      android_ripple={{ color: isDarkColorScheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
    >
      <Image source={icon} className="w-16 h-16 mb-2" resizeMode="contain" />
      <Text className={cn('text-center font-semibold text-base', isDarkColorScheme ? 'text-white' : 'text-gray-800')}>
        {title}
      </Text>
      <Text className={cn('text-center text-xs mt-1', isDarkColorScheme ? 'text-gray-300' : 'text-gray-500')}>
        {description}
      </Text>
    </Pressable>
  );
};
