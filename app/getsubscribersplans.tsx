import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';

export default function GetSubscribersPlanModal() {
  return (
    <View>
      <Stack.Screen options={{ title: 'Get Subscribers Plans' }} />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
