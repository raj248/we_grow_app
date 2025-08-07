import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';

export default function PromoteShortsPlanModal() {
  return (
    <View>
      <Stack.Screen options={{ title: 'Promote Shorts Plans' }} />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
