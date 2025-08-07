import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';

export default function BoostViewPlanModal() {
  return (
    <View>
      <Stack.Screen options={{ title: 'Boost View Plans' }} />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
