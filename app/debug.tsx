import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { Button } from '~/components/Button';
import { Text } from '~/components/nativewindui/Text';
import { fetchActiveUserCount } from '~/lib/api';


export default function Modal() {
  const [lastActiveCount, setLastActiveCount] = useState(-1);

  const trigger = () => {
    fetchActiveUserCount().then((res) => {
      console.log(res);
      const count = res.data ?? -1;
      setLastActiveCount(count);
    });


  }
  return (
    <>
      <View className='flex-1 p-4'>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        <Text>Debug Panel</Text>
        <Text>Last Active Users: {lastActiveCount}</Text>
        <Button title='Fetch Active User' onPress={trigger} />
      </View>
    </>
  );
}
