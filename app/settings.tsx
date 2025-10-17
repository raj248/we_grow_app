import { FlatList, Linking, Pressable, View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useEffect, useState } from 'react';
import * as Application from 'expo-application';
import { getStoredUserId } from '~/utils/device-info'; // your AsyncStorage util
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

const items = [
  // {
  //   label: 'Current Subscription',
  //   url: 'https://play.google.com/store/account/subscriptions?sku=premium_monthly&package=com.yourcompany.yourapp',
  // },
  { label: 'Contact Us', url: 'mailto:support@example.com' },
  { label: 'Rate Us', url: 'https://play.google.com/store/apps/details?id=com.example.app' },
  { label: 'FAQ', url: 'https://example.com/faq' },
  { label: 'Privacy Policy', url: 'https://example.com/privacy' },
  { label: 'Your ID', isStatic: true },
  { label: 'App Version', isStatic: true },
];

export default function Settings() {
  const [guestId, setGuestId] = useState<string>('');
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    getStoredUserId().then((id) => setGuestId(id ?? 'Loading...'));
    setAppVersion(Application.nativeApplicationVersion ?? '1.0.0');
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen
        options={{
          title: 'Settings',
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

      <FlatList
        data={items}
        keyExtractor={(item) => item.label}
        ItemSeparatorComponent={() => <View className="my-2 h-px bg-gray-200" />}
        renderItem={({ item }) => {
          if (item.label === 'Your ID') {
            return (
              <View className="py-2">
                <Text className="text-base font-semibold">{item.label}</Text>
                <Text className="mt-1 text-sm text-gray-600">{guestId}</Text>
              </View>
            );
          }

          if (item.label === 'App Version') {
            return (
              <View className="py-2">
                <Text className="text-base font-semibold">{item.label}</Text>
                <Text className="mt-1 text-sm text-gray-600">{appVersion}</Text>
              </View>
            );
          }

          return (
            <Pressable onPress={() => Linking.openURL(item.url ?? '')} className="py-2">
              <Text className="text-base font-semibold text-blue-600">{item.label}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
