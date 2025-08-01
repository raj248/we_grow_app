import { FlatList, Linking, Pressable, View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { useEffect, useState } from 'react';
import * as Application from 'expo-application';
import { getStoredGuestUserId } from '~/utils/device-info'; // your AsyncStorage util

const items = [
  {
    label: "Current Subscription",
    url: "https://play.google.com/store/account/subscriptions?sku=premium_monthly&package=com.yourcompany.yourapp"
  },
  { label: "Contact Us", url: "mailto:support@example.com" },
  { label: "Rate Us", url: "https://play.google.com/store/apps/details?id=com.example.app" },
  { label: "FAQ", url: "https://example.com/faq" },
  { label: "Privacy Policy", url: "https://example.com/privacy" },
  { label: "Your ID", isStatic: true },
  { label: "App Version", isStatic: true },
];

export default function Settings() {
  const [guestId, setGuestId] = useState<string>('');
  const [appVersion, setAppVersion] = useState<string>('');

  useEffect(() => {
    getStoredGuestUserId().then((id) => setGuestId(id ?? 'Loading...'));
    setAppVersion(Application.nativeApplicationVersion ?? "1.0.0");
  }, []);

  return (
    <View className="flex-1 p-6">
      <Text variant="title1" className="mb-4 text-center">Settings</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.label}
        ItemSeparatorComponent={() => <View className="h-px bg-gray-200 my-2" />}
        renderItem={({ item }) => {
          if (item.label === "Your ID") {
            return (
              <View className="py-2">
                <Text className="text-base font-semibold">{item.label}</Text>
                <Text className="text-sm text-gray-600 mt-1">{guestId}</Text>
              </View>
            );
          }

          if (item.label === "App Version") {
            return (
              <View className="py-2">
                <Text className="text-base font-semibold">{item.label}</Text>
                <Text className="text-sm text-gray-600 mt-1">{appVersion}</Text>
              </View>
            );
          }

          return (
            <Pressable onPress={() => Linking.openURL(item.url ?? '')} className="py-2">
              <Text className="text-base text-blue-600 font-semibold">{item.label}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
