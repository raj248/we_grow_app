import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { Text } from '~/components/nativewindui/Text';


export default function Modal() {
  return (
    <>
      <View className='flex-1 p-4'>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        <Text>Debug Panel</Text>
      </View>
    </>
  );
}
