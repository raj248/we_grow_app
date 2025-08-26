import { forwardRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './nativewindui/Text';
import { useUserStore } from '~/stores/useUserStore';

export const CoinHeader = forwardRef<typeof Pressable, { onPress?: () => void; coins?: number }>(
  ({ onPress, coins }, ref) => {
    const tempCoins = coins ?? useUserStore.getState().coins;
    return (
      <Pressable
        onPress={onPress}
        className="mr-4"
        style={{
          flexDirection: 'row',
          alignItems: 'center',

          borderColor: 'red',
          borderWidth: 1,
          borderRadius: 24,

          backgroundColor: 'white',
          elevation: 5,

          paddingHorizontal: 10,
          paddingVertical: 2,
        }}>
        {({ pressed }) => (
          <View className="flex-row items-center justify-center gap-1">
            {/* <FontAwesome name="refresh" size={15} color="gray" /> */}
            {/* <Text className="ml-1 text-base font-semibold text-gray-700">100</Text> */}
            <Image
              source={require('~/assets/icons/rupee.png')}
              className="h-5 w-5"
              resizeMode="contain"
            />
            <Text variant={'subhead'} className="font-semibold text-gray-700">
              {coins ?? tempCoins}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }
);

CoinHeader.displayName = 'CoinHeader';

export const styles = StyleSheet.create({
  headerRight: {
    marginLeft: 15,
  },
});
