// app/(modals)/earn-or-purchase.tsx
export const unstable_settings = {
  presentation: 'modal',
};

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '~/components/nativewindui/Text';
import { Image, Pressable } from 'react-native';
import { router } from 'expo-router';
export default function EarnOrPurchase() {
  return (
    <SafeAreaView className="flex-1 px-4" edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Watch & Earn',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#f00',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <>
        <View
          className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-3 shadow-md"
          style={{ borderWidth: 1 }}>
          <View className="flex-row items-center gap-2">
            <Image
              source={require('~/assets/icons/rupee.png')}
              className="h-5 w-5"
              resizeMode="contain"
            />
            <Text className="text-base font-semibold ">Earn +10000 credits</Text>
          </View>
          <Pressable
            android_ripple={{ color: '#ccc' }}
            className="rounded-md border bg-gray-100 px-4 py-1"
            onPress={() => router.push('/watch-and-earn-modal')}>
            <Text className="font-semibold text-gray-700">GO</Text>
          </Pressable>
        </View>
      </>
      <View className="mb-2 flex-row items-center">
        <View className="h-[1.5px] flex-1 bg-gray-300" />
        <Text className="mx-2 font-medium text-gray-500">Or</Text>
        <View className="h-[1.5px] flex-1 bg-gray-300" />
      </View>
      <>
        <View
          className="mb-3 mt-1 flex-row items-center justify-between rounded-xl bg-white p-3 shadow-md"
          style={{ borderWidth: 1 }}>
          <View className="flex-row items-center gap-2">
            <Image
              source={require('~/assets/icons/rupee.png')}
              className="h-5 w-5"
              resizeMode="contain"
            />
            <Text className="text-base font-semibold ">Purchase Credits</Text>
          </View>
          <Pressable
            android_ripple={{ color: '#ccc' }}
            className="rounded-md border bg-gray-100 px-4 py-1"
            onPress={() => router.push('/(tabs)/top-up')}>
            <Text className="font-semibold text-gray-700">GO</Text>
          </Pressable>
        </View>
      </>
    </SafeAreaView>
  );
}
