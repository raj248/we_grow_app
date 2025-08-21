import { forwardRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './nativewindui/Text';

export const CoinHeader = forwardRef<typeof Pressable, { onPress?: () => void; coins?: number }>(
  ({ onPress, coins }, ref) => {
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
          paddingVertical: 4,
        }}>
        {({ pressed }) => (
          <View className="flex-row items-center gap-2">
            {/* <FontAwesome name="refresh" size={15} color="gray" /> */}
            {/* <Text className="ml-1 text-base font-semibold text-gray-700">100</Text> */}

            <Text variant={'footnote'} className="font-semibold text-gray-700">
              🪙 {coins}
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
